from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import users, transactions, categories

# Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShiftCash API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],  # Puerto de Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)

app.include_router(transactions.router)

app.include_router(categories.router)

@app.get("/")
def root():
    return {"message": "ShiftCash API funcionando"}