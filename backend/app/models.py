from sqlalchemy import Column, Integer, SmallInteger, String, Numeric, Date, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "user"

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
    user_id     = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=True)
    name_cat    = Column(String(25), nullable=False)
    icon        = Column(String(150), nullable=True)
    type        = Column(String(10), nullable=True)
    is_default  = Column(SmallInteger, default=0)

    user    = relationship("User", back_populates="categories", foreign_keys=[user_id])
    budgets = relationship("Budget", back_populates="category")


class Budget(Base):
    __tablename__ = "budget"

    budget_id   = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.category_id", ondelete="CASCADE"), nullable=False)
    amount      = Column(Numeric(15, 2), nullable=False)
    month       = Column(SmallInteger, nullable=False)
    year        = Column(SmallInteger, nullable=False)

    user     = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")


class Transaction(Base):
    __tablename__ = "transactions"

    trans_id    = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.category_id", ondelete="SET NULL"), nullable=False)
    type        = Column(String(15), nullable=False)
    amount      = Column(Numeric(15, 2), nullable=False)
    description = Column(String(250), nullable=True)
    trans_date  = Column(Date, server_default=text("CURRENT_DATE"))

    user     = relationship("User", back_populates="transactions")
    category = relationship("Category")