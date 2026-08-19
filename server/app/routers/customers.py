"""
Customer Management Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Customer, Transaction, CustomerTier
from app.schemas.schemas import (
    Customer as CustomerSchema,
    CustomerCreate,
    CustomerUpdate,
    Transaction as TransactionSchema
)

router = APIRouter()

@router.post("/", response_model=CustomerSchema)
async def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    """Create a new customer"""
    # Check if phone already exists
    existing_customer = db.query(Customer).filter(Customer.phone == customer.phone).first()
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Check if email already exists (if provided)
    if customer.email:
        existing_email = db.query(Customer).filter(Customer.email == customer.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/", response_model=List[CustomerSchema])
async def get_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all customers with pagination"""
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers

@router.get("/{customer_id}", response_model=CustomerSchema)
async def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Get customer by ID"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer

@router.put("/{customer_id}", response_model=CustomerSchema)
async def update_customer(
    customer_id: int,
    customer_update: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """Update customer information"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Update only provided fields
    update_data = customer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}/transactions", response_model=List[TransactionSchema])
async def get_customer_transactions(
    customer_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get customer transaction history"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    transactions = db.query(Transaction)\
        .filter(Transaction.customer_id == customer_id)\
        .order_by(Transaction.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return transactions

@router.post("/{customer_id}/points/add")
async def add_points(
    customer_id: int,
    points: int,
    description: str = "Points added by admin",
    db: Session = Depends(get_db)
):
    """Add points to customer wallet (admin function)"""
    if points <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Points must be greater than 0"
        )
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Add points to wallet
    customer.wallet_points += points
    
    # Create transaction record
    transaction = Transaction(
        customer_id=customer.id,
        store_id=1,  # Default store for admin actions
        type="EARN",
        points=points,
        description=description
    )
    db.add(transaction)
    
    # Update tier based on total points earned
    total_earned = db.query(Transaction)\
        .filter(Transaction.customer_id == customer_id, Transaction.type == "EARN")\
        .with_entities(db.func.sum(Transaction.points))\
        .scalar() or 0
    
    if total_earned >= 10000:
        customer.tier = CustomerTier.PLATINUM
    elif total_earned >= 5000:
        customer.tier = CustomerTier.GOLD
    elif total_earned >= 1000:
        customer.tier = CustomerTier.SILVER
    else:
        customer.tier = CustomerTier.BRONZE
    
    db.commit()
    db.refresh(customer)
    
    return {
        "message": "Points added successfully",
        "customer_id": customer.id,
        "points_added": points,
        "new_balance": customer.wallet_points,
        "new_tier": customer.tier
    }

@router.get("/phone/{phone}")
async def get_customer_by_phone(
    phone: str,
    db: Session = Depends(get_db)
):
    """Get customer by phone number"""
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer
