import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import StoreDashboard from './pages/store/StoreDashboard';
import MarketingDashboard from './pages/marketing/MarketingDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/HomePage';
import { ToastProvider } from './components/Toast';
import ProtectedRoute, { UnauthorizedPage } from './components/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />
            
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Unauthorized Page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Customer Dashboard - Public access for demo */}
            <Route path="/customer/:customerId" element={<CustomerDashboard />} />
            
            {/* Protected Routes */}
            <Route 
              path="/store/:storeId" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'store_manager']}>
                  <StoreDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/marketing" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'marketing']}>
                  <MarketingDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
