from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

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