"""
SQLAlchemy Models for Loyalty Rewards System
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MARKETING = "marketing"
    STORE_MANAGER = "store_manager"

class TransactionType(str, enum.Enum):
    EARN = "earn"
    REDEEM = "redeem"

class CustomerTier(str, enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"

class QRScanStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"
    EXPIRED = "expired"
    INVALID = "invalid"

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=True, index=True)
    tier = Column(Enum(CustomerTier), default=CustomerTier.BRONZE)
    wallet_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    transactions = relationship("Transaction", back_populates="customer")
    qr_scans = relationship("QRScanLog", back_populates="customer")

class Store(Base):
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    location = Column(String(200), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    manager = relationship("User", back_populates="managed_store")
    transactions = relationship("Transaction", back_populates="store")
    qr_scans = relationship("QRScanLog", back_populates="store")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    managed_store = relationship("Store", back_populates="manager", uselist=False)
    transactions = relationship("Transaction", back_populates="manager")
    qr_scans = relationship("QRScanLog", back_populates="manager")

class Reward(Base):
    __tablename__ = "rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)
    points_required = Column(Integer, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(Enum(TransactionType), nullable=False)
    points = Column(Integer, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="transactions")
    store = relationship("Store", back_populates="transactions")
    manager = relationship("User", back_populates="transactions")

class QRScanLog(Base):
    __tablename__ = "qr_scan_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(QRScanStatus), nullable=False)
    raw_token = Column(Text, nullable=True)
    error_message = Column(String(255), nullable=True)
    points_redeemed = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="qr_scans")
    store = relationship("Store", back_populates="qr_scans")
    manager = relationship("User", back_populates="qr_scans")

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    bonus_multiplier = Column(Float, default=1.0)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
