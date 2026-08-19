# 🗄️ Database Setup Guide - From Test Data to Production

Complete guide to eliminate hardcoded data and connect to Microsoft SQL Server database.

---

## 📋 **OVERVIEW**

This guide will help you transition from **test data mode** to **production database mode**:

- **Current State**: System uses hardcoded test data from `client/src/api/testData.js`
- **Target State**: System uses Microsoft SQL Server database with real data persistence
- **Backend**: Already has complete database models and API endpoints
- **Frontend**: Needs API integration instead of test data calls

---

## 🎯 **PREREQUISITES**

### **Required Software:**
- **Microsoft SQL Server**: 2017 or later
- **SQL Server Management Studio (SSMS)**: For database management
- **ODBC Driver 17 for SQL Server**: For Python connectivity

### **Download Links:**
- [SQL Server Developer Edition](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Free)
- [SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- [ODBC Driver 17](https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

---

## 🏗️ **STEP 1: DATABASE SETUP**

### **1.1 Install SQL Server**
```sql
-- Download and install SQL Server Developer Edition
-- During installation:
-- ✅ Choose "Mixed Mode" authentication
-- ✅ Set SA password (remember this!)
-- ✅ Add current user as SQL Server administrator
```

### **1.2 Create Database**
```bash
# Open SQL Server Management Studio (SSMS)
# Connect to your SQL Server instance
# Open the database schema file
```

**Execute the schema:**
```sql
-- In SSMS, open and execute: database/LoyaltyDB_Schema.sql
-- This will create:
-- ✅ LoyaltyDB database
-- ✅ All tables (CUSTOMERS, STORES, USERS, REWARDS, etc.)
-- ✅ Foreign key relationships
-- ✅ Indexes and constraints
```

### **1.3 Verify Database Creation**
```sql
-- Check if database was created
USE LoyaltyDB;

-- Verify tables exist
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;

-- Should show:
-- CUSTOMERS, STORES, USERS, REWARDS, TRANSACTIONS, QR_SCAN_LOGS, CAMPAIGNS
```

---

## 🔧 **STEP 2: BACKEND CONFIGURATION**

### **2.1 Update Database Connection**

**Edit `server/app/db/database.py`:**
```python
# Replace the DATABASE_URL with your SQL Server connection
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mssql+pyodbc://sa:YourPassword123@localhost/LoyaltyDB?driver=ODBC+Driver+17+for+SQL+Server"
)

# Update with your actual:
# - Username (sa or your user)
# - Password (your SA password)
# - Server (localhost or your server name)
# - Database name (LoyaltyDB)
```

### **2.2 Create Environment File**

**Create `server/.env`:**
```bash
# Database Configuration
DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost/LoyaltyDB?driver=ODBC+Driver+17+for+SQL+Server
CREATE_DB_TABLES=true

# Security Keys
SECRET_KEY=your-super-secret-key-change-in-production-12345
QR_SECRET_KEY=qr-signing-secret-key-change-in-production-67890
JWT_SECRET_KEY=jwt-secret-key-change-in-production-abcdef

# Application Settings
ENVIRONMENT=development
DEBUG=true
```

### **2.3 Enable Database Table Creation**

**Update `server/app/main.py`:**
```python
# Uncomment or modify the table creation section
import os
from app.models import models

# Enable table creation
if os.getenv("CREATE_DB_TABLES", "false").lower() == "true":
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
```

### **2.4 Test Database Connection**
```bash
cd server
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Test the connection
python -c "
from app.db.database import engine
try:
    connection = engine.connect()
    print('✅ Database connection successful!')
    connection.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"
```

---

## 🔄 **STEP 3: POPULATE INITIAL DATA**

### **3.1 Create Data Migration Script**

**Create `server/migrate_test_data.py`:**
```python
"""
Migrate test data from frontend to database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.models import Customer, Store, User, Reward, Transaction, TransactionType
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def migrate_test_data():
    db = SessionLocal()
    
    try:
        # Clear existing data (optional)
        print("🗑️ Clearing existing data...")
        db.query(Transaction).delete()
        db.query(Customer).delete()
        db.query(Reward).delete()
        db.query(User).delete()
        db.query(Store).delete()
        
        # Create Stores
        print("🏪 Creating stores...")
        stores_data = [
            {"store_name": "Downtown Coffee", "store_code": "DTC001", "location": "123 Main St, Downtown"},
            {"store_name": "Mall Outlet", "store_code": "MLO002", "location": "456 Shopping Center"},
            {"store_name": "Airport Branch", "store_code": "APT003", "location": "789 Airport Terminal"}
        ]
        
        stores = []
        for store_data in stores_data:
            store = Store(**store_data)
            db.add(store)
            stores.append(store)
        
        db.commit()
        
        # Create Users
        print("👥 Creating users...")
        users_data = [
            {"name": "Admin User", "email": "admin@company.com", "role": "admin", "password_hash": pwd_context.hash("admin123")},
            {"name": "Marketing Manager", "email": "marketing@company.com", "role": "marketing", "password_hash": pwd_context.hash("marketing123")},
            {"name": "Store Manager 1", "email": "manager1@company.com", "role": "manager", "store_id": stores[0].store_id, "password_hash": pwd_context.hash("manager123")},
            {"name": "Store Manager 2", "email": "manager2@company.com", "role": "manager", "store_id": stores[1].store_id, "password_hash": pwd_context.hash("manager123")}
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
        
        db.commit()
        
        # Create Customers
        print("👤 Creating customers...")
        customers_data = [
            {"name": "Alice Johnson", "phone": "123-456-7890", "email": "alice@example.com", "tier": "gold", "wallet_points": 2450},
            {"name": "Bob Smith", "phone": "234-567-8901", "email": "bob@example.com", "tier": "silver", "wallet_points": 1230},
            {"name": "Carol Davis", "phone": "345-678-9012", "email": "carol@example.com", "tier": "platinum", "wallet_points": 5670},
            {"name": "David Wilson", "phone": "456-789-0123", "email": "david@example.com", "tier": "bronze", "wallet_points": 450}
        ]
        
        customers = []
        for customer_data in customers_data:
            customer = Customer(**customer_data)
            db.add(customer)
            customers.append(customer)
        
        db.commit()
        
        # Create Rewards
        print("🎁 Creating rewards...")
        rewards_data = [
            {"name": "$5 Coffee Voucher", "description": "Enjoy a free coffee at any partner cafe", "points_required": 500, "active": True},
            {"name": "$10 Store Credit", "description": "Store credit for any purchase", "points_required": 1000, "active": True},
            {"name": "Free Lunch Combo", "description": "Complete lunch combo meal", "points_required": 750, "active": True},
            {"name": "Premium Membership", "description": "1 month premium membership benefits", "points_required": 2000, "active": True}
        ]
        
        for reward_data in rewards_data:
            reward = Reward(**reward_data)
            db.add(reward)
        
        db.commit()
        
        # Create Sample Transactions
        print("💳 Creating transactions...")
        transactions_data = [
            {"customer_id": customers[0].customer_id, "store_id": stores[0].store_id, "type": TransactionType.EARN, "points": 100, "description": "Purchase at Downtown Coffee"},
            {"customer_id": customers[0].customer_id, "store_id": stores[0].store_id, "type": TransactionType.REDEEM, "points": 200, "description": "Redeemed Coffee Voucher"},
            {"customer_id": customers[1].customer_id, "store_id": stores[1].store_id, "type": TransactionType.EARN, "points": 150, "description": "Purchase at Mall Outlet"},
            {"customer_id": customers[2].customer_id, "store_id": stores[0].store_id, "type": TransactionType.EARN, "points": 300, "description": "Large purchase bonus"}
        ]
        
        for transaction_data in transactions_data:
            transaction = Transaction(**transaction_data)
            db.add(transaction)
        
        db.commit()
        
        print("✅ Test data migration completed successfully!")
        print(f"📊 Created: {len(stores)} stores, {len(users_data)} users, {len(customers)} customers, {len(rewards_data)} rewards, {len(transactions_data)} transactions")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_test_data()
```

### **3.2 Run Data Migration**
```bash
cd server
.venv\Scripts\activate
python migrate_test_data.py
```

---

## 🔀 **STEP 4: FRONTEND API INTEGRATION**

### **4.1 Update Customer Dashboard**

**Replace test data calls with API calls in `client/src/pages/customer/CustomerDashboard.js`:**

```javascript
// BEFORE (Test Data):
const loadCustomerData = async () => {
  const customerData = getCustomerById(customerId);
  setCustomer(customerData);
};

// AFTER (Database API):
const loadCustomerData = async () => {
  try {
    const response = await customerApi.getCustomer(customerId);
    setCustomer(response.data);
  } catch (error) {
    console.error('Error loading customer:', error);
  }
};
```

```javascript
// BEFORE (Test Data):
const generateQRCode = async () => {
  const qrToken = generateMockQRToken(customer.id);
  setQrData(qrToken);
};

// AFTER (Database API):
const generateQRCode = async () => {
  try {
    const response = await qrApi.generateQR(customer.id);
    setQrData(response.data.qr_data);
  } catch (error) {
    console.error('Error generating QR:', error);
  }
};
```

```javascript
// BEFORE (Test Data):
const loadRewards = async () => {
  setRewards(mockRewards);
};

// AFTER (Database API):
const loadRewards = async () => {
  try {
    const response = await rewardsApi.getRewards();
    setRewards(response.data);
  } catch (error) {
    console.error('Error loading rewards:', error);
  }
};
```

### **4.2 Update Store Dashboard**

**Replace test data calls in `client/src/pages/store/StoreDashboard.js`:**

```javascript
// BEFORE (Test Data):
const handleQRScan = async (qrData) => {
  const qrToken = JSON.parse(atob(qrData));
  const customer = getCustomerById(qrToken.customer_id);
  setCustomerData(customer);
};

// AFTER (Database API):
const handleQRScan = async (qrData) => {
  try {
    const response = await qrApi.validateQR({ qr_data: qrData });
    setCustomerData(response.data.customer);
  } catch (error) {
    setError('Invalid or expired QR code');
  }
};
```

```javascript
// BEFORE (Test Data):
const handleRedeem = async () => {
  const result = redeemPoints(customerData.id, pointsToRedeem, storeId, managerId);
  if (result.success) {
    setSuccess('Points redeemed successfully!');
  }
};

// AFTER (Database API):
const handleRedeem = async () => {
  try {
    const response = await qrApi.redeemPoints({
      qr_data: scannedData,
      points_to_redeem: parseInt(pointsToRedeem),
      store_id: parseInt(storeId),
      manager_id: 1 // Get from auth context
    });
    setSuccess(`Redeemed ${pointsToRedeem} points successfully!`);
  } catch (error) {
    setError('Redemption failed');
  }
};
```

### **4.3 Update Admin Dashboard**

**Replace test data calls in `client/src/pages/admin/AdminDashboard.js`:**

```javascript
// BEFORE (Test Data):
const loadCustomers = async () => {
  setCustomers(mockCustomers);
};

// AFTER (Database API):
const loadCustomers = async () => {
  try {
    const response = await adminApi.getCustomers();
    setCustomers(response.data);
  } catch (error) {
    console.error('Error loading customers:', error);
  }
};
```

```javascript
// BEFORE (Test Data):
const handleAddCustomer = (customerData) => {
  const newCustomer = addCustomer(customerData);
  setCustomers(prev => [...prev, newCustomer]);
};

// AFTER (Database API):
const handleAddCustomer = async (customerData) => {
  try {
    const response = await adminApi.createCustomer(customerData);
    setCustomers(prev => [...prev, response.data]);
    toast.success('Customer created successfully!');
  } catch (error) {
    toast.error('Failed to create customer');
  }
};
```

---

## 🔄 **STEP 5: AUTHENTICATION INTEGRATION**

### **5.1 Update Login System**

**Replace demo login with real authentication in `client/src/pages/auth/LoginPage.js`:**

```javascript
// BEFORE (Demo Login):
const handleDemoLogin = (role) => {
  const userData = demoUsers[role];
  authUtils.setAuthData(mockToken, userData);
  navigate('/admin');
};

// AFTER (Real Login):
const handleLogin = async (email, password) => {
  try {
    const response = await authApi.login(email, password);
    const { access_token } = response.data;
    
    const userResponse = await authApi.getCurrentUser();
    const userData = userResponse.data;
    
    authUtils.setAuthData(access_token, userData);
    
    // Redirect based on role
    switch (userData.role) {
      case 'admin': navigate('/admin'); break;
      case 'marketing': navigate('/marketing'); break;
      case 'manager': navigate(`/store/${userData.store_id}`); break;
    }
  } catch (error) {
    setError('Invalid credentials');
  }
};
```

### **5.2 Create Real User Accounts**

**Use the migrated users or create new ones:**
```sql
-- In SSMS, create additional users
INSERT INTO USERS (name, email, password_hash, role) VALUES 
('John Admin', 'john@company.com', '$2b$12$...', 'admin'),
('Jane Marketing', 'jane@company.com', '$2b$12$...', 'marketing');

-- Or use the migration script accounts:
-- admin@company.com / admin123
-- marketing@company.com / marketing123
-- manager1@company.com / manager123
```

---

## 🧪 **STEP 6: TESTING DATABASE INTEGRATION**

### **6.1 Backend API Testing**
```bash
# Start backend with database
cd server
.venv\Scripts\activate
python start_server.py

# Test API endpoints
curl http://localhost:8000/api/customers/
curl http://localhost:8000/api/stores/
curl http://localhost:8000/api/rewards/
```

### **6.2 Frontend Integration Testing**
```bash
# Start frontend
cd client
npm start

# Test flows:
# 1. Login with real credentials
# 2. Customer dashboard with database data
# 3. QR generation with real HMAC
# 4. Store scanning with database validation
# 5. Admin CRUD operations
```

### **6.3 Database Verification**
```sql
-- Check data in SSMS
USE LoyaltyDB;

SELECT COUNT(*) as CustomerCount FROM CUSTOMERS;
SELECT COUNT(*) as TransactionCount FROM TRANSACTIONS;
SELECT COUNT(*) as RewardCount FROM REWARDS;

-- View recent transactions
SELECT TOP 10 * FROM TRANSACTIONS ORDER BY created_at DESC;

-- Check QR scan logs
SELECT TOP 10 * FROM QR_SCAN_LOGS ORDER BY timestamp DESC;
```

---

## 🔒 **STEP 7: SECURITY ENHANCEMENTS**

### **7.1 Update Security Keys**
```bash
# Generate secure keys
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
python -c "import secrets; print('QR_SECRET_KEY=' + secrets.token_urlsafe(32))"
```

### **7.2 Enable HTTPS (Production)**
```python
# In production, use HTTPS
# Update CORS settings in main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **7.3 Database Security**
```sql
-- Create dedicated application user (instead of SA)
CREATE LOGIN loyalty_app WITH PASSWORD = 'SecurePassword123!';
USE LoyaltyDB;
CREATE USER loyalty_app FOR LOGIN loyalty_app;
ALTER ROLE db_datareader ADD MEMBER loyalty_app;
ALTER ROLE db_datawriter ADD MEMBER loyalty_app;
```

---

## 📊 **STEP 8: VERIFICATION CHECKLIST**

### **✅ Database Setup:**
- [ ] SQL Server installed and running
- [ ] LoyaltyDB database created
- [ ] All tables created with relationships
- [ ] Test data migrated successfully
- [ ] Database connection working

### **✅ Backend Integration:**
- [ ] Environment variables configured
- [ ] Database connection string updated
- [ ] API endpoints returning database data
- [ ] Authentication working with database users
- [ ] QR generation using real HMAC signatures

### **✅ Frontend Integration:**
- [ ] Customer dashboard loading from database
- [ ] Store dashboard validating QR with database
- [ ] Admin dashboard CRUD operations working
- [ ] Real login replacing demo login
- [ ] All test data calls replaced with API calls

### **✅ Security:**
- [ ] Secure secret keys generated
- [ ] Database user permissions configured
- [ ] HTTPS enabled (production)
- [ ] Password hashing working
- [ ] JWT tokens properly signed

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Database:**
```sql
-- Production database setup
-- Use SQL Server Standard/Enterprise edition
-- Configure backup strategy
-- Set up monitoring and alerts
-- Configure connection pooling
```

### **Backend:**
```bash
# Production deployment
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### **Frontend:**
```bash
# Build for production
npm run build
# Deploy build folder to web server (IIS, Apache, Nginx)
```

---

## 🆘 **TROUBLESHOOTING**

### **Database Connection Issues:**
```bash
# Test ODBC connection
python -c "import pyodbc; print(pyodbc.drivers())"

# Check SQL Server service
services.msc  # Look for SQL Server services

# Test connection string
sqlcmd -S localhost -U sa -P YourPassword123
```

### **Migration Issues:**
```bash
# Reset database
DROP DATABASE LoyaltyDB;
# Re-run schema script
# Re-run migration script
```

### **API Integration Issues:**
```bash
# Check API responses
# Verify CORS settings
# Check authentication headers
# Validate request/response formats
```

**🎯 After completing this guide, your system will be fully production-ready with persistent data storage and real database integration!**
