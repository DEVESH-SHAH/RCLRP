"""
Security utilities for JWT tokens and QR code signing
"""
import hmac
import hashlib
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
QR_SECRET_KEY = os.getenv("QR_SECRET_KEY", "qr-signing-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
QR_TOKEN_EXPIRE_SECONDS = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_qr_token(customer_id: int, customer_name: str, available_points: int) -> Dict[str, Any]:
    """
    Generate a secure QR token with HMAC signature
    
    QR Token Format:
    {
        "customer_id": int,
        "name": str,
        "available_points": int,
        "exp": timestamp,
        "sig": HMAC signature
    }
    """
    # Create expiry timestamp (60 seconds from now)
    exp_timestamp = int((datetime.utcnow() + timedelta(seconds=QR_TOKEN_EXPIRE_SECONDS)).timestamp())
    
    # Create the payload
    payload = {
        "customer_id": customer_id,
        "name": customer_name,
        "available_points": available_points,
        "exp": exp_timestamp
    }
    
    # Create HMAC signature
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        QR_SECRET_KEY.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Add signature to payload
    payload["sig"] = signature
    
    return payload

def validate_qr_token(qr_token_data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate QR token signature and expiry
    
    Returns:
        (is_valid: bool, error_message: Optional[str])
    """
    try:
        # Check if required fields exist
        required_fields = ["customer_id", "name", "available_points", "exp", "sig"]
        for field in required_fields:
            if field not in qr_token_data:
                return False, f"Missing required field: {field}"
        
        # Extract signature
        provided_signature = qr_token_data.pop("sig")
        
        # Check expiry
        exp_timestamp = qr_token_data["exp"]
        current_timestamp = int(datetime.utcnow().timestamp())
        
        if current_timestamp > exp_timestamp:
            return False, "QR token has expired"
        
        # Verify signature
        payload_str = json.dumps(qr_token_data, sort_keys=True)
        expected_signature = hmac.new(
            QR_SECRET_KEY.encode('utf-8'),
            payload_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(provided_signature, expected_signature):
            return False, "Invalid QR token signature"
        
        return True, None
        
    except Exception as e:
        return False, f"Token validation error: {str(e)}"

def encode_qr_data(qr_token: Dict[str, Any]) -> str:
    """Encode QR token data to base64 string for QR code"""
    json_str = json.dumps(qr_token)
    encoded = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')
    return encoded

def decode_qr_data(qr_data: str) -> Optional[Dict[str, Any]]:
    """Decode base64 QR data back to token dictionary"""
    try:
        decoded_bytes = base64.b64decode(qr_data.encode('utf-8'))
        json_str = decoded_bytes.decode('utf-8')
        return json.loads(json_str)
    except Exception:
        return None

def generate_qr_code_data(customer_id: int, customer_name: str, available_points: int) -> str:
    """
    Complete QR code generation pipeline:
    1. Generate secure token
    2. Encode to base64
    3. Return QR-ready string
    """
    qr_token = generate_qr_token(customer_id, customer_name, available_points)
    qr_data = encode_qr_data(qr_token)
    return qr_data
