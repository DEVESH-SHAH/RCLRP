import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  Wallet, 
  Gift, 
  History, 
  User, 
  Star,
  RefreshCw,
  Trophy,
  Clock,
  ArrowRight
} from 'lucide-react';
import QRCodeComponent from 'react-qr-code';
import NavigationHeader from '../../components/NavigationHeader';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';
import customerApi from '../../api/customerApi';
import qrApi from '../../api/qrApi';
import rewardsApi from '../../api/rewardsApi';
import { 
  getCustomerById, 
  getTransactionsByCustomerId, 
  mockRewards,
  generateMockQRToken 
} from '../../api/testData';
import { testQRGeneration } from '../../utils/qrTest';

const CustomerDashboard = () => {
  const { customerId } = useParams();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone');
  const toast = useToast();

  const [customer, setCustomer] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [qrExpiry, setQrExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('qr');
  const [qrRefreshing, setQrRefreshing] = useState(false);
  const [redeemingReward, setRedeemingReward] = useState(null);

  useEffect(() => {
    loadCustomerData();
    loadTransactions();
    loadRewards();
  }, [customerId]);

  // Generate QR code after customer data is loaded
  useEffect(() => {
    if (customer) {
      generateQRCode();
    }
  }, [customer]);

  // Auto-refresh QR code every 50 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'qr') {
        generateQRCode();
      }
    }, 50000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Countdown timer for QR expiry
  useEffect(() => {
    if (qrExpiry) {
      const timer = setInterval(() => {
        const now = new Date();
        const timeRemaining = Math.max(0, Math.ceil((qrExpiry - now) / 1000));
        setTimeLeft(timeRemaining);
        
        if (timeRemaining === 0) {
          generateQRCode(); // Auto-refresh when expired
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [qrExpiry]);

  const loadCustomerData = async () => {
    try {
      // Use test data
      const customerData = getCustomerById(customerId);
      if (customerData) {
        // Override phone if provided in URL
        if (phone) {
          customerData.phone = phone;
        }
        setCustomer(customerData);
      } else {
        // Fallback customer if ID not found
        const fallbackCustomer = {
          id: parseInt(customerId),
          name: 'Demo Customer',
          phone: phone || '+1234567890',
          email: 'demo@example.com',
          tier: 'gold',
          wallet_points: 2450,
          created_at: new Date().toISOString()
        };
        setCustomer(fallbackCustomer);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  const generateQRCode = async () => {
    if (!customer) return;
    
    setQrRefreshing(true);
    try {
      // Generate QR using test data
      const qrToken = generateMockQRToken(customer.id);
      const expiryTime = new Date(Date.now() + 60000); // 60 seconds from now
      
      // Debug: Log what's being generated
      console.log('🔥 Generated QR Token:', qrToken);
      
      // Decode to show the actual content
      try {
        const decodedToken = JSON.parse(atob(qrToken));
        console.log('🔥 Decoded QR Content:', decodedToken);
      } catch (e) {
        console.error('🚨 Failed to decode QR token:', e);
      }
      
      setQrData(qrToken);
      setQrExpiry(expiryTime);
      setTimeLeft(60); // Reset timer
    } catch (error) {
      console.error('Error generating QR:', error);
    } finally {
      setQrRefreshing(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // Load transactions from test data
      const customerTransactions = getTransactionsByCustomerId(customerId);
      setTransactions(customerTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadRewards = async () => {
    try {
      // Load rewards from test data
      setRewards(mockRewards);
      setLoading(false);
    } catch (error) {
      console.error('Error loading rewards:', error);
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'text-amber-600 bg-amber-50',
      silver: 'text-gray-600 bg-gray-50',
      gold: 'text-yellow-600 bg-yellow-50',
      platinum: 'text-purple-600 bg-purple-50'
    };
    return colors[tier] || colors.bronze;
  };

  const getTierIcon = (tier) => {
    if (tier === 'platinum') return Trophy;
    return Star;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRedeemReward = async (reward) => {
    if (customer.wallet_points < reward.points_required) {
      toast.error('Insufficient points to redeem this reward');
      return;
    }

    if (window.confirm(`Redeem ${reward.name} for ${reward.points_required} points?`)) {
      setRedeemingReward(reward.id);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update customer points
        const updatedCustomer = {
          ...customer,
          wallet_points: customer.wallet_points - reward.points_required
        };
        setCustomer(updatedCustomer);
        
        // Add redemption transaction
        const newTransaction = {
          id: Date.now(),
          type: 'REDEEM',
          points: reward.points_required,
          description: `Redeemed: ${reward.name}`,
          created_at: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        
        toast.success(`Successfully redeemed ${reward.name}! New balance: ${updatedCustomer.wallet_points} points`);
        
      } catch (error) {
        console.error('Error redeeming reward:', error);
        toast.error('Failed to redeem reward. Please try again.');
      } finally {
        setRedeemingReward(null);
      }
    }
  };

  if (loading) {
    return <Loading message="Loading your rewards..." />;
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Customer not found</p>
        </div>
      </div>
    );
  }

  const TierIcon = getTierIcon(customer.tier);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Rewards</h1>
              <p className="text-sm text-gray-600">{customer.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Customer Info Card */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <p className="text-primary-100">{customer.phone}</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${getTierColor(customer.tier)} text-sm font-medium flex items-center space-x-1`}>
              <TierIcon className="w-4 h-4" />
              <span className="capitalize">{customer.tier}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Available Points</p>
              <p className="text-3xl font-bold">{customer.wallet_points.toLocaleString()}</p>
            </div>
            <Wallet className="w-8 h-8 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-md mx-auto px-4">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'qr', label: 'QR Code', icon: QrCode },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'history', label: 'History', icon: History }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'qr' && (
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your QR Code</h3>
                <button
                  onClick={generateQRCode}
                  disabled={qrRefreshing}
                  className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${qrRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {qrData ? (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm inline-block">
                    <QRCodeComponent
                      value={qrData}
                      size={220}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className={timeLeft <= 10 ? 'text-red-600 font-semibold' : ''}>
                        Expires in {timeLeft}s
                      </span>
                    </div>
                  </div>
                  
                  {/* QR Code Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-700">QR Code Contains:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>👤 Your Identity</div>
                      <div>💰 Current Points</div>
                      <div>⏰ Expiry Timer</div>
                      <div>🔒 Security Signature</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Show this QR code to the store manager to redeem points
                  </p>
                  
                  {/* Debug: Show QR content in development */}
                  {process.env.NODE_ENV === 'development' && qrData && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">QR Content (Debug):</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {(() => {
                          try {
                            const decoded = JSON.parse(atob(qrData));
                            return (
                              <>
                                <div><strong>Customer ID:</strong> {decoded.customer_id}</div>
                                <div><strong>Name:</strong> {decoded.name}</div>
                                <div><strong>Points:</strong> {decoded.available_points}</div>
                                <div><strong>Expires:</strong> {new Date(decoded.exp * 1000).toLocaleTimeString()}</div>
                                <div><strong>Signature:</strong> {decoded.sig.substring(0, 20)}...</div>
                              </>
                            );
                          } catch (e) {
                            return <div className="text-red-600">Invalid QR data</div>;
                          }
                        })()}
                      </div>
                      
                      {/* Test QR Generation Button */}
                      <button
                        onClick={() => testQRGeneration()}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Test QR Generation
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Generating QR code...</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{transactions.filter(t => t.type === 'EARN').length}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{transactions.filter(t => t.type === 'REDEEM').length}</div>
                <div className="text-sm text-gray-600">Redemptions</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-lg font-bold text-primary-600">
                        {reward.points_required.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">points</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {customer.wallet_points >= reward.points_required ? (
                      <button 
                        onClick={() => handleRedeemReward(reward)}
                        disabled={redeemingReward === reward.id}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {redeemingReward === reward.id ? 'Redeeming...' : 'Redeem'}
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 text-center">
                        Need {(reward.points_required - customer.wallet_points).toLocaleString()} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'EARN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-900 mt-1">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'EARN' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'EARN' ? '+' : '-'}{transaction.points}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
