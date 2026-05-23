from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import users, transactions, categories, profile, budgets
from . import models
from . import scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShiftCash API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://shift-cash-spk1ah2yg-davidrojasmorales21-8377s-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "ShiftCash API funcionando"}