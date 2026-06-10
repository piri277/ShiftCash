from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
import requests as http_requests
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    new_user = models.User(
        username=user.username,
        email=user.email,
        password=auth.hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

"""@router.post("/login", response_model=schemas.TokenWithUser)  # ← nuevo schema
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = auth.create_access_token({"sub": str(user.user_id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "currency": user.currency,
        }
    }
"""

@router.post("/google", response_model=schemas.TokenWithUser)
def google_auth(body: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    resp = http_requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {body.access_token}"},
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Token de Google inválido")

    info = resp.json()
    email = info.get("email")
    name = info.get("name") or ""
    picture = info.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="No se pudo obtener el correo de Google")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        base_username = (name or email.split("@")[0])[:25]
        username = base_username
        if db.query(models.User).filter(models.User.username == username).first():
            username = email.split("@")[0][:25]
        if db.query(models.User).filter(models.User.username == username).first():
            username = f"user{abs(hash(email)) % 100000}"[:25]

        user = models.User(
            username=username,
            email=email,
            password=auth.hash_password(secrets.token_hex(32)),
            profile_pic=picture,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = auth.create_access_token({"sub": str(user.user_id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=schemas.TokenWithUser)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Definir credenciales predeterminadas
    DEFAULT_EMAIL = "admin@test.com"
    DEFAULT_PASSWORD = "123" # En producción esto jamás debe estar así

    # 2. Verificar si es el usuario predeterminado
    if credentials.email == DEFAULT_EMAIL and credentials.password == DEFAULT_PASSWORD:
        return {
            "access_token": auth.create_access_token({"sub": "999"}),
            "token_type": "bearer",
            "user": {
                "user_id": 999,
                "username": "Admin Temporal",
                "email": DEFAULT_EMAIL,
                "currency": "USD",
            }
        }

    # 3. Lógica original (si falla el predeterminado, busca en DB)
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = auth.create_access_token({"sub": str(user.user_id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }