"""
Pydantic Schemas for API Request/Response Models
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, TransactionType, CustomerTier, QRScanStatus

# Base schemas
class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class Customer(CustomerBase):
    id: int
    tier: CustomerTier
    wallet_points: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Store schemas
class StoreBase(BaseModel):
    name: str
    code: str
    location: str

class StoreCreate(StoreBase):
    manager_id: Optional[int] = None

class Store(StoreBase):
    id: int
    manager_id: Optional[int]
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str
    store_id: Optional[int] = None

class User(UserBase):
    id: int
    store_id: Optional[int]
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Reward schemas
class RewardBase(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    points_required: int

class RewardCreate(RewardBase):
    pass

class Reward(RewardBase):
    id: int
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Transaction schemas
class TransactionBase(BaseModel):
    customer_id: int
    store_id: int
    type: TransactionType
    points: int
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    manager_id: Optional[int] = None

class Transaction(TransactionBase):
    id: int
    manager_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# QR System schemas
class QRGenerateRequest(BaseModel):
    customer_id: int

class QRGenerateResponse(BaseModel):
    qr_data: str
    qr_image_base64: str
    expires_at: datetime

class QRValidateRequest(BaseModel):
    qr_token: str
    store_id: int
    manager_id: int

class QRValidateResponse(BaseModel):
    valid: bool
    customer: Optional[Customer] = None
    error_message: Optional[str] = None

class QRRedeemRequest(BaseModel):
    qr_token: str
    store_id: int
    manager_id: int
    points_to_redeem: int

class QRRedeemResponse(BaseModel):
    success: bool
    transaction_id: Optional[int] = None
    remaining_balance: Optional[int] = None
    error_message: Optional[str] = None

# Analytics schemas
class StoreAnalytics(BaseModel):
    store_id: int
    store_name: str
    total_redemptions: int
    total_points_redeemed: int
    total_scans: int
    success_rate: float

class CustomerAnalytics(BaseModel):
    total_customers: int
    active_customers: int
    tier_distribution: dict
    avg_wallet_balance: float

class SystemAnalytics(BaseModel):
    total_points_issued: int
    total_points_redeemed: int
    total_transactions: int
    redemption_rate: float
    top_stores: List[StoreAnalytics]

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Campaign schemas
class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    bonus_multiplier: float
    start_date: datetime
    end_date: datetime

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: int
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
