from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

<<<<<<< HEAD
if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está definida")

=======
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()