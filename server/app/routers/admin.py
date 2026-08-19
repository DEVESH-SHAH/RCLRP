"""
Admin Management Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import User, Store, Customer, Reward, Transaction
from app.schemas.schemas import (
    User as UserSchema, UserCreate,
    Store as StoreSchema, StoreCreate,
    Reward as RewardSchema, RewardCreate
)
from app.core.security import get_password_hash

router = APIRouter()

# User Management
@router.post("/users", response_model=UserSchema)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user (admin, marketing, store manager)"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user
    user_data = user.dict()
    user_data.pop('password')
    user_data['password_hash'] = hashed_password
    
    db_user = User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users", response_model=List[UserSchema])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all users"""
    users = db.query(User).filter(User.active == True).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Deactivate user (soft delete)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.active = False
    db.commit()
    return {"message": "User deactivated successfully"}

# Store Management
@router.post("/stores", response_model=StoreSchema)
async def create_store_admin(
    store: StoreCreate,
    db: Session = Depends(get_db)
):
    """Create a new store (admin function)"""
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

@router.put("/stores/{store_id}")
async def update_store(
    store_id: int,
    store_update: StoreCreate,
    db: Session = Depends(get_db)
):
    """Update store information"""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    update_data = store_update.dict()
    for field, value in update_data.items():
        setattr(store, field, value)
    
    db.commit()
    db.refresh(store)
    return store

@router.delete("/stores/{store_id}")
async def deactivate_store(
    store_id: int,
    db: Session = Depends(get_db)
):
    """Deactivate store"""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    store.active = False
    db.commit()
    return {"message": "Store deactivated successfully"}

# Customer Management
@router.get("/customers")
async def get_all_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all customers (admin view)"""
    customers = db.query(Customer).offset(skip).limit(limit).all()
    
    # Add transaction summary for each customer
    customer_data = []
    for customer in customers:
        total_earned = db.query(Transaction)\
            .filter(
                Transaction.customer_id == customer.id,
                Transaction.type == "EARN"
            )\
            .with_entities(db.func.sum(Transaction.points))\
            .scalar() or 0
        
        total_redeemed = db.query(Transaction)\
            .filter(
                Transaction.customer_id == customer.id,
                Transaction.type == "REDEEM"
            )\
            .with_entities(db.func.sum(Transaction.points))\
            .scalar() or 0
        
        customer_data.append({
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
            "tier": customer.tier,
            "wallet_points": customer.wallet_points,
            "total_earned": total_earned,
            "total_redeemed": total_redeemed,
            "created_at": customer.created_at
        })
    
    return {"customers": customer_data}

@router.post("/customers/{customer_id}/adjust-points")
async def adjust_customer_points(
    customer_id: int,
    points_adjustment: int,
    reason: str,
    db: Session = Depends(get_db)
):
    """Adjust customer points (admin function)"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Check if adjustment would result in negative balance
    new_balance = customer.wallet_points + points_adjustment
    if new_balance < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Adjustment would result in negative balance. Current: {customer.wallet_points}, Adjustment: {points_adjustment}"
        )
    
    # Update customer balance
    customer.wallet_points = new_balance
    
    # Create transaction record
    transaction_type = "EARN" if points_adjustment > 0 else "REDEEM"
    transaction = Transaction(
        customer_id=customer.id,
        store_id=1,  # Default admin store
        type=transaction_type,
        points=abs(points_adjustment),
        description=f"Admin adjustment: {reason}"
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(customer)
    
    return {
        "message": "Points adjusted successfully",
        "customer_id": customer.id,
        "points_adjustment": points_adjustment,
        "new_balance": customer.wallet_points,
        "reason": reason
    }

# System Overview
@router.get("/overview")
async def get_system_overview(db: Session = Depends(get_db)):
    """Get system overview statistics"""
    # Count totals
    total_customers = db.query(Customer).count()
    total_stores = db.query(Store).filter(Store.active == True).count()
    total_users = db.query(User).filter(User.active == True).count()
    total_rewards = db.query(Reward).filter(Reward.active == True).count()
    
    # Transaction statistics
    total_transactions = db.query(Transaction).count()
    total_points_issued = db.query(Transaction)\
        .filter(Transaction.type == "EARN")\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    total_points_redeemed = db.query(Transaction)\
        .filter(Transaction.type == "REDEEM")\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    # Customer tier distribution
    tier_counts = {}
    from app.models.models import CustomerTier
    for tier in CustomerTier:
        count = db.query(Customer).filter(Customer.tier == tier).count()
        tier_counts[tier.value] = count
    
    return {
        "totals": {
            "customers": total_customers,
            "stores": total_stores,
            "users": total_users,
            "rewards": total_rewards,
            "transactions": total_transactions
        },
        "points": {
            "total_issued": total_points_issued,
            "total_redeemed": total_points_redeemed,
            "outstanding": total_points_issued - total_points_redeemed,
            "redemption_rate": round((total_points_redeemed / total_points_issued * 100) if total_points_issued > 0 else 0, 2)
        },
        "customer_tiers": tier_counts
    }
