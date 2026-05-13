from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/categories", tags=["categories"])


# ── Obtener todas las categorías disponibles para el usuario ──
@router.get("/", response_model=list[schemas.CategoryOut])
def get_categories(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Category).filter(
        or_(
            models.Category.is_default == 1,
            models.Category.user_id == current_user.user_id
        )
    ).all()


# ── Crear categoría personalizada ──
@router.post("/", response_model=schemas.CategoryOut)
def create_category(
    data: schemas.CategoryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    nueva = models.Category(
        user_id=current_user.user_id,
        name_cat=data.name_cat,
        icon=data.icon,
        type=data.type,
        is_default=0
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


# ── Editar categoría personalizada ──
@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int,
    data: schemas.CategoryUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(models.Category).filter(
        models.Category.category_id == category_id,
        models.Category.user_id == current_user.user_id,  # valida propiedad
        models.Category.is_default == 0                    # no se pueden editar las predeterminadas
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada o no editable")

    category.name_cat = data.name_cat
    category.icon     = data.icon
    category.type     = data.type
    db.commit()
    db.refresh(category)
    return category


# ── Eliminar categoría personalizada ──
@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(models.Category).filter(
        models.Category.category_id == category_id,
        models.Category.user_id == current_user.user_id,  # valida propiedad
        models.Category.is_default == 0                    # no se pueden eliminar las predeterminadas
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada o no eliminable")

    db.delete(category)
    db.commit()