# 🎯 Loyalty Rewards System

A complete loyalty rewards platform with QR-based redemption, built with **React + JavaScript** frontend and **FastAPI + MSSQL Server** backend.

## 📚 **QUICK START GUIDES**

- **🚀 [SETUP_README.md](SETUP_README.md)** - Complete setup instructions for any PC
- **🗄️ [DATABASE_README.md](DATABASE_README.md)** - Database integration and production setup
- **📖 [README.md](README.md)** - This file (project overview and features)

## 🚀 Features

### Core Functionality
- **QR-Based Redemption**: Secure HMAC-signed QR codes with 60-second expiry
- **Multi-Tier Customer System**: Bronze, Silver, Gold, Platinum tiers
- **Real-Time Analytics**: Comprehensive reporting and insights
- **Role-Based Access Control**: Admin, Marketing, Store Manager roles

### Dashboards
1. **Customer Mobile Dashboard** - QR display, points balance, transaction history
2. **Store Manager Dashboard** - QR scanning, point redemption, reports
3. **Marketing Dashboard** - Analytics, campaigns, customer segmentation
4. **Admin Control Panel** - System management, user/store CRUD operations

### Security Features
- JWT authentication for staff users
- HMAC SHA256 signatures for QR tokens
- Token expiry and replay attack prevention
- Comprehensive audit logging

## 📁 Project Structure

```
├── server/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py        # FastAPI application entry point
│   │   ├── db/            # Database configuration
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routers/       # API route handlers
│   │   └── core/          # Security & utilities
│   ├── requirements.txt   # Python dependencies
│   └── env.example       # Environment variables template
│
├── client/                # React Frontend
│   ├── src/
│   │   ├── pages/         # Dashboard components
│   │   ├── api/           # API client functions
│   │   ├── App.js         # Main React application
│   │   └── index.js       # React entry point
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
│
└── README.md              # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MSSQL Server
- ODBC Driver 17 for SQL Server

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

### Database Setup

1. **Create database**
   ```sql
   CREATE DATABASE LoyaltyRewards;
   ```

2. **Update connection string in .env**
   ```
   DATABASE_URL=mssql+pyodbc://username:password@server/LoyaltyRewards?driver=ODBC+Driver+17+for+SQL+Server
   ```

3. **Tables will be created automatically** when you start the FastAPI server

## 🎯 Usage

### Access Points

1. **Home Page**: `http://localhost:3000`
   - Customer access via phone number
   - Navigation to all dashboards

2. **Customer Dashboard**: `http://localhost:3000/customer/1`
   - Mobile-optimized interface
   - QR code display with auto-refresh
   - Points balance and transaction history

3. **Store Manager**: `http://localhost:3000/store/1`
   - QR code scanner interface
   - Point redemption workflow
   - Store performance reports

4. **Marketing Dashboard**: `http://localhost:3000/marketing`
   - Customer analytics and segmentation
   - Campaign management
   - Engagement metrics

5. **Admin Panel**: `http://localhost:3000/admin`
   - System overview and statistics
   - User and store management
   - Customer point adjustments

### Demo Login
Use the demo login buttons on the login page for quick access:
- **Admin**: Full system access
- **Marketing**: Analytics and campaigns
- **Store Manager**: QR scanning and redemption

## 🔄 QR Redemption Workflow

1. **Customer generates QR** on mobile dashboard
2. **Store manager scans QR** using camera interface
3. **System validates** HMAC signature and expiry
4. **Manager inputs** points to redeem
5. **System processes** redemption atomically
6. **Transaction logged** with full audit trail

### QR Token Structure
```json
{
  "customer_id": 123,
  "name": "John Doe",
  "available_points": 2450,
  "exp": 1701234567,
  "sig": "hmac_signature_here"
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user info

### QR System
- `POST /api/qr/generate` - Generate QR code for customer
- `POST /api/qr/validate` - Validate QR token
- `POST /api/qr/redeem` - Process point redemption

### Customer Management
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer details
- `POST /api/customers/{id}/points/add` - Add points (admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/customers` - Customer analytics
- `GET /api/analytics/stores` - Store performance
- `GET /api/analytics/qr-scans` - QR scan statistics

### Admin Operations
- `GET /api/admin/overview` - System overview
- `POST /api/admin/users` - Create system user
- `GET /api/admin/customers` - Customer management
- `POST /api/admin/customers/{id}/adjust-points` - Adjust points

## 🔒 Security Features

### QR Token Security
- **HMAC SHA256** signatures prevent tampering
- **60-second expiry** prevents replay attacks
- **Base64 encoding** for QR code compatibility
- **Signature validation** on every scan

### Authentication
- **JWT tokens** for API authentication
- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **Token expiry** and refresh handling

### Audit Logging
- All QR scans logged with status
- Transaction history with timestamps
- User action tracking
- Failed authentication attempts

## 🎨 UI/UX Features

### Customer Dashboard (Mobile-First)
- **Responsive design** optimized for mobile
- **Auto-refreshing QR codes** every 50 seconds
- **Tier-based styling** with color coding
- **Transaction history** with filtering
- **Available rewards** with redemption status

### Store Manager Interface
- **Fast QR scanning** with camera integration
- **Step-by-step redemption** workflow
- **Real-time validation** feedback
- **Success/error handling** with clear messaging
- **Performance reports** and analytics

### Marketing Dashboard
- **Interactive charts** with Recharts
- **Customer segmentation** tools
- **Campaign performance** tracking
- **Engagement metrics** visualization
- **Tier distribution** analysis

### Admin Panel
- **System overview** with key metrics
- **CRUD operations** for all entities
- **User management** with role assignment
- **Point adjustment** tools
- **System health** monitoring

## 🚀 Production Deployment

### Environment Variables
```bash
# Database
DATABASE_URL=mssql+pyodbc://user:pass@server/db?driver=ODBC+Driver+17+for+SQL+Server

# Security
SECRET_KEY=your-super-secret-key-min-32-chars
QR_SECRET_KEY=qr-signing-secret-key

# JWT Configuration
ACCESS_TOKEN_EXPIRE_MINUTES=30
QR_TOKEN_EXPIRE_SECONDS=60
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📈 Performance Considerations

### Backend Optimizations
- **Connection pooling** for database
- **Async/await** for non-blocking operations
- **Pagination** for large datasets
- **Caching** for frequently accessed data
- **Index optimization** on database queries

### Frontend Optimizations
- **Code splitting** with React.lazy()
- **Memoization** for expensive calculations
- **Virtual scrolling** for large lists
- **Image optimization** and lazy loading
- **Bundle size optimization** with Webpack

## 🧪 Testing

### Backend Testing
```bash
cd server
pytest tests/ -v
```

### Frontend Testing
```bash
cd client
npm test
```

### API Testing
Use the included Postman collection or test with curl:
```bash
# Generate QR code
curl -X POST http://localhost:8000/api/qr/generate \\
  -H "Content-Type: application/json" \\
  -d '{"customer_id": 1}'

# Validate QR token
curl -X POST http://localhost:8000/api/qr/validate \\
  -H "Content-Type: application/json" \\
  -d '{"qr_token": "base64_token", "store_id": 1, "manager_id": 1}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `http://localhost:8000/docs`

---

**Built with ❤️ using React, FastAPI, and modern web technologies**
