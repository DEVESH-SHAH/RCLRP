"""
FastAPI Loyalty Rewards System - Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    auth, customers, stores, rewards, 
    transactions, qr, analytics, admin
)
from app.db.database import engine
from app.models import models

# Create database tables (commented out for demo without MSSQL)
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Loyalty Rewards System API",
    description="Complete loyalty rewards platform with QR-based redemption",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(stores.router, prefix="/api/stores", tags=["Stores"])
app.include_router(rewards.router, prefix="/api/rewards", tags=["Rewards"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(qr.router, prefix="/api/qr", tags=["QR System"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Loyalty Rewards System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
