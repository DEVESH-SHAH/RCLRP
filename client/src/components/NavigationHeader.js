import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, LogOut, QrCode } from 'lucide-react';

const NavigationHeader = ({ 
  title, 
  subtitle, 
  showBack = true, 
  showHome = true, 
  showLogout = true,
  rightContent = null 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBack && location.pathname !== '/' && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {rightContent}
            
            {showHome && location.pathname !== '/' && (
              <button
                onClick={handleHome}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            {showLogout && location.pathname !== '/' && location.pathname !== '/login' && (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
