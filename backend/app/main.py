from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import users, transactions, categories
<<<<<<< HEAD
from . import models
from . import scheduler

Base.metadata.create_all(bind=engine)
=======

# Base.metadata.create_all(bind=engine)
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617

app = FastAPI(title="ShiftCash API")

app.add_middleware(
    CORSMiddleware,
<<<<<<< HEAD
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
=======
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],  # Puerto de Vite
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
<<<<<<< HEAD
app.include_router(transactions.router)
=======

app.include_router(transactions.router)

>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
app.include_router(categories.router)

@app.get("/")
def root():
    return {"message": "ShiftCash API funcionando"}