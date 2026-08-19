"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# MSSQL Server connection string
# Format: mssql+pyodbc://username:password@server/database?driver=ODBC+Driver+17+for+SQL+Server
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mssql+pyodbc://sa:YourPassword123@localhost/LoyaltyRewards?driver=ODBC+Driver+17+for+SQL+Server"
)

engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        # For demo purposes, return None if database is not available
        print(f"Database not available: {e}")
        yield None
    finally:
        if 'db' in locals():
            db.close()
