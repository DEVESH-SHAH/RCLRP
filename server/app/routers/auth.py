"""
Authentication Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import Token, LoginRequest, User as UserSchema
from app.core.security import (
    verify_password, create_access_token, verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()
security = HTTPBearer()

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate user and return access token"""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    
    # Verify token
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user email from token
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Find user in database
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout():
    """Logout user (client should discard token)"""
    return {"message": "Successfully logged out"}

# Role-based access control helpers
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def require_store_manager(current_user: User = Depends(get_current_user)) -> User:
    """Require store manager role"""
    if current_user.role.value not in ["admin", "store_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Store manager access required"
        )
    return current_user

async def require_marketing(current_user: User = Depends(get_current_user)) -> User:
    """Require marketing role"""
    if current_user.role.value not in ["admin", "marketing"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Marketing access required"
        )
    return current_user
