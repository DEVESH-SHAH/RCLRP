"""
QR Code Generation, Validation, and Redemption Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import qrcode
import io
import base64
from PIL import Image

from app.db.database import get_db
from app.models.models import Customer, Store, User, Transaction, QRScanLog, TransactionType, QRScanStatus
from app.schemas.schemas import (
    QRGenerateRequest, QRGenerateResponse,
    QRValidateRequest, QRValidateResponse,
    QRRedeemRequest, QRRedeemResponse,
    Customer as CustomerSchema
)
from app.core.security import (
    generate_qr_code_data, decode_qr_data, validate_qr_token
)

router = APIRouter()

@router.post("/generate", response_model=QRGenerateResponse)
async def generate_qr_code(
    request: QRGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate QR code for customer with secure token
    
    Steps:
    1. Fetch customer data
    2. Generate secure token with expiry
    3. Create QR code image
    4. Return QR data and image
    """
    # Fetch customer
    customer = db.query(Customer).filter(Customer.id == request.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Generate QR data with secure token
    qr_data = generate_qr_code_data(
        customer_id=customer.id,
        customer_name=customer.name,
        available_points=customer.wallet_points
    )
    
    # Generate QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    # Create QR code image
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    qr_image.save(buffer, format='PNG')
    qr_image_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Calculate expiry time
    expires_at = datetime.utcnow() + timedelta(seconds=60)
    
    return QRGenerateResponse(
        qr_data=qr_data,
        qr_image_base64=qr_image_base64,
        expires_at=expires_at
    )

@router.post("/validate", response_model=QRValidateResponse)
async def validate_qr_code(
    request: QRValidateRequest,
    db: Session = Depends(get_db)
):
    """
    Validate QR token and return customer information
    
    Steps:
    1. Decode QR token
    2. Validate signature and expiry
    3. Fetch customer data
    4. Log scan attempt
    5. Return validation result
    """
    # Verify store and manager exist
    store = db.query(Store).filter(Store.id == request.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    manager = db.query(User).filter(User.id == request.manager_id).first()
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found"
        )
    
    # Decode QR token
    qr_token_data = decode_qr_data(request.qr_token)
    if not qr_token_data:
        # Log failed scan
        scan_log = QRScanLog(
            customer_id=None,
            store_id=request.store_id,
            manager_id=request.manager_id,
            status=QRScanStatus.INVALID,
            raw_token=request.qr_token,
            error_message="Invalid QR token format"
        )
        db.add(scan_log)
        db.commit()
        
        return QRValidateResponse(
            valid=False,
            error_message="Invalid QR token format"
        )
    
    # Validate token
    is_valid, error_message = validate_qr_token(qr_token_data)
    
    if not is_valid:
        # Determine status based on error
        status_map = {
            "expired": QRScanStatus.EXPIRED,
            "signature": QRScanStatus.INVALID
        }
        scan_status = QRScanStatus.FAILED
        for key, mapped_status in status_map.items():
            if key in error_message.lower():
                scan_status = mapped_status
                break
        
        # Log failed scan
        scan_log = QRScanLog(
            customer_id=qr_token_data.get("customer_id"),
            store_id=request.store_id,
            manager_id=request.manager_id,
            status=scan_status,
            raw_token=request.qr_token,
            error_message=error_message
        )
        db.add(scan_log)
        db.commit()
        
        return QRValidateResponse(
            valid=False,
            error_message=error_message
        )
    
    # Fetch customer
    customer_id = qr_token_data["customer_id"]
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    
    if not customer:
        # Log failed scan
        scan_log = QRScanLog(
            customer_id=customer_id,
            store_id=request.store_id,
            manager_id=request.manager_id,
            status=QRScanStatus.FAILED,
            raw_token=request.qr_token,
            error_message="Customer not found"
        )
        db.add(scan_log)
        db.commit()
        
        return QRValidateResponse(
            valid=False,
            error_message="Customer not found"
        )
    
    # Log successful scan
    scan_log = QRScanLog(
        customer_id=customer.id,
        store_id=request.store_id,
        manager_id=request.manager_id,
        status=QRScanStatus.SUCCESS,
        raw_token=request.qr_token
    )
    db.add(scan_log)
    db.commit()
    
    # Convert customer to schema
    customer_schema = CustomerSchema.from_orm(customer)
    
    return QRValidateResponse(
        valid=True,
        customer=customer_schema
    )

@router.post("/redeem", response_model=QRRedeemResponse)
async def redeem_points(
    request: QRRedeemRequest,
    db: Session = Depends(get_db)
):
    """
    Redeem points using QR token
    
    Steps:
    1. Validate QR token
    2. Check customer balance
    3. Deduct points atomically
    4. Create transaction record
    5. Log redemption
    6. Return success response
    """
    # Verify store and manager exist
    store = db.query(Store).filter(Store.id == request.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    manager = db.query(User).filter(User.id == request.manager_id).first()
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manager not found"
        )
    
    # Validate points amount
    if request.points_to_redeem <= 0:
        return QRRedeemResponse(
            success=False,
            error_message="Points to redeem must be greater than 0"
        )
    
    # Decode and validate QR token
    qr_token_data = decode_qr_data(request.qr_token)
    if not qr_token_data:
        return QRRedeemResponse(
            success=False,
            error_message="Invalid QR token format"
        )
    
    is_valid, error_message = validate_qr_token(qr_token_data)
    if not is_valid:
        return QRRedeemResponse(
            success=False,
            error_message=error_message
        )
    
    # Fetch customer
    customer_id = qr_token_data["customer_id"]
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    
    if not customer:
        return QRRedeemResponse(
            success=False,
            error_message="Customer not found"
        )
    
    # Check if customer has enough points
    if customer.wallet_points < request.points_to_redeem:
        return QRRedeemResponse(
            success=False,
            error_message=f"Insufficient balance. Available: {customer.wallet_points}, Required: {request.points_to_redeem}"
        )
    
    try:
        # Start transaction - deduct points atomically
        customer.wallet_points -= request.points_to_redeem
        
        # Create transaction record
        transaction = Transaction(
            customer_id=customer.id,
            store_id=request.store_id,
            manager_id=request.manager_id,
            type=TransactionType.REDEEM,
            points=request.points_to_redeem,
            description=f"Points redeemed at {store.name}"
        )
        db.add(transaction)
        
        # Log successful redemption
        scan_log = QRScanLog(
            customer_id=customer.id,
            store_id=request.store_id,
            manager_id=request.manager_id,
            status=QRScanStatus.SUCCESS,
            raw_token=request.qr_token,
            points_redeemed=request.points_to_redeem
        )
        db.add(scan_log)
        
        # Commit all changes
        db.commit()
        
        return QRRedeemResponse(
            success=True,
            transaction_id=transaction.id,
            remaining_balance=customer.wallet_points
        )
        
    except Exception as e:
        # Rollback on error
        db.rollback()
        return QRRedeemResponse(
            success=False,
            error_message=f"Redemption failed: {str(e)}"
        )

@router.get("/scan-logs/{store_id}")
async def get_scan_logs(
    store_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get recent QR scan logs for a store"""
    logs = db.query(QRScanLog)\
        .filter(QRScanLog.store_id == store_id)\
        .order_by(QRScanLog.timestamp.desc())\
        .limit(limit)\
        .all()
    
    return {"scan_logs": logs}
