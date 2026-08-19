# Loyalty Rewards System - Frontend

React frontend with Tailwind CSS for the Loyalty Rewards System.

## 🎨 UI/UX Design

### Design System
- **Framework**: React 18 with JavaScript
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for data visualization
- **QR Codes**: react-qr-code for generation, qr-scanner for reading

### Color Palette
```css
/* Primary Colors */
primary-50: #eff6ff
primary-100: #dbeafe
primary-500: #3b82f6
primary-600: #2563eb
primary-700: #1d4ed8

/* Status Colors */
success: #22c55e
warning: #f59e0b
error: #ef4444

/* Tier Colors */
bronze: #cd7f32
silver: #c0c0c0
gold: #ffd700
platinum: #e5e4e2
```

## 📱 Dashboard Components

### 1. Customer Dashboard (Mobile-First)
**Path**: `/customer/:customerId`

**Features**:
- **QR Code Display**: Auto-refreshing every 50 seconds
- **Points Balance**: Real-time wallet balance with tier display
- **Transaction History**: Paginated list with earn/redeem indicators
- **Available Rewards**: Filterable catalog with redemption status
- **Profile Management**: Edit personal information

**Key Components**:
```javascript
// QR Code with auto-refresh
const [qrData, setQrData] = useState(null);
const [qrExpiry, setQrExpiry] = useState(null);

useEffect(() => {
  const interval = setInterval(() => {
    if (activeTab === 'qr') {
      generateQRCode();
    }
  }, 50000); // 50 second refresh
  
  return () => clearInterval(interval);
}, [activeTab]);

// QR Code display
<QRCodeComponent
  value={qrData}
  size={200}
  level="M"
/>
```

**Mobile Optimizations**:
- Touch-friendly interface with large tap targets
- Swipe navigation between tabs
- Responsive grid layouts
- Optimized for portrait orientation
- Fast loading with skeleton screens

### 2. Store Manager Dashboard
**Path**: `/store/:storeId`

**Features**:
- **QR Scanner**: Real-time camera-based scanning
- **Customer Validation**: Instant customer info display
- **Point Redemption**: Step-by-step redemption workflow
- **Transaction Reports**: Daily/weekly performance metrics
- **Scan History**: Detailed logs with success/failure tracking

**QR Scanning Workflow**:
```javascript
// Camera integration
const videoRef = useRef(null);
const qrScannerRef = useRef(null);

const startScanner = async () => {
  qrScannerRef.current = new QrScanner(
    videoRef.current,
    (result) => handleQRScan(result.data),
    {
      highlightScanRegion: true,
      highlightCodeOutline: true,
    }
  );
  await qrScannerRef.current.start();
};

// Redemption flow states
const [currentStep, setCurrentStep] = useState('scan'); 
// States: scan → validate → redeem → success
```

**Performance Features**:
- Instant QR code recognition
- Real-time validation feedback
- Atomic transaction processing
- Offline capability with sync
- Error recovery mechanisms

### 3. Marketing Dashboard
**Path**: `/marketing`

**Features**:
- **Customer Analytics**: Segmentation and behavior analysis
- **Campaign Management**: Create and monitor campaigns
- **Engagement Metrics**: Interactive charts and KPIs
- **Tier Analysis**: Customer tier distribution and progression
- **ROI Tracking**: Campaign performance and attribution

**Analytics Visualizations**:
```javascript
// Customer growth chart
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={customerAnalytics?.growth_data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="total_customers" stroke="#3B82F6" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>

// Tier distribution pie chart
<RechartsPieChart>
  <Pie
    data={tierData}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ name, percentage }) => `${name} ${percentage}%`}
    outerRadius={80}
    fill="#8884d8"
    dataKey="value"
  >
    {tierData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip />
</RechartsPieChart>
```

### 4. Admin Dashboard
**Path**: `/admin`

**Features**:
- **System Overview**: Real-time metrics and health status
- **User Management**: CRUD operations for staff users
- **Customer Management**: Advanced customer operations
- **Store Management**: Store configuration and monitoring
- **System Monitoring**: Performance metrics and logs

**Data Management**:
```javascript
// Customer management table
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th>Customer</th>
      <th>Tier</th>
      <th>Points Balance</th>
      <th>Total Earned</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {customers.map((customer) => (
      <CustomerRow key={customer.id} customer={customer} />
    ))}
  </tbody>
</table>
```

## 🔧 Technical Implementation

### Project Structure
```
client/src/
├── pages/                  # Dashboard pages
│   ├── customer/
│   │   └── CustomerDashboard.js
│   ├── store/
│   │   └── StoreDashboard.js
│   ├── marketing/
│   │   └── MarketingDashboard.js
│   ├── admin/
│   │   └── AdminDashboard.js
│   ├── auth/
│   │   └── LoginPage.js
│   └── HomePage.js
├── api/                    # API client functions
│   ├── axiosClient.js      # Axios configuration
│   ├── customerApi.js      # Customer endpoints
│   ├── qrApi.js           # QR system endpoints
│   ├── storeApi.js        # Store endpoints
│   ├── adminApi.js        # Admin endpoints
│   ├── authApi.js         # Authentication
│   └── rewardsApi.js      # Rewards endpoints
├── components/             # Reusable components
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
├── App.js                 # Main application
├── index.js               # React entry point
└── index.css              # Global styles
```

### API Client Configuration
```javascript
// axiosClient.js
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### State Management
```javascript
// Customer dashboard state
const [customer, setCustomer] = useState(null);
const [qrData, setQrData] = useState(null);
const [transactions, setTransactions] = useState([]);
const [rewards, setRewards] = useState([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState('qr');

// Store dashboard state
const [currentStep, setCurrentStep] = useState('scan');
const [scannedData, setScannedData] = useState(null);
const [customerData, setCustomerData] = useState(null);
const [pointsToRedeem, setPointsToRedeem] = useState('');
```

### Responsive Design
```css
/* Mobile-first approach */
.dashboard-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-4;
}

@media (min-width: 768px) {
  .dashboard-card {
    @apply p-6;
  }
}

/* Grid layouts */
.stats-grid {
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 640px) {
  .stats-grid {
    @apply grid-cols-2;
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    @apply grid-cols-4;
  }
}
```

## 🎯 User Experience Features

### Loading States
```javascript
// Skeleton loading for better perceived performance
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Loading spinner for actions
const LoadingSpinner = () => (
  <RefreshCw className="w-5 h-5 animate-spin" />
);
```

### Error Handling
```javascript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Success/Error Feedback
```javascript
// Toast notifications
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};

// Inline feedback
{success && (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
    <span className="text-green-800">{success}</span>
  </div>
)}

{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
    <XCircle className="w-5 h-5 text-red-600 mr-2" />
    <span className="text-red-800">{error}</span>
  </div>
)}
```

## 📊 Data Visualization

### Chart Components
```javascript
// Line chart for trends
const TrendChart = ({ data, dataKey, color = "#3B82F6" }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

// Bar chart for comparisons
const BarChart = ({ data, dataKey, color = "#10B981" }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey={dataKey} fill={color} />
    </BarChart>
  </ResponsiveContainer>
);
```

### KPI Cards
```javascript
const KPICard = ({ title, value, change, icon: Icon, color = "blue" }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <ArrowUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+{change}%</span>
          </div>
        )}
      </div>
      <Icon className={`w-8 h-8 text-${color}-600`} />
    </div>
  </div>
);
```

## 🔐 Authentication & Security

### Auth Context
```javascript
// AuthContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, user: userData } = authUtils.getAuthData();
    if (token && userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    const { access_token } = response.data;
    
    const userResponse = await authApi.getCurrentUser();
    const userData = userResponse.data;
    
    authUtils.setAuthData(access_token, userData);
    setUser(userData);
  };

  const logout = () => {
    authUtils.clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Routes
```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

## 📱 Mobile Optimization

### Touch Interactions
```css
/* Touch-friendly buttons */
.touch-target {
  @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
}

/* Smooth scrolling */
.scroll-container {
  @apply overflow-y-auto;
  -webkit-overflow-scrolling: touch;
}

/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px;
}
```

### Responsive Images
```javascript
const ResponsiveImage = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={`w-full h-auto ${className}`}
    loading="lazy"
    onError={(e) => {
      e.target.src = '/placeholder-image.png';
    }}
  />
);
```

## 🚀 Performance Optimization

### Code Splitting
```javascript
// Lazy load dashboard components
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const StoreDashboard = lazy(() => import('./pages/store/StoreDashboard'));
const MarketingDashboard = lazy(() => import('./pages/marketing/MarketingDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/customer/:customerId" element={<CustomerDashboard />} />
    <Route path="/store/:storeId" element={<StoreDashboard />} />
    <Route path="/marketing" element={<MarketingDashboard />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

### Memoization
```javascript
// Memoize expensive calculations
const expensiveCalculation = useMemo(() => {
  return transactions.reduce((sum, transaction) => {
    return transaction.type === 'EARN' ? sum + transaction.points : sum;
  }, 0);
}, [transactions]);

// Memoize components
const MemoizedChart = memo(({ data, dataKey }) => (
  <LineChart data={data}>
    <Line dataKey={dataKey} />
  </LineChart>
));
```

### Virtual Scrolling
```javascript
// For large lists
const VirtualizedList = ({ items, renderItem, itemHeight = 60 }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(10);
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  return (
    <div className="virtual-list" style={{ height: itemHeight * 10 }}>
      {visibleItems.map((item, index) => (
        <div key={startIndex + index} style={{ height: itemHeight }}>
          {renderItem(item, startIndex + index)}
        </div>
      ))}
    </div>
  );
};
```

## 🧪 Testing

### Component Testing
```javascript
// CustomerDashboard.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CustomerDashboard from './CustomerDashboard';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

test('displays customer information', async () => {
  renderWithRouter(<CustomerDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText('My Rewards')).toBeInTheDocument();
    expect(screen.getByText('Available Points')).toBeInTheDocument();
  });
});

test('generates QR code', async () => {
  renderWithRouter(<CustomerDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText('Your QR Code')).toBeInTheDocument();
  });
});
```

### API Testing
```javascript
// Mock API responses
jest.mock('../api/customerApi', () => ({
  getCustomer: jest.fn(() => Promise.resolve({
    data: {
      id: 1,
      name: 'John Doe',
      wallet_points: 1000,
      tier: 'gold'
    }
  }))
}));
```

## 🎨 Design System

### Component Library
```javascript
// Button variants
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200';
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-success-600 hover:bg-success-700 text-white',
  };
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card component
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);
```

### Typography Scale
```css
/* Typography utilities */
.text-display {
  @apply text-4xl font-bold tracking-tight;
}

.text-heading-1 {
  @apply text-3xl font-bold;
}

.text-heading-2 {
  @apply text-2xl font-semibold;
}

.text-heading-3 {
  @apply text-xl font-semibold;
}

.text-body {
  @apply text-base;
}

.text-caption {
  @apply text-sm text-gray-600;
}
```

---

**React Frontend for Loyalty Rewards System - Built with modern web technologies and best practices**
