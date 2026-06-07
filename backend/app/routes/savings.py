from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import event
from sqlalchemy.orm.attributes import flag_modified
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from .. import models, schemas, auth
from ..database import get_db
import json

router = APIRouter(prefix="/saving-goals", tags=["saving-goals"])


# ── Configuración de redondeo por moneda ──────────────────────────────────────
CURRENCY_CONFIG = {
    "COP": {"min_unit": 100,  "decimal_places": 0},
    "USD": {"min_unit": 0.01, "decimal_places": 2},
    "EUR": {"min_unit": 0.01, "decimal_places": 2},
    "MXN": {"min_unit": 0.01, "decimal_places": 2},
}
DEFAULT_CURRENCY = "COP"


def get_min_unit(currency: str = DEFAULT_CURRENCY) -> float:
    return CURRENCY_CONFIG.get(currency.upper(), CURRENCY_CONFIG[DEFAULT_CURRENCY])["min_unit"]


def round_to_unit(value: float, unit: float) -> float:
    """Redondea value al múltiplo más cercano de unit."""
    if unit <= 0:
        return value
    # Usamos Decimal para evitar errores de punto flotante
    d_value = Decimal(str(value))
    d_unit  = Decimal(str(unit))
    rounded = (d_value / d_unit).quantize(Decimal("1"), rounding=ROUND_HALF_UP) * d_unit
    return float(rounded)


# ─────────────────────────────────────────────────────────────────────────────

def generate_daily_amounts(
    start_date: date,
    end_date: date,
    target_amount: Decimal,
    currency: str = DEFAULT_CURRENCY
):
    """
    Genera una distribución variable de montos diarios redondeados
    a la unidad mínima de la moneda indicada.

    - COP → múltiplos de 100
    - USD/EUR/MXN → múltiplos de 0.01
    La suma total es exactamente igual a target_amount.
    El último día absorbe el residuo del redondeo.
    """
    import random

    min_unit = get_min_unit(currency)

    if not end_date:
        end_date = start_date + timedelta(days=30)

    delta = end_date - start_date
    num_days = delta.days + 1

    if num_days <= 0:
        raise ValueError("La fecha de fin debe ser después de la fecha de inicio")

    target = float(target_amount)
    daily_amounts = {}

    # Caso trivial: un solo día
    if num_days == 1:
        daily_amounts["1"] = round_to_unit(target, min_unit)
        return daily_amounts

    # Caso: el target es tan pequeño que no alcanza para dar min_unit a cada día.
    # Se reparte lo que se pueda y el último día lleva el resto.
    if target < num_days * min_unit:
        base = round_to_unit(target / num_days, min_unit)
        for i in range(1, num_days):
            daily_amounts[str(i)] = base
        last = round_to_unit(target - base * (num_days - 1), min_unit)
        daily_amounts[str(num_days)] = last
        return daily_amounts

    random.seed(int(target))  # Seed determinista para reproducibilidad
    remaining = target

    for i in range(1, num_days):
        days_left_after_this = num_days - i

        # El máximo de hoy garantiza que queden al menos min_unit por cada día restante
        max_today = remaining - days_left_after_this * min_unit
        max_today = round_to_unit(max_today, min_unit)

        base = remaining / (days_left_after_this + 1)
        variation_factor = random.uniform(0.7, 1.3)
        amount = base * variation_factor

        amount_rounded = round_to_unit(amount, min_unit)
        amount_rounded = max(min_unit, min(amount_rounded, max_today))

        daily_amounts[str(i)] = amount_rounded
        remaining = round_to_unit(remaining - amount_rounded, min_unit)

    # El último día recibe exactamente lo que sobra (puede no ser múltiplo perfecto
    # si el target original tampoco lo era, pero para COP/monedas enteras siempre lo será)
    daily_amounts[str(num_days)] = round_to_unit(remaining, min_unit)

    return daily_amounts


def calculate_progress(completed_days: list, daily_amounts: dict, target_amount: float) -> dict:
    total_saved = sum(
        daily_amounts.get(str(day), 0)
        for day in completed_days
    )
    percentage = (total_saved / target_amount * 100) if target_amount > 0 else 0

    return {
        "total_saved": round(total_saved, 2),
        "percentage": round(percentage, 2),
        "days_completed": len(completed_days),
        "total_days": len(daily_amounts)
    }


# ── GET: Listar todas las metas del usuario actual (con progreso) ──
@router.get("/", response_model=list[schemas.SavingGoalOut])
def list_saving_goals(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(models.SavingGoal).filter(
        models.SavingGoal.user_id == current_user.user_id
    ).all()

    result = []
    for goal in goals:
        completed_days = goal.completed_days if isinstance(goal.completed_days, list) else json.loads(goal.completed_days or "[]")
        daily_amounts  = goal.daily_amounts  if isinstance(goal.daily_amounts,  dict) else json.loads(goal.daily_amounts  or "{}")

        progress_data = calculate_progress(completed_days, daily_amounts, float(goal.target_amount))

        result.append(schemas.SavingGoalOut(
            goal_id=goal.goal_id,
            user_id=goal.user_id,
            name=goal.name,
            target_amount=float(goal.target_amount),
            start_date=goal.start_date,
            end_date=goal.end_date,
            image_url=goal.image_url,
            completed_days=completed_days,
            daily_amounts=daily_amounts,
            progress=progress_data,
            created_at=goal.created_at
        ))

    return result


# ── GET: Obtener una meta específica con detalles de progreso ──
@router.get("/{goal_id}", response_model=dict)
def get_saving_goal_detail(
    goal_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.SavingGoal).filter(
        models.SavingGoal.goal_id == goal_id,
        models.SavingGoal.user_id == current_user.user_id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")

    completed_days = goal.completed_days if isinstance(goal.completed_days, list) else json.loads(goal.completed_days or "[]")
    daily_amounts  = goal.daily_amounts  if isinstance(goal.daily_amounts,  dict) else json.loads(goal.daily_amounts  or "{}")

    progress_data = calculate_progress(completed_days, daily_amounts, float(goal.target_amount))

    return schemas.SavingGoalOut(
        goal_id=goal.goal_id,
        user_id=goal.user_id,
        name=goal.name,
        target_amount=float(goal.target_amount),
        start_date=goal.start_date,
        end_date=goal.end_date,
        image_url=goal.image_url,
        completed_days=completed_days,
        daily_amounts=daily_amounts,
        progress=progress_data,
        created_at=goal.created_at
    )


# ── POST: Crear una nueva meta de ahorro ──
@router.post("/", response_model=schemas.SavingGoalOut)
def create_saving_goal(
    goal: schemas.SavingGoalCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    start_dt = goal.start_date or date.today()

    # currency viene del schema si existe, si no usa el default
    currency = getattr(goal, "currency", DEFAULT_CURRENCY) or DEFAULT_CURRENCY

    daily_amounts = generate_daily_amounts(
        start_dt,
        goal.end_date,
        Decimal(str(goal.target_amount)),
        currency=currency
    )

    new_goal = models.SavingGoal(
        user_id=current_user.user_id,
        name=goal.name,
        target_amount=goal.target_amount,
        start_date=start_dt,
        end_date=goal.end_date,
        image_url=goal.image_url,
        completed_days=[],
        daily_amounts=daily_amounts
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


# ── PUT: Actualizar una meta de ahorro ──
@router.put("/{goal_id}", response_model=schemas.SavingGoalOut)
def update_saving_goal(
    goal_id: int,
    goal_update: schemas.SavingGoalUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.SavingGoal).filter(
        models.SavingGoal.goal_id == goal_id,
        models.SavingGoal.user_id == current_user.user_id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")

    update_data = goal_update.model_dump(exclude_unset=True)

    if "name" in update_data:
        goal.name = update_data["name"]

    recalculate_daily_amounts = False

    if "target_amount" in update_data and goal.target_amount != update_data["target_amount"]:
        goal.target_amount = update_data["target_amount"]
        recalculate_daily_amounts = True

    if "end_date" in update_data and goal.end_date != update_data["end_date"]:
        goal.end_date = update_data["end_date"]
        recalculate_daily_amounts = True

    if recalculate_daily_amounts:
        currency = getattr(goal, "currency", DEFAULT_CURRENCY) or DEFAULT_CURRENCY
        goal.daily_amounts = generate_daily_amounts(
            goal.start_date,
            goal.end_date,
            Decimal(str(goal.target_amount)),
            currency=currency
        )
        flag_modified(goal, "daily_amounts")

    if "image_url" in update_data:
        goal.image_url = update_data["image_url"]

    db.commit()
    db.refresh(goal)

    completed_days = goal.completed_days if isinstance(goal.completed_days, list) else json.loads(goal.completed_days or "[]")
    daily_amounts  = goal.daily_amounts  if isinstance(goal.daily_amounts,  dict) else json.loads(goal.daily_amounts  or "{}")
    progress_data  = calculate_progress(completed_days, daily_amounts, float(goal.target_amount))

    return schemas.SavingGoalOut(
        goal_id=goal.goal_id,
        user_id=goal.user_id,
        name=goal.name,
        target_amount=float(goal.target_amount),
        start_date=goal.start_date,
        end_date=goal.end_date,
        image_url=goal.image_url,
        completed_days=completed_days,
        daily_amounts=daily_amounts,
        progress=progress_data,
        created_at=goal.created_at
    )


# ── DELETE: Eliminar una meta de ahorro ──
@router.delete("/{goal_id}")
def delete_saving_goal(
    goal_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.SavingGoal).filter(
        models.SavingGoal.goal_id == goal_id,
        models.SavingGoal.user_id == current_user.user_id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")

    db.delete(goal)
    db.commit()

    return {"message": "Meta de ahorro eliminada exitosamente"}


# ── POST: Alternar día como completado/no completado ──
@router.post("/{goal_id}/toggle-day/{day_number}")
def toggle_day(
    goal_id: int,
    day_number: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.SavingGoal).filter(
        models.SavingGoal.goal_id == goal_id,
        models.SavingGoal.user_id == current_user.user_id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")

    if not isinstance(goal.completed_days, list):
        goal.completed_days = []

    completed_days = list(goal.completed_days)

    if day_number in completed_days:
        completed_days.remove(day_number)
        action = "desmarcado"
    else:
        completed_days.append(day_number)
        action = "marcado"

    goal.completed_days = completed_days
    flag_modified(goal, "completed_days")
    db.commit()
    db.refresh(goal)

    daily_amounts_data = goal.daily_amounts if isinstance(goal.daily_amounts, dict) else json.loads(goal.daily_amounts or "{}")
    progress_data = calculate_progress(completed_days, daily_amounts_data, float(goal.target_amount))

    return {
        "goal_id": goal.goal_id,
        "day_number": day_number,
        "action": action,
        "completed_days": completed_days,
        "progress": progress_data
    }