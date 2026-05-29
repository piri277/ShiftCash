from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import event
from sqlalchemy.orm.attributes import flag_modified
from datetime import date, timedelta
from decimal import Decimal
from .. import models, schemas, auth
from ..database import get_db
import json

router = APIRouter(prefix="/saving-goals", tags=["saving-goals"])


def generate_daily_amounts(start_date: date, end_date: date, target_amount: Decimal):
    """
    Genera una distribución variable de montos REDONDOS (múltiplos de 1000).
    La suma total debe ser exactamente igual a target_amount.
    
    Estrategia:
    - Solo montos redondos (múltiplos de 1000)
    - Variación orgánica pero controlada
    - Último día SIEMPRE positivo
    - Suma exacta al target (sin modificar el target)
    """
    import random

    if not end_date:
        # Si no hay fecha de fin, definimos un plazo por defecto (ej: 30 días)
        end_date = start_date + timedelta(days=30)

    delta = end_date - start_date
    num_days = delta.days + 1  # Incluir el día final

    if num_days <= 0:
        raise ValueError("La fecha de fin debe ser después de la fecha de inicio")

    target = int(float(target_amount))
    
    daily_amounts = {}
    
    if num_days == 1:
        daily_amounts["1"] = int(target)
    else:
        # Base: dividir entre días
        base_amount = target / num_days
        
        # Generar montos redondeados con variación
        # Todos en múltiplos de 1000
        random.seed(target)  # Seed determinista para reproducibilidad
        
        for i in range(1, num_days):  # Todos excepto el último
            # Variación: ±30% del base_amount
            variation_factor = random.uniform(0.7, 1.3)
            amount = base_amount * variation_factor
            # Redondear a múltiplo de 1000 más cercano
            amount_rounded = max(1000, int(round(amount / 1000) * 1000))
            daily_amounts[str(i)] = int(amount_rounded)
        
        # Último día: asegurar que cierre exacto y sea positivo
        current_sum = sum(daily_amounts.values())
        last_day_amount = target - current_sum
        
        # Si el último día es negativo o cero, redistribuir
        if last_day_amount <= 0:
            # Reducir los montos diarios proporcionalmente
            reduction = abs(last_day_amount) + 1000  # Asegurar que quede positivo
            num_to_reduce = num_days - 1
            reduction_per_day = reduction // num_to_reduce
            
            for i in range(1, num_days):
                if daily_amounts[str(i)] > 1000:
                    daily_amounts[str(i)] = max(1000, daily_amounts[str(i)] - reduction_per_day)
            
            # Recalcular suma
            current_sum = sum(daily_amounts.values())
            last_day_amount = target - current_sum
        
        # El último día debe ser exactamente lo que falta (sin redondear)
        daily_amounts[str(num_days)] = int(last_day_amount)
    
    return daily_amounts


def calculate_progress(completed_days: list, daily_amounts: dict, target_amount: float) -> dict:
    """
    Calcula el progreso de la meta basado en días completados.
    Retorna: {total_saved, percentage, days_completed, total_days}
    """
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
    """Obtiene todas las metas de ahorro del usuario autenticado con progreso"""
    goals = db.query(models.SavingGoal).filter(
        models.SavingGoal.user_id == current_user.user_id
    ).all()
    
    result = []
    for goal in goals:
        # Deserializar JSON
        completed_days = goal.completed_days if isinstance(goal.completed_days, list) else json.loads(goal.completed_days or "[]")
        daily_amounts = goal.daily_amounts if isinstance(goal.daily_amounts, dict) else json.loads(goal.daily_amounts or "{}")
        
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
    """Obtiene los detalles de una meta específica incluido el progreso"""
    goal = db.query(models.SavingGoal).filter(
        models.SavingGoal.goal_id == goal_id,
        models.SavingGoal.user_id == current_user.user_id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")
    
    # Deserializar JSON
    completed_days = goal.completed_days if isinstance(goal.completed_days, list) else json.loads(goal.completed_days or "[]")
    daily_amounts = goal.daily_amounts if isinstance(goal.daily_amounts, dict) else json.loads(goal.daily_amounts or "{}")
    
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
    """Crea una nueva meta de ahorro con distribución automática de montos diarios"""
    
    # Usar fecha actual si no se proporciona start_date
    start_dt = goal.start_date or date.today()
    
    # Generar distribución de montos diarios
    daily_amounts = generate_daily_amounts(start_dt, goal.end_date, Decimal(str(goal.target_amount)))
    
    # Crear la nueva meta con lista vacía de días completados
    new_goal = models.SavingGoal(
        user_id=current_user.user_id,
        name=goal.name,
        target_amount=goal.target_amount,
        start_date=start_dt,
        end_date=goal.end_date,
        image_url=goal.image_url,
        completed_days=[],  # Inicialmente vacío
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
    """Actualiza los detalles de una meta de ahorro"""
    goal = db.query(models.SavingGoal).filter(
        models.SavingGoal.goal_id == goal_id,
        models.SavingGoal.user_id == current_user.user_id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")
    
    # Convertir a dict solo con los campos que el usuario envió explícitamente en el JSON
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
        goal.daily_amounts = generate_daily_amounts(
            goal.start_date,
            goal.end_date,
            Decimal(str(goal.target_amount)) # Use the updated target_amount
        )
        # Marcar el campo JSON como modificado para que SQLAlchemy lo detecte
        flag_modified(goal, "daily_amounts")

    if "image_url" in update_data:
        # Ahora, si el usuario envía null, se asignará None y se borrará de la DB
        goal.image_url = update_data["image_url"]
    
    db.commit()
    db.refresh(goal)
    
    # Recalcular el progreso para la meta actualizada
    completed_days = goal.completed_days if isinstance(goal.completed_days, list) else json.loads(goal.completed_days or "[]")
    daily_amounts = goal.daily_amounts if isinstance(goal.daily_amounts, dict) else json.loads(goal.daily_amounts or "{}")
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


# ── DELETE: Eliminar una meta de ahorro ──
@router.delete("/{goal_id}")
def delete_saving_goal(
    goal_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina una meta de ahorro"""
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
    """Marca o desmarca un día como completado en la meta"""
    goal = db.query(models.SavingGoal).filter(
        models.SavingGoal.goal_id == goal_id,
        models.SavingGoal.user_id == current_user.user_id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Meta de ahorro no encontrada")
    
    # Deserializar lista de días completados
    # Asegurar que completed_days sea una lista antes de modificarla
    if not isinstance(goal.completed_days, list):
        goal.completed_days = []

    completed_days = goal.completed_days if isinstance(goal.completed_days, list) else json.loads(goal.completed_days or "[]")
    
    # Alternar el día
    if day_number in completed_days:
        completed_days.remove(day_number)
        action = "desmarcado"
    else:
        if day_number not in completed_days:
            completed_days.append(day_number)
        action = "marcado"
    
    # Guardar cambios - usar flag_modified para indicar que cambió la columna JSON
    goal.completed_days = completed_days
    flag_modified(goal, "completed_days")
    db.commit()
    db.refresh(goal)
    
    # Deserializar daily_amounts para calcular progreso
    daily_amounts_data = goal.daily_amounts if isinstance(goal.daily_amounts, dict) else json.loads(goal.daily_amounts or "{}")
    progress_data = calculate_progress(completed_days, daily_amounts_data, float(goal.target_amount))
    
    return {
        "goal_id": goal.goal_id,
        "day_number": day_number,
        "action": action,
        "completed_days": completed_days,
        "progress": progress_data
    }
