<<<<<<< HEAD
from sqlalchemy import Column, Integer, SmallInteger, String, Numeric, Date, TIMESTAMP, ForeignKey, text, Boolean  # añade Boolean
=======
from sqlalchemy import Column, Integer, SmallInteger, String, Numeric, Date, TIMESTAMP, ForeignKey, text
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
<<<<<<< HEAD
    __tablename__ = "users"
=======
    __tablename__ = "user"
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617

    user_id     = Column(Integer, primary_key=True, index=True)
    username    = Column(String(25), nullable=False)
    email       = Column(String(150), nullable=False, unique=True)
    password    = Column(String(255), nullable=False)
    profile_pic = Column(String(150), nullable=True)
    currency    = Column(String(10), default="COP")
    created_at  = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    categories   = relationship("Category", back_populates="user", foreign_keys="Category.user_id")
    budgets      = relationship("Budget", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")


class Category(Base):
    __tablename__ = "category"

    category_id = Column(Integer, primary_key=True, index=True)
<<<<<<< HEAD
    user_id     = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=True)
=======
    user_id     = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=True)
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
    name_cat    = Column(String(25), nullable=False)
    icon        = Column(String(150), nullable=True)
    type        = Column(String(10), nullable=True)
    is_default  = Column(SmallInteger, default=0)

    user    = relationship("User", back_populates="categories", foreign_keys=[user_id])
    budgets = relationship("Budget", back_populates="category")


class Budget(Base):
    __tablename__ = "budget"

    budget_id   = Column(Integer, primary_key=True, index=True)
<<<<<<< HEAD
    user_id     = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
=======
    user_id     = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
    category_id = Column(Integer, ForeignKey("category.category_id", ondelete="CASCADE"), nullable=False)
    amount      = Column(Numeric(15, 2), nullable=False)
    month       = Column(SmallInteger, nullable=False)
    year        = Column(SmallInteger, nullable=False)

    user     = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")


class Transaction(Base):
    __tablename__ = "transactions"

<<<<<<< HEAD
    trans_id     = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id  = Column(Integer, ForeignKey("category.category_id", ondelete="SET NULL"), nullable=False)
    type         = Column(String(15), nullable=False)
    amount       = Column(Numeric(15, 2), nullable=False)
    description  = Column(String(250), nullable=True)
    trans_date   = Column(Date, server_default=text("CURRENT_DATE"))
    is_recurring = Column(Boolean, default=False)        # ← nuevo
    frequency    = Column(String(15), nullable=True)     # ← nuevo
=======
    trans_id    = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.category_id", ondelete="SET NULL"), nullable=False)
    type        = Column(String(15), nullable=False)
    amount      = Column(Numeric(15, 2), nullable=False)
    description = Column(String(250), nullable=True)
    trans_date  = Column(Date, server_default=text("CURRENT_DATE"))
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617

    user     = relationship("User", back_populates="transactions")
    category = relationship("Category")