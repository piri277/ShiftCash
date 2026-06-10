from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Dict
from datetime import date, datetime

# Authentication
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    user_id: int
    username: str
    email: str
    currency: str
    profile_pic: str | None = None  

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class GoogleAuthRequest(BaseModel):
    access_token: str

# Configuración de usuario
class UserUpdate(BaseModel):
    username: str
    email: EmailStr

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v

class CurrencyUpdate(BaseModel):
    currency: str

# Categorías 
class CategoryOut(BaseModel):
    category_id: int
    name_cat: str
    icon: Optional[str]
    type: str
    is_default: int

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name_cat: str
    icon: Optional[str] = "⭐"
    type: str

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v):
        if v not in ("expense", "income", "both"):
            raise ValueError("Tipo inválido")
        return v

    @field_validator("name_cat")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip()

class CategoryUpdate(BaseModel):
    name_cat: str
    icon: Optional[str] = "⭐"
    type: str

# Transacciones
class TransactionCreate(BaseModel):
    category_id: int
    type: str
    amount: float
    description: Optional[str] = None
    trans_date: Optional[date] = None
    is_recurring: bool = False
    frequency: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v):
        if v not in ("expense", "income"):
            raise ValueError("El tipo debe ser 'expense' o 'income'")
        return v

class TransactionOut(BaseModel):
    trans_id: int
    category_id: int
    category_name: Optional[str] = None
    type: str
    amount: float
    description: Optional[str]
    trans_date: date
    is_recurring: bool = False
    frequency: Optional[str] = None

    class Config:
        from_attributes = True

# Presupuestos
class BudgetBase(BaseModel):
    category_id: int
    name: str
    amount: float
    period_type: str  # 'daily', 'weekly', 'monthly', 'unique'
    month: Optional[int] = None
    year: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_permanent: bool = False

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v

    @field_validator("period_type")
    @classmethod
    def period_type_must_be_valid(cls, v):
        if v not in ("daily", "weekly", "monthly", "unique"):
            raise ValueError("El tipo de período debe ser 'daily', 'weekly', 'monthly' o 'unique'")
        return v

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    amount: Optional[float] = None
    period_type: Optional[str] = None
    month: Optional[int] = None
    year: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_permanent: Optional[bool] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("El monto debe ser mayor a 0")
        return v

    @field_validator("period_type")
    @classmethod
    def period_type_must_be_valid(cls, v):
        if v is not None and v not in ("daily", "weekly", "monthly", "unique"):
            raise ValueError("El tipo de período debe ser 'daily', 'weekly', 'monthly' o 'unique'")
        return v

class BudgetOut(BudgetBase):
    budget_id: int
    category_name: str
    category_icon: Optional[str]
    spent: float
    percentage: float

    class Config:
        from_attributes = True


# Metas de Ahorro
class SavingGoalCreate(BaseModel):
    name: str
    target_amount: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    image_url: Optional[str] = None

    @field_validator("target_amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("El monto objetivo debe ser mayor a 0")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip()

    @field_validator("end_date")
    @classmethod
    def end_date_must_be_future(cls, v):
        if v and v < date.today():
            raise ValueError("La fecha de fin debe ser hoy o en el futuro")
        return v


class SavingGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    end_date: Optional[date] = None
    image_url: Optional[str] = None

    @field_validator("target_amount")
    @classmethod
    def amount_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("El monto objetivo debe ser mayor a 0")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError("El nombre no puede estar vacío")
        return v.strip() if v else None


class SavingGoalOut(BaseModel):
    goal_id: int
    user_id: int
    name: str
    target_amount: float
    start_date: date
    end_date: date
    image_url: Optional[str]
    completed_days: List[int]
    daily_amounts: Dict[str, float]
    created_at: Optional[datetime] = None
    progress: Optional[Dict[str, float]] = None # Añadido para incluir el progreso calculado

    class Config:
        from_attributes = True


class ToggleDayRequest(BaseModel):
    """Solicitud para alternar un día como completado/no completado"""
    pass