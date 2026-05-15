from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/users", tags=["users"])

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