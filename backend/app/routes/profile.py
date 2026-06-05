import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/users", tags=["users"])

BASE_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB = 3


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_me(
    data: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.User).filter(
        models.User.email == data.email,
        models.User.user_id != current_user.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya está en uso")

    current_user.username = data.username
    current_user.email    = data.email
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def update_password(
    data: schemas.PasswordUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not auth.verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")

    current_user.password = auth.hash_password(data.new_password)
    db.commit()
    return {"message": "Contraseña actualizada"}


@router.put("/me/currency", response_model=schemas.UserOut)
def update_currency(
    data: schemas.CurrencyUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    current_user.currency = data.currency
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=204)
def delete_me(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()


@router.post("/me/picture", response_model=schemas.UserOut)
async def upload_picture(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPG, PNG o WebP.")

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"La imagen no puede superar {MAX_SIZE_MB}MB.")

    if current_user.profile_pic:
        old_filename = current_user.profile_pic.split("/")[-1]
        old_path = os.path.join(UPLOAD_DIR, old_filename)
        if os.path.exists(old_path):
            os.remove(old_path)

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    current_user.profile_pic = f"{BASE_URL}/static/uploads/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me/picture", response_model=schemas.UserOut)
def delete_picture(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile_pic:
        raise HTTPException(status_code=404, detail="No hay foto de perfil")

    filename = current_user.profile_pic.split("/")[-1]
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    current_user.profile_pic = None
    db.commit()
    db.refresh(current_user)
    return current_user