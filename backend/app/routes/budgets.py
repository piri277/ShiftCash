from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta, date
import calendar

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/budgets", tags=["budgets"])


def get_date_range(budget: models.Budget) -> tuple:
    """
    Calcula el rango de fechas según el period_type del presupuesto.
    Retorna (start_date, end_date) inclusive.
    Si is_permanent=True, ignora las fechas específicas y calcula el rango del período actual.
    """
    today = datetime.now().date()

    if budget.period_type == "daily":
        # Si es permanente, ignora start_date y usa hoy
        # Si no es permanente, usa start_date si existe, sino hoy
        target_date = today if budget.is_permanent else (budget.start_date if budget.start_date else today)
        return (target_date, target_date)

    if budget.period_type == "weekly":
        # Si es permanente, ignora start_date y calcula la semana actual
        # Si no es permanente, usa start_date si existe, sino hoy
        target_date = today if budget.is_permanent else (budget.start_date if budget.start_date else today)
        # Calcula el lunes de esa semana
        monday = target_date - timedelta(days=(target_date.weekday()))
        # El domingo es el lunes + 6 días
        sunday = monday + timedelta(days=6)
        return (monday, sunday)

    if budget.period_type == "monthly":
        # Si es permanente, ignora month/year y usa mes/año actual
        # Si no es permanente, usa month/year si existen, sino mes/año actual
        month = today.month if budget.is_permanent else (budget.month if budget.month else today.month)
        year = today.year if budget.is_permanent else (budget.year if budget.year else today.year)
        # Primer día del mes
        first_day = date(year, month, 1)
        # Último día del mes
        last_day_num = calendar.monthrange(year, month)[1]
        last_day = date(year, month, last_day_num)
        return (first_day, last_day)

    if budget.period_type == "unique":
        # Usa exactamente start_date y end_date
        return (budget.start_date, budget.end_date)

    # Default (no debería llegar aquí si validamos bien)
    return (today, today)


def calculate_spent(budget: models.Budget, db: Session, current_user: models.User) -> float:
    """
    Calcula el gasto total para el presupuesto.
    Suma todas las transacciones de tipo "expense" del usuario,
    en la categoría del presupuesto y dentro del rango de fechas.
    """
    start_date, end_date = get_date_range(budget)

    spent = db.query(models.Transaction).filter(
        and_(
            models.Transaction.user_id == current_user.user_id,
            models.Transaction.category_id == budget.category_id,
            models.Transaction.type == "expense",
            models.Transaction.trans_date >= start_date,
            models.Transaction.trans_date <= end_date,
        )
    ).with_entities(
        models.Transaction.amount
    ).all()

    total_spent = sum(float(s[0]) for s in spent)
    return total_spent


# ──────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[schemas.BudgetOut])
def get_budgets(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene todos los presupuestos del usuario actual."""
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.user_id
    ).all()

    result = []
    for budget in budgets:
        spent = calculate_spent(budget, db, current_user)
        percentage = (spent / float(budget.amount) * 100) if budget.amount > 0 else 0
        
        result.append(schemas.BudgetOut(
            budget_id=budget.budget_id,
            category_id=budget.category_id,
            name=budget.name,
            amount=float(budget.amount),
            period_type=budget.period_type,
            month=budget.month,
            year=budget.year,
            start_date=budget.start_date,
            end_date=budget.end_date,
            is_permanent=budget.is_permanent,
            category_name=budget.category.name_cat,
            category_icon=budget.category.icon,
            spent=spent,
            percentage=min(percentage, 100) if percentage >= 0 else 0  # Capped for visual display, but actual percentage can be > 100
        ))

    return result


@router.post("/", response_model=schemas.BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(
    data: schemas.BudgetCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Crea un nuevo presupuesto para el usuario actual."""
    # Verifica que la categoría existe y pertenece al usuario o es predeterminada
    category = db.query(models.Category).filter(
        or_(
            and_(
                models.Category.category_id == data.category_id,
                models.Category.user_id == current_user.user_id
            ),
            and_(
                models.Category.category_id == data.category_id,
                models.Category.is_default == 1
            )
        )
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría no existe o no pertenece al usuario"
        )

    nuevo_budget = models.Budget(
        user_id=current_user.user_id,
        category_id=data.category_id,
        name=data.name,
        amount=data.amount,
        period_type=data.period_type,
        month=data.month,
        year=data.year,
        start_date=data.start_date,
        end_date=data.end_date,
        is_permanent=data.is_permanent,
    )

    db.add(nuevo_budget)
    db.commit()
    db.refresh(nuevo_budget)

    spent = calculate_spent(nuevo_budget, db, current_user)
    percentage = (spent / float(nuevo_budget.amount) * 100) if nuevo_budget.amount > 0 else 0

    return schemas.BudgetOut(
        budget_id=nuevo_budget.budget_id,
        category_id=nuevo_budget.category_id,
        name=nuevo_budget.name,
        amount=float(nuevo_budget.amount),
        period_type=nuevo_budget.period_type,
        month=nuevo_budget.month,
        year=nuevo_budget.year,
        start_date=nuevo_budget.start_date,
        end_date=nuevo_budget.end_date,
        is_permanent=nuevo_budget.is_permanent,
        category_name=nuevo_budget.category.name_cat,
        category_icon=nuevo_budget.category.icon,
        spent=spent,
        percentage=min(percentage, 100)
    )


@router.put("/{budget_id}", response_model=schemas.BudgetOut)
def update_budget(
    budget_id: int,
    data: schemas.BudgetUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Actualiza un presupuesto existente (solo el propietario puede hacerlo)."""
    budget = db.query(models.Budget).filter(
        and_(
            models.Budget.budget_id == budget_id,
            models.Budget.user_id == current_user.user_id
        )
    ).first()

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado o no pertenece al usuario"
        )

    # Actualiza solo los campos que se proporcionan
    if data.category_id is not None:
        # Verifica que la nueva categoría existe
        category = db.query(models.Category).filter(
            or_(
                and_(
                    models.Category.category_id == data.category_id,
                    models.Category.user_id == current_user.user_id
                ),
                and_(
                    models.Category.category_id == data.category_id,
                    models.Category.is_default == 1
                )
            )
        ).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La categoría no existe o no pertenece al usuario"
            )
        budget.category_id = data.category_id

    if data.name is not None:
        budget.name = data.name
    if data.amount is not None:
        budget.amount = data.amount
    if data.period_type is not None:
        budget.period_type = data.period_type
    if data.month is not None:
        budget.month = data.month
    if data.year is not None:
        budget.year = data.year
    if data.start_date is not None:
        budget.start_date = data.start_date
    if data.end_date is not None:
        budget.end_date = data.end_date
    if data.is_permanent is not None:
        budget.is_permanent = data.is_permanent

    db.commit()
    db.refresh(budget)

    spent = calculate_spent(budget, db, current_user)
    percentage = (spent / float(budget.amount) * 100) if budget.amount > 0 else 0

    return schemas.BudgetOut(
        budget_id=budget.budget_id,
        category_id=budget.category_id,
        name=budget.name,
        amount=float(budget.amount),
        period_type=budget.period_type,
        month=budget.month,
        year=budget.year,
        start_date=budget.start_date,
        end_date=budget.end_date,
        is_permanent=budget.is_permanent,
        category_name=budget.category.name_cat,
        category_icon=budget.category.icon,
        spent=spent,
        percentage=min(percentage, 100)
    )


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina un presupuesto (solo el propietario puede hacerlo)."""
    budget = db.query(models.Budget).filter(
        and_(
            models.Budget.budget_id == budget_id,
            models.Budget.user_id == current_user.user_id
        )
    ).first()

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado o no pertenece al usuario"
        )

    db.delete(budget)
    db.commit()

    return None
