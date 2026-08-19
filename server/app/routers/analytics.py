"""
Analytics and Reporting Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List

from app.db.database import get_db
from app.models.models import (
    Customer, Store, Transaction, QRScanLog, 
    TransactionType, QRScanStatus, CustomerTier
)
from app.schemas.schemas import SystemAnalytics, StoreAnalytics, CustomerAnalytics

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_analytics(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard analytics"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Customer metrics
    total_customers = db.query(Customer).count()
    new_customers = db.query(Customer)\
        .filter(Customer.created_at >= start_date)\
        .count()
    
    # Transaction metrics
    total_transactions = db.query(Transaction)\
        .filter(Transaction.created_at >= start_date)\
        .count()
    
    points_earned = db.query(func.sum(Transaction.points))\
        .filter(
            Transaction.created_at >= start_date,
            Transaction.type == TransactionType.EARN
        )\
        .scalar() or 0
    
    points_redeemed = db.query(func.sum(Transaction.points))\
        .filter(
            Transaction.created_at >= start_date,
            Transaction.type == TransactionType.REDEEM
        )\
        .scalar() or 0
    
    # QR scan metrics
    total_scans = db.query(QRScanLog)\
        .filter(QRScanLog.timestamp >= start_date)\
        .count()
    
    successful_scans = db.query(QRScanLog)\
        .filter(
            QRScanLog.timestamp >= start_date,
            QRScanLog.status == QRScanStatus.SUCCESS
        )\
        .count()
    
    # Store performance
    store_performance = db.query(
        Store.id,
        Store.name,
        func.count(Transaction.id).label('transaction_count'),
        func.sum(Transaction.points).label('total_points')
    )\
    .join(Transaction, Store.id == Transaction.store_id)\
    .filter(Transaction.created_at >= start_date)\
    .group_by(Store.id, Store.name)\
    .order_by(desc('total_points'))\
    .limit(10)\
    .all()
    
    return {
        "period_days": days,
        "customer_metrics": {
            "total_customers": total_customers,
            "new_customers": new_customers,
            "growth_rate": round((new_customers / total_customers * 100) if total_customers > 0 else 0, 2)
        },
        "transaction_metrics": {
            "total_transactions": total_transactions,
            "points_earned": points_earned,
            "points_redeemed": points_redeemed,
            "redemption_rate": round((points_redeemed / points_earned * 100) if points_earned > 0 else 0, 2)
        },
        "qr_metrics": {
            "total_scans": total_scans,
            "successful_scans": successful_scans,
            "success_rate": round((successful_scans / total_scans * 100) if total_scans > 0 else 0, 2)
        },
        "top_stores": [
            {
                "store_id": row.id,
                "store_name": row.name,
                "transactions": row.transaction_count,
                "total_points": row.total_points or 0
            }
            for row in store_performance
        ]
    }

@router.get("/customers")
async def get_customer_analytics(db: Session = Depends(get_db)):
    """Get customer analytics"""
    # Total customers
    total_customers = db.query(Customer).count()
    
    # Active customers (with transactions in last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_customers = db.query(Customer)\
        .join(Transaction)\
        .filter(Transaction.created_at >= thirty_days_ago)\
        .distinct()\
        .count()
    
    # Tier distribution
    tier_distribution = {}
    for tier in CustomerTier:
        count = db.query(Customer).filter(Customer.tier == tier).count()
        tier_distribution[tier.value] = count
    
    # Average wallet balance
    avg_balance = db.query(func.avg(Customer.wallet_points)).scalar() or 0
    
    # Customer growth over time (last 12 months)
    growth_data = []
    for i in range(12):
        month_start = datetime.utcnow().replace(day=1) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        customers_in_month = db.query(Customer)\
            .filter(Customer.created_at < month_end)\
            .count()
        
        growth_data.append({
            "month": month_start.strftime("%Y-%m"),
            "total_customers": customers_in_month
        })
    
    return {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "tier_distribution": tier_distribution,
        "avg_wallet_balance": round(avg_balance, 2),
        "growth_data": list(reversed(growth_data))
    }

@router.get("/stores")
async def get_store_analytics(db: Session = Depends(get_db)):
    """Get store performance analytics"""
    stores_data = []
    
    stores = db.query(Store).filter(Store.active == True).all()
    
    for store in stores:
        # Transaction metrics
        total_transactions = db.query(Transaction)\
            .filter(Transaction.store_id == store.id)\
            .count()
        
        total_points_redeemed = db.query(func.sum(Transaction.points))\
            .filter(
                Transaction.store_id == store.id,
                Transaction.type == TransactionType.REDEEM
            )\
            .scalar() or 0
        
        # QR scan metrics
        total_scans = db.query(QRScanLog)\
            .filter(QRScanLog.store_id == store.id)\
            .count()
        
        successful_scans = db.query(QRScanLog)\
            .filter(
                QRScanLog.store_id == store.id,
                QRScanLog.status == QRScanStatus.SUCCESS
            )\
            .count()
        
        success_rate = (successful_scans / total_scans * 100) if total_scans > 0 else 0
        
        stores_data.append({
            "store_id": store.id,
            "store_name": store.name,
            "store_code": store.code,
            "location": store.location,
            "total_transactions": total_transactions,
            "total_points_redeemed": total_points_redeemed,
            "total_scans": total_scans,
            "successful_scans": successful_scans,
            "success_rate": round(success_rate, 2)
        })
    
    return {"stores": stores_data}

@router.get("/qr-scans")
async def get_qr_scan_analytics(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get QR scan analytics"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Scan status distribution
    status_distribution = {}
    for status in QRScanStatus:
        count = db.query(QRScanLog)\
            .filter(
                QRScanLog.timestamp >= start_date,
                QRScanLog.status == status
            )\
            .count()
        status_distribution[status.value] = count
    
    # Hourly scan patterns
    hourly_scans = []
    for hour in range(24):
        scans = db.query(QRScanLog)\
            .filter(
                QRScanLog.timestamp >= start_date,
                func.extract('hour', QRScanLog.timestamp) == hour
            )\
            .count()
        hourly_scans.append({"hour": hour, "scans": scans})
    
    # Daily scan trends
    daily_scans = []
    for i in range(days):
        day_start = start_date + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        scans = db.query(QRScanLog)\
            .filter(
                QRScanLog.timestamp >= day_start,
                QRScanLog.timestamp < day_end
            )\
            .count()
        
        successful = db.query(QRScanLog)\
            .filter(
                QRScanLog.timestamp >= day_start,
                QRScanLog.timestamp < day_end,
                QRScanLog.status == QRScanStatus.SUCCESS
            )\
            .count()
        
        daily_scans.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "total_scans": scans,
            "successful_scans": successful
        })
    
    return {
        "period_days": days,
        "status_distribution": status_distribution,
        "hourly_patterns": hourly_scans,
        "daily_trends": daily_scans
    }

@router.get("/campaigns")
async def get_campaign_analytics(db: Session = Depends(get_db)):
    """Get campaign performance analytics (mock data for now)"""
    # This would be expanded when campaign functionality is fully implemented
    return {
        "active_campaigns": 3,
        "total_campaigns": 12,
        "avg_engagement_rate": 65.4,
        "campaigns": [
            {
                "id": 1,
                "name": "Summer Bonus Points",
                "engagement_rate": 78.2,
                "points_distributed": 15420,
                "participants": 234
            },
            {
                "id": 2,
                "name": "Weekend Double Points",
                "engagement_rate": 65.1,
                "points_distributed": 8930,
                "participants": 156
            },
            {
                "id": 3,
                "name": "New Customer Welcome",
                "engagement_rate": 52.8,
                "points_distributed": 3450,
                "participants": 89
            }
        ]
    }
