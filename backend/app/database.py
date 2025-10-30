from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()  # Load .env variables

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    # Fallback for local development if env not set
    SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Expose effective DB info for diagnostics
DB_URL_EFFECTIVE = SQLALCHEMY_DATABASE_URL
DB_DIALECT = engine.dialect.name

# Global session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()