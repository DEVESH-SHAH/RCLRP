"""
Transaction Management Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.models import Transaction, Customer, Store
from app.schemas.schemas import Transaction as TransactionSchema, TransactionCreate

router = APIRouter()

@router.post("/", response_model=TransactionSchema)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new transaction"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == transaction.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Verify store exists
    store = db.query(Store).filter(Store.id == transaction.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/", response_model=List[TransactionSchema])
async def get_transactions(
    customer_id: Optional[int] = None,
    store_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get transactions with optional filters"""
    query = db.query(Transaction)
    
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    if store_id:
        query = query.filter(Transaction.store_id == store_id)
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    
    transactions = query.order_by(Transaction.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return transactions

@router.get("/{transaction_id}", response_model=TransactionSchema)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Get transaction by ID"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction

@router.get("/analytics/summary")
async def get_transaction_summary(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get transaction analytics summary"""
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Total transactions
    total_transactions = db.query(Transaction)\
        .filter(Transaction.created_at >= start_date)\
        .count()
    
    # Points earned vs redeemed
    points_earned = db.query(Transaction)\
        .filter(
            Transaction.created_at >= start_date,
            Transaction.type == "EARN"
        )\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    points_redeemed = db.query(Transaction)\
        .filter(
            Transaction.created_at >= start_date,
            Transaction.type == "REDEEM"
        )\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    # Transaction counts by type
    earn_count = db.query(Transaction)\
        .filter(
            Transaction.created_at >= start_date,
            Transaction.type == "EARN"
        )\
        .count()
    
    redeem_count = db.query(Transaction)\
        .filter(
            Transaction.created_at >= start_date,
            Transaction.type == "REDEEM"
        )\
        .count()
    
    # Daily transaction trends
    daily_stats = []
    for i in range(days):
        day_start = start_date + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_transactions = db.query(Transaction)\
            .filter(
                Transaction.created_at >= day_start,
                Transaction.created_at < day_end
            )\
            .count()
        
        daily_stats.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "transactions": day_transactions
        })
    
    return {
        "period_days": days,
        "total_transactions": total_transactions,
        "points_earned": points_earned,
        "points_redeemed": points_redeemed,
        "earn_transactions": earn_count,
        "redeem_transactions": redeem_count,
        "redemption_rate": round((points_redeemed / points_earned * 100) if points_earned > 0 else 0, 2),
        "daily_trends": daily_stats
    }

@router.get("/customer/{customer_id}/summary")
async def get_customer_transaction_summary(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Get transaction summary for specific customer"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Total points earned and redeemed
    total_earned = db.query(Transaction)\
        .filter(
            Transaction.customer_id == customer_id,
            Transaction.type == "EARN"
        )\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    total_redeemed = db.query(Transaction)\
        .filter(
            Transaction.customer_id == customer_id,
            Transaction.type == "REDEEM"
        )\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    # Transaction counts
    total_transactions = db.query(Transaction)\
        .filter(Transaction.customer_id == customer_id)\
        .count()
    
    # Recent transactions
    recent_transactions = db.query(Transaction)\
        .filter(Transaction.customer_id == customer_id)\
        .order_by(Transaction.created_at.desc())\
        .limit(10)\
        .all()
    
    return {
        "customer_id": customer_id,
        "current_balance": customer.wallet_points,
        "total_earned": total_earned,
        "total_redeemed": total_redeemed,
        "total_transactions": total_transactions,
        "recent_transactions": recent_transactions
    }
