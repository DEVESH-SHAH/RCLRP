import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Store, BarChart3, Settings, QrCode, Gift, Users, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [customerPhone, setCustomerPhone] = useState('');

  const handleCustomerAccess = () => {
    if (customerPhone.trim()) {
      // In a real app, you'd validate the phone and get customer ID
      // For demo, we'll use a mock customer ID
      navigate(`/customer/1?phone=${customerPhone}`);
    }
  };

  const dashboardOptions = [
    {
      title: 'Customer Dashboard',
      description: 'View your points, QR code, and transaction history',
      icon: Smartphone,
      color: 'bg-blue-500',
      action: () => {
        const phone = prompt('Enter your phone number:');
        if (phone) navigate(`/customer/1?phone=${phone}`);
      }
    },
    {
      title: 'Store Manager',
      description: 'Scan QR codes and manage redemptions',
      icon: Store,
      color: 'bg-green-500',
      action: () => navigate('/login')
    },
    {
      title: 'Marketing Dashboard',
      description: 'Analytics, campaigns, and customer insights',
      icon: BarChart3,
      color: 'bg-purple-500',
      action: () => navigate('/login')
    },
    {
      title: 'Admin Panel',
      description: 'System management and configuration',
      icon: Settings,
      color: 'bg-red-500',
      action: () => navigate('/login')
    }
  ];

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Redemption',
      description: 'Secure, fast point redemption with QR codes'
    },
    {
      icon: Gift,
      title: 'Reward Management',
      description: 'Flexible reward catalog and point system'
    },
    {
      icon: Users,
      title: 'Customer Tiers',
      description: 'Bronze, Silver, Gold, and Platinum tiers'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Comprehensive reporting and insights'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Loyalty Rewards System</h1>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Staff Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Earn, Scan, Redeem
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Complete loyalty rewards platform with QR-based redemption, 
            real-time analytics, and multi-tier customer management.
          </p>

          {/* Quick Customer Access */}
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Customer Access</h3>
            <p className="text-gray-600 mb-6">Enter your phone number to access your rewards</p>
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Enter phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input-field"
              />
              <button
                onClick={handleCustomerAccess}
                className="w-full btn-primary"
                disabled={!customerPhone.trim()}
              >
                Access My Rewards
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            System Dashboards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dashboardOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={index}
                  onClick={option.action}
                  className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="p-6">
                    <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {option.title}
                    </h4>
                    <p className="text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Partner Stores</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Points Redeemed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Loyalty Rewards System</span>
          </div>
          <p className="text-gray-400">
            Built with React + FastAPI • Secure QR-based redemption • Real-time analytics
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
