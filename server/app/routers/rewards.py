"""
Rewards Management Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Reward
from app.schemas.schemas import Reward as RewardSchema, RewardCreate

router = APIRouter()

@router.post("/", response_model=RewardSchema)
async def create_reward(
    reward: RewardCreate,
    db: Session = Depends(get_db)
):
    """Create a new reward"""
    db_reward = Reward(**reward.dict())
    db.add(db_reward)
    db.commit()
    db.refresh(db_reward)
    return db_reward

@router.get("/", response_model=List[RewardSchema])
async def get_rewards(
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all rewards with pagination"""
    query = db.query(Reward)
    if active_only:
        query = query.filter(Reward.active == True)
    
    rewards = query.offset(skip).limit(limit).all()
    return rewards

@router.get("/{reward_id}", response_model=RewardSchema)
async def get_reward(
    reward_id: int,
    db: Session = Depends(get_db)
):
    """Get reward by ID"""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    return reward

@router.put("/{reward_id}", response_model=RewardSchema)
async def update_reward(
    reward_id: int,
    reward_update: RewardCreate,
    db: Session = Depends(get_db)
):
    """Update reward"""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    update_data = reward_update.dict()
    for field, value in update_data.items():
        setattr(reward, field, value)
    
    db.commit()
    db.refresh(reward)
    return reward

@router.delete("/{reward_id}")
async def delete_reward(
    reward_id: int,
    db: Session = Depends(get_db)
):
    """Deactivate reward (soft delete)"""
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    reward.active = False
    db.commit()
    return {"message": "Reward deactivated successfully"}

@router.get("/customer/{customer_id}/available")
async def get_available_rewards(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Get rewards available for customer based on their points"""
    from app.models.models import Customer
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Get rewards customer can afford
    affordable_rewards = db.query(Reward)\
        .filter(
            Reward.active == True,
            Reward.points_required <= customer.wallet_points
        )\
        .order_by(Reward.points_required)\
        .all()
    
    # Get all active rewards for reference
    all_rewards = db.query(Reward)\
        .filter(Reward.active == True)\
        .order_by(Reward.points_required)\
        .all()
    
    return {
        "customer_points": customer.wallet_points,
        "affordable_rewards": affordable_rewards,
        "all_rewards": all_rewards
    }
