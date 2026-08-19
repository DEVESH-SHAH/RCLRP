# Loyalty Rewards System - Backend

FastAPI backend with MSSQL Server for the Loyalty Rewards System.

## 🏗️ Architecture

### Project Structure
```
server/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── db/
│   │   ├── __init__.py
│   │   └── database.py      # Database configuration & session management
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py        # SQLAlchemy ORM models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── customers.py     # Customer management
│   │   ├── stores.py        # Store management
│   │   ├── rewards.py       # Rewards catalog
│   │   ├── transactions.py  # Transaction history
│   │   ├── qr.py           # QR generation/validation/redemption
│   │   ├── analytics.py     # Analytics and reporting
│   │   └── admin.py         # Admin operations
│   └── core/
│       ├── __init__.py
│       └── security.py      # JWT & QR token security
├── requirements.txt         # Python dependencies
└── env.example             # Environment variables template
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

### 2. Configure Database
```bash
cp env.example .env
# Edit .env with your MSSQL Server credentials
```

### 3. Start Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🗄️ Database Models

### Customer
```python
class Customer(Base):
    id: int (Primary Key)
    name: str
    phone: str (Unique)
    email: str (Optional, Unique)
    tier: CustomerTier (bronze/silver/gold/platinum)
    wallet_points: int
    created_at: datetime
    updated_at: datetime
```

### Store
```python
class Store(Base):
    id: int (Primary Key)
    name: str
    code: str (Unique)
    location: str
    manager_id: int (Foreign Key to User)
    active: bool
    created_at: datetime
```

### User (Staff)
```python
class User(Base):
    id: int (Primary Key)
    name: str
    email: str (Unique)
    password_hash: str
    role: UserRole (admin/marketing/store_manager)
    store_id: int (Optional, Foreign Key to Store)
    active: bool
    created_at: datetime
```

### Transaction
```python
class Transaction(Base):
    id: int (Primary Key)
    customer_id: int (Foreign Key)
    store_id: int (Foreign Key)
    manager_id: int (Optional, Foreign Key)
    type: TransactionType (EARN/REDEEM)
    points: int
    description: str
    created_at: datetime
```

### QRScanLog
```python
class QRScanLog(Base):
    id: int (Primary Key)
    customer_id: int (Optional, Foreign Key)
    store_id: int (Foreign Key)
    manager_id: int (Foreign Key)
    status: QRScanStatus (SUCCESS/FAILED/EXPIRED/INVALID)
    raw_token: str
    error_message: str (Optional)
    points_redeemed: int (Optional)
    timestamp: datetime
```

## 🔐 Security Implementation

### QR Token Generation
```python
def generate_qr_token(customer_id: int, customer_name: str, available_points: int):
    payload = {
        "customer_id": customer_id,
        "name": customer_name,
        "available_points": available_points,
        "exp": current_timestamp + 60  # 60 second expiry
    }
    
    # Create HMAC signature
    signature = hmac.new(
        QR_SECRET_KEY.encode('utf-8'),
        json.dumps(payload, sort_keys=True).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    payload["sig"] = signature
    return payload
```

### QR Token Validation
```python
def validate_qr_token(qr_token_data: dict):
    # Extract and verify signature
    provided_signature = qr_token_data.pop("sig")
    
    # Check expiry
    if current_timestamp > qr_token_data["exp"]:
        return False, "QR token has expired"
    
    # Verify HMAC signature
    expected_signature = hmac.new(
        QR_SECRET_KEY.encode('utf-8'),
        json.dumps(qr_token_data, sort_keys=True).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(provided_signature, expected_signature):
        return False, "Invalid QR token signature"
    
    return True, None
```

### JWT Authentication
```python
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login with email/password
- `GET /me` - Get current user information
- `POST /logout` - Logout (client-side token removal)

### QR System (`/api/qr`)
- `POST /generate` - Generate QR code for customer
- `POST /validate` - Validate QR token and return customer info
- `POST /redeem` - Process point redemption
- `GET /scan-logs/{store_id}` - Get QR scan history for store

### Customer Management (`/api/customers`)
- `GET /` - List customers with pagination
- `POST /` - Create new customer
- `GET /{customer_id}` - Get customer by ID
- `PUT /{customer_id}` - Update customer information
- `GET /{customer_id}/transactions` - Get customer transaction history
- `POST /{customer_id}/points/add` - Add points to customer wallet
- `GET /phone/{phone}` - Get customer by phone number

### Store Management (`/api/stores`)
- `GET /` - List all active stores
- `POST /` - Create new store
- `GET /{store_id}` - Get store by ID
- `GET /{store_id}/transactions` - Get store transaction history
- `GET /{store_id}/analytics` - Get store performance analytics
- `GET /code/{store_code}` - Get store by code

### Analytics (`/api/analytics`)
- `GET /dashboard` - Comprehensive dashboard metrics
- `GET /customers` - Customer analytics and segmentation
- `GET /stores` - Store performance analytics
- `GET /qr-scans` - QR scan analytics and patterns
- `GET /campaigns` - Campaign performance metrics

### Admin Operations (`/api/admin`)
- `GET /overview` - System overview and statistics
- `POST /users` - Create system user
- `GET /users` - List all users
- `DELETE /users/{user_id}` - Deactivate user
- `GET /customers` - Admin customer view with extended data
- `POST /customers/{customer_id}/adjust-points` - Adjust customer points

## 🔄 QR Redemption Flow

### 1. QR Generation
```python
@router.post("/generate", response_model=QRGenerateResponse)
async def generate_qr_code(request: QRGenerateRequest, db: Session = Depends(get_db)):
    # 1. Fetch customer data
    customer = db.query(Customer).filter(Customer.id == request.customer_id).first()
    
    # 2. Generate secure token
    qr_data = generate_qr_code_data(customer.id, customer.name, customer.wallet_points)
    
    # 3. Create QR code image
    qr_image = create_qr_image(qr_data)
    
    # 4. Return QR data and image
    return QRGenerateResponse(qr_data=qr_data, qr_image_base64=qr_image, expires_at=expiry_time)
```

### 2. QR Validation
```python
@router.post("/validate", response_model=QRValidateResponse)
async def validate_qr_code(request: QRValidateRequest, db: Session = Depends(get_db)):
    # 1. Decode QR token
    qr_token_data = decode_qr_data(request.qr_token)
    
    # 2. Validate signature and expiry
    is_valid, error_message = validate_qr_token(qr_token_data)
    
    # 3. Fetch customer data
    customer = db.query(Customer).filter(Customer.id == qr_token_data["customer_id"]).first()
    
    # 4. Log scan attempt
    log_qr_scan(customer.id, request.store_id, request.manager_id, "SUCCESS" if is_valid else "FAILED")
    
    # 5. Return validation result
    return QRValidateResponse(valid=is_valid, customer=customer, error_message=error_message)
```

### 3. Point Redemption
```python
@router.post("/redeem", response_model=QRRedeemResponse)
async def redeem_points(request: QRRedeemRequest, db: Session = Depends(get_db)):
    # 1. Validate QR token
    is_valid, error = validate_qr_token(decode_qr_data(request.qr_token))
    
    # 2. Check customer balance
    if customer.wallet_points < request.points_to_redeem:
        return QRRedeemResponse(success=False, error_message="Insufficient balance")
    
    # 3. Process redemption atomically
    try:
        customer.wallet_points -= request.points_to_redeem
        
        transaction = Transaction(
            customer_id=customer.id,
            store_id=request.store_id,
            manager_id=request.manager_id,
            type=TransactionType.REDEEM,
            points=request.points_to_redeem
        )
        db.add(transaction)
        
        log_qr_scan(customer.id, request.store_id, request.manager_id, "SUCCESS", request.points_to_redeem)
        
        db.commit()
        
        return QRRedeemResponse(
            success=True,
            transaction_id=transaction.id,
            remaining_balance=customer.wallet_points
        )
    except Exception as e:
        db.rollback()
        return QRRedeemResponse(success=False, error_message=str(e))
```

## 📊 Analytics Implementation

### Dashboard Metrics
```python
@router.get("/dashboard")
async def get_dashboard_analytics(days: int = 30, db: Session = Depends(get_db)):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Customer metrics
    total_customers = db.query(Customer).count()
    new_customers = db.query(Customer).filter(Customer.created_at >= start_date).count()
    
    # Transaction metrics
    points_earned = db.query(func.sum(Transaction.points))\\
        .filter(Transaction.created_at >= start_date, Transaction.type == "EARN")\\
        .scalar() or 0
    
    points_redeemed = db.query(func.sum(Transaction.points))\\
        .filter(Transaction.created_at >= start_date, Transaction.type == "REDEEM")\\
        .scalar() or 0
    
    # QR scan metrics
    total_scans = db.query(QRScanLog).filter(QRScanLog.timestamp >= start_date).count()
    successful_scans = db.query(QRScanLog)\\
        .filter(QRScanLog.timestamp >= start_date, QRScanLog.status == "SUCCESS")\\
        .count()
    
    return {
        "customer_metrics": {"total": total_customers, "new": new_customers},
        "transaction_metrics": {"earned": points_earned, "redeemed": points_redeemed},
        "qr_metrics": {"total_scans": total_scans, "successful_scans": successful_scans}
    }
```

## 🛡️ Error Handling

### Global Exception Handler
```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "timestamp": datetime.utcnow().isoformat()}
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": exc.errors()}
    )
```

### Database Error Handling
```python
try:
    db.commit()
    return {"success": True}
except IntegrityError as e:
    db.rollback()
    raise HTTPException(status_code=400, detail="Data integrity violation")
except Exception as e:
    db.rollback()
    raise HTTPException(status_code=500, detail="Internal server error")
```

## 🧪 Testing

### Unit Tests
```python
def test_generate_qr_token():
    token = generate_qr_token(1, "John Doe", 1000)
    assert token["customer_id"] == 1
    assert token["name"] == "John Doe"
    assert token["available_points"] == 1000
    assert "sig" in token
    assert "exp" in token

def test_validate_qr_token():
    token = generate_qr_token(1, "John Doe", 1000)
    is_valid, error = validate_qr_token(token)
    assert is_valid == True
    assert error is None
```

### API Tests
```python
def test_qr_generation_endpoint(client):
    response = client.post("/api/qr/generate", json={"customer_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert "qr_data" in data
    assert "qr_image_base64" in data
    assert "expires_at" in data
```

## 🚀 Deployment

### Environment Configuration
```bash
# Production environment variables
DATABASE_URL=mssql+pyodbc://user:pass@prod-server/LoyaltyRewards?driver=ODBC+Driver+17+for+SQL+Server
SECRET_KEY=production-secret-key-min-32-characters
QR_SECRET_KEY=production-qr-signing-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
QR_TOKEN_EXPIRE_SECONDS=60
ENVIRONMENT=production
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    gnupg \\
    unixodbc-dev

# Install ODBC Driver for SQL Server
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \\
    && curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list \\
    && apt-get update \\
    && ACCEPT_EULA=Y apt-get install -y msodbcsql17

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Health Checks
```python
@app.get("/health")
async def health_check():
    try:
        # Check database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail="Service unavailable")
```

## 📝 API Documentation

The FastAPI application automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## 🔧 Configuration

### Database Configuration
```python
# app/db/database.py
DATABASE_URL = os.getenv("DATABASE_URL", "mssql+pyodbc://...")

engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_recycle=300
)
```

### CORS Configuration
```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

**FastAPI Backend for Loyalty Rewards System - Built with Python, SQLAlchemy, and MSSQL Server**
