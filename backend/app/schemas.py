from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator

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

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

from datetime import date
from typing import Optional

class CategoryOut(BaseModel):
    category_id: int
    name_cat: str
    icon: Optional[str]
    type: str

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    category_id: int
    type: str
    amount: float
    description: Optional[str] = None
    trans_date: Optional[date] = None

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

class CategoryOut(BaseModel):
    category_id: int
    name_cat: str
    icon: Optional[str]
    type: str
    is_default: int

    class Config:
        from_attributes = True