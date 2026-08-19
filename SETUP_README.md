# 🚀 Loyalty Rewards System - Setup Guide

Complete setup instructions to run the Loyalty Rewards System on any PC.

---

## 📋 **SYSTEM REQUIREMENTS**

### **Required Software:**
- **Node.js**: Version 16.x or higher ([Download](https://nodejs.org/))
- **Python**: Version 3.8-3.12 ([Download](https://python.org/downloads/))
- **Git**: For version control ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### **Optional (for Database):**
- **SQL Server**: For production database ([Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads))
- **SQL Server Management Studio (SSMS)**: For database management

---

## 🏗️ **PROJECT STRUCTURE**

```
DEVESH/
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── server/                 # FastAPI Backend
│   ├── app/
│   ├── requirements.txt
│   ├── start_server.py
│   └── ...
├── database/              # Database Schema
│   └── LoyaltyDB_Schema.sql
├── SETUP_README.md        # This file
├── DATABASE_README.md     # Database setup guide
└── README.md             # Project documentation
```

---

## ⚡ **QUICK START (5 MINUTES)**

### **Step 1: Extract & Navigate**
```bash
# Extract the zip file
# Navigate to project directory
cd DEVESH
```

### **Step 2: Setup Backend**
```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python start_server.py
```

### **Step 3: Setup Frontend (New Terminal)**
```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Start the frontend
npm start
```

### **Step 4: Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 🎮 **HOW TO USE THE SYSTEM**

### **Demo Login Access:**
1. **Go to**: http://localhost:3000
2. **Click**: Any dashboard button (Store Manager, Marketing, Admin)
3. **Use Demo Logins**: Click any of the 3 demo login buttons
4. **Explore**: Full functionality with test data

### **Customer Access:**
1. **Go to**: http://localhost:3000
2. **Click**: "Customer Dashboard"
3. **Enter**: Any phone number (or skip)
4. **View**: QR code, rewards, transaction history

### **Available Demo Users:**
- **Admin Demo**: Full system access
- **Marketing Demo**: Campaign management & analytics
- **Store Manager Demo**: QR scanning & point redemption

---

## 🔧 **DETAILED SETUP INSTRUCTIONS**

### **Backend Setup (FastAPI + Python)**

#### **1. Python Environment Setup**
```bash
cd server

# Check Python version (should be 3.8+)
python --version

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows Command Prompt:
.venv\Scripts\activate.bat
# macOS/Linux:
source .venv/bin/activate
```

#### **2. Install Dependencies**
```bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
pip list
```

#### **3. Environment Configuration (Optional)**
```bash
# Create .env file (optional)
echo "DATABASE_URL=sqlite:///./loyalty.db" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env
echo "QR_SECRET_KEY=qr-signing-secret" >> .env
```

#### **4. Start Backend Server**
```bash
# Method 1: Using the start script (Recommended)
python start_server.py

# Method 2: Direct uvicorn command
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**✅ Backend Running**: You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### **Frontend Setup (React + Node.js)**

#### **1. Node.js Environment Setup**
```bash
cd client

# Check Node.js version (should be 16+)
node --version
npm --version
```

#### **2. Install Dependencies**
```bash
# Install all packages
npm install

# Verify installation
npm list --depth=0
```

#### **3. Start Frontend Development Server**
```bash
# Start React development server
npm start
```

**✅ Frontend Running**: Browser should open automatically to http://localhost:3000

---

## 🐛 **TROUBLESHOOTING**

### **Common Backend Issues:**

#### **Python Module Errors:**
```bash
# If you get "ModuleNotFoundError"
cd server
pip install -r requirements.txt

# If virtual environment issues
deactivate
rm -rf .venv  # or rmdir /s .venv on Windows
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

#### **Port Already in Use:**
```bash
# Kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

#### **Database Connection Errors:**
```
# These are expected in demo mode
# The system works with test data when database is not connected
# See DATABASE_README.md for database setup
```

### **Common Frontend Issues:**

#### **NPM Install Errors:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json  # or rmdir /s node_modules on Windows
npm install
```

#### **Port 3000 Already in Use:**
```bash
# The system will prompt to use a different port (e.g., 3001)
# Type 'y' to accept
```

#### **CORS Errors:**
```bash
# Ensure backend is running on port 8000
# Check proxy setting in client/package.json
```

---

## 🎯 **FEATURES AVAILABLE IN DEMO MODE**

### **✅ Fully Functional:**
- **Customer Dashboard**: QR codes, rewards, transaction history
- **Store Manager Dashboard**: QR scanning, point redemption
- **Marketing Dashboard**: Campaign management, analytics
- **Admin Dashboard**: User/store/reward management
- **Authentication**: Demo login system
- **QR Code System**: Generation, scanning, validation
- **Point Redemption**: Complete workflow
- **Transaction History**: Real-time updates
- **Form Validation**: Client-side validation
- **Toast Notifications**: User feedback system
- **Mobile Responsive**: Works on all devices

### **📊 Test Data Included:**
- **4 Demo Customers** with different point balances
- **3 Demo Stores** with managers
- **5 Demo Rewards** with various point requirements
- **Sample Transactions** and QR scan logs
- **Demo Campaigns** for marketing analytics

---

## 🔄 **DEVELOPMENT WORKFLOW**

### **Making Changes:**
1. **Backend Changes**: Edit files in `server/app/`, server auto-reloads
2. **Frontend Changes**: Edit files in `client/src/`, browser auto-refreshes
3. **Database Changes**: See `DATABASE_README.md`

### **Useful Commands:**
```bash
# Backend
cd server
python start_server.py          # Start backend
pip freeze > requirements.txt   # Update dependencies

# Frontend  
cd client
npm start                       # Start frontend
npm run build                   # Build for production
npm test                        # Run tests
```

### **Debug Mode:**
- **Frontend**: Open browser DevTools (F12) for console logs
- **Backend**: Check terminal output for API logs
- **QR Testing**: Use `window.testQR.generate()` in browser console

---

## 📱 **TESTING THE SYSTEM**

### **1. Customer Flow:**
1. Go to http://localhost:3000
2. Click "Customer Dashboard"
3. Enter phone number: `123-456-7890`
4. View QR code (auto-refreshes every 60 seconds)
5. Check rewards and redeem points
6. View transaction history

### **2. Store Manager Flow:**
1. Go to http://localhost:3000
2. Click "Store Manager" → Login with demo
3. Use QR scanner (or manual input for testing)
4. Enter points to redeem
5. Complete redemption process

### **3. Admin Flow:**
1. Go to http://localhost:3000  
2. Click "Admin Panel" → Login with demo
3. Add/edit customers, stores, rewards
4. View analytics and system logs

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Frontend Build:**
```bash
cd client
npm run build
# Serve the 'build' folder with any web server
```

### **Backend Deployment:**
```bash
cd server
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### **Environment Variables:**
```bash
# Production .env file
DATABASE_URL=your_production_database_url
SECRET_KEY=your_super_secret_key
QR_SECRET_KEY=your_qr_signing_key
ENVIRONMENT=production
```

---

## 📞 **SUPPORT**

### **If You Need Help:**
1. **Check Console Logs**: Browser DevTools (F12) and terminal output
2. **Verify Ports**: Backend (8000), Frontend (3000)
3. **Check Dependencies**: Node.js 16+, Python 3.8+
4. **Test with Demo Data**: System works without database
5. **Database Setup**: See `DATABASE_README.md` for production setup

### **System Status Check:**
- ✅ **Backend Health**: http://localhost:8000/docs
- ✅ **Frontend Health**: http://localhost:3000
- ✅ **Demo Login**: All 3 demo buttons should work
- ✅ **QR Generation**: Customer dashboard should show QR code
- ✅ **Point Redemption**: Store manager should be able to redeem points

**🎉 The system is designed to work out-of-the-box with test data - no database setup required for demo purposes!**

- History commit 10: minor doc tweak

- History commit 11: minor doc tweak

- History commit 12: minor doc tweak

- History commit 13: minor doc tweak

- History commit 14: minor doc tweak

- History commit 15: minor doc tweak

- History commit 16: minor doc tweak

- History commit 17: minor doc tweak

- History commit 18: minor doc tweak

- History commit 19: minor doc tweak

- History commit 20: minor doc tweak

- History commit 21: minor doc tweak

- History commit 22: minor doc tweak

- History commit 23: minor doc tweak

- History commit 24: minor doc tweak

- History commit 25: minor doc tweak

- History commit 26: minor doc tweak

- History commit 27: minor doc tweak

- History commit 28: minor doc tweak

- History commit 29: minor doc tweak
