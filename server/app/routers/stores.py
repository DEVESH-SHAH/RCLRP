"""
Store Management Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Store, User, Transaction, QRScanLog
from app.schemas.schemas import Store as StoreSchema, StoreCreate

router = APIRouter()

@router.post("/", response_model=StoreSchema)
async def create_store(
    store: StoreCreate,
    db: Session = Depends(get_db)
):
    """Create a new store"""
    # Check if store code already exists
    existing_store = db.query(Store).filter(Store.code == store.code).first()
    if existing_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store code already exists"
        )
    
    db_store = Store(**store.dict())
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store

@router.get("/", response_model=List[StoreSchema])
async def get_stores(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all stores with pagination"""
    stores = db.query(Store).filter(Store.active == True).offset(skip).limit(limit).all()
    return stores

@router.get("/{store_id}", response_model=StoreSchema)
async def get_store(
    store_id: int,
    db: Session = Depends(get_db)
):
    """Get store by ID"""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    return store

@router.get("/{store_id}/transactions")
async def get_store_transactions(
    store_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get store transaction history"""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    transactions = db.query(Transaction)\
        .filter(Transaction.store_id == store_id)\
        .order_by(Transaction.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return {"transactions": transactions}

@router.get("/{store_id}/analytics")
async def get_store_analytics(
    store_id: int,
    db: Session = Depends(get_db)
):
    """Get store performance analytics"""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    # Get transaction statistics
    total_transactions = db.query(Transaction)\
        .filter(Transaction.store_id == store_id)\
        .count()
    
    total_points_redeemed = db.query(Transaction)\
        .filter(Transaction.store_id == store_id, Transaction.type == "REDEEM")\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    # Get QR scan statistics
    total_scans = db.query(QRScanLog)\
        .filter(QRScanLog.store_id == store_id)\
        .count()
    
    successful_scans = db.query(QRScanLog)\
        .filter(QRScanLog.store_id == store_id, QRScanLog.status == "SUCCESS")\
        .count()
    
    success_rate = (successful_scans / total_scans * 100) if total_scans > 0 else 0
    
    return {
        "store_id": store_id,
        "store_name": store.name,
        "total_transactions": total_transactions,
        "total_points_redeemed": total_points_redeemed,
        "total_scans": total_scans,
        "successful_scans": successful_scans,
        "success_rate": round(success_rate, 2)
    }

@router.get("/code/{store_code}")
async def get_store_by_code(
    store_code: str,
    db: Session = Depends(get_db)
):
    """Get store by store code"""
    store = db.query(Store).filter(Store.code == store_code).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    return store
