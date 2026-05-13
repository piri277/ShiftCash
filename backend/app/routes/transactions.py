from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from .. import models, schemas, auth
from ..database import get_db
from sqlalchemy import or_

router = APIRouter(prefix="/transactions", tags=["transactions"])


# ── Responsabilidad única: obtener categorías disponibles para el usuario ──
@router.get("/categories", response_model=list[schemas.CategoryOut])
def get_categories(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    categories = db.query(models.Category).filter(
        or_(
            models.Category.is_default == 1,
            models.Category.user_id == current_user.user_id
        )
    ).all()
    return categories


# ── Responsabilidad única: crear una transacción ──
@router.post("/", response_model=schemas.TransactionOut)
def create_transaction(
    transaction: schemas.TransactionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que la categoría existe y es accesible por el usuario
    category = db.query(models.Category).filter(
        models.Category.category_id == transaction.category_id,
        (models.Category.is_default == 1) |
        (models.Category.user_id == current_user.user_id)
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    new_transaction = models.Transaction(
        user_id=current_user.user_id,
        category_id=transaction.category_id,
        type=transaction.type,
        amount=transaction.amount,
        description=transaction.description,
        trans_date=transaction.trans_date or date.today(),  # fecha actual si no se ingresa
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@router.get("/", response_model=list[schemas.TransactionOut])
def get_transactions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == current_user.user_id)
        .order_by(models.Transaction.trans_date.desc())
        .all()
    )

    # Enriquece con el nombre de la categoría
    result = []
    for t in transactions:
        category = db.query(models.Category).filter(
            models.Category.category_id == t.category_id
        ).first()
        result.append(schemas.TransactionOut(
            trans_id=t.trans_id,
            category_id=t.category_id,
            category_name=category.name_cat if category else "Sin categoría",
            type=t.type,
            amount=float(t.amount),
            description=t.description,
            trans_date=t.trans_date,
        ))
    return result


@router.put("/{trans_id}", response_model=schemas.TransactionOut)
def update_transaction(
    trans_id: int,
    data: schemas.TransactionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.trans_id == trans_id,
        models.Transaction.user_id == current_user.user_id  # valida propiedad
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    transaction.category_id = data.category_id
    transaction.type        = data.type
    transaction.amount      = data.amount
    transaction.description = data.description
    transaction.trans_date  = data.trans_date or transaction.trans_date

    db.commit()
    db.refresh(transaction)

    category = db.query(models.Category).filter(
        models.Category.category_id == transaction.category_id
    ).first()

    return schemas.TransactionOut(
        trans_id=transaction.trans_id,
        category_id=transaction.category_id,
        category_name=category.name_cat if category else "Sin categoría",
        type=transaction.type,
        amount=float(transaction.amount),
        description=transaction.description,
        trans_date=transaction.trans_date,
    )


@router.delete("/{trans_id}", status_code=204)
def delete_transaction(
    trans_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.trans_id == trans_id,
        models.Transaction.user_id == current_user.user_id  # valida propiedad
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    db.delete(transaction)
    db.commit()