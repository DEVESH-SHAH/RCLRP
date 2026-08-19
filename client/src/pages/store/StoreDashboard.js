import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  QrCode, 
  Scan, 
  User, 
  Wallet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  BarChart3,
  History,
  Camera,
  ArrowRight
} from 'lucide-react';
import QrScanner from 'qr-scanner';
import NavigationHeader from '../../components/NavigationHeader';
import Loading from '../../components/Loading';
import { useToast } from '../../components/Toast';
import qrApi from '../../api/qrApi';
import storeApi from '../../api/storeApi';
import { 
  getStoreById, 
  getCustomerById, 
  redeemPoints,
  getTransactionsByStoreId,
  getQRScanLogsByStoreId 
} from '../../api/testData';

const StoreDashboard = () => {
  const { storeId } = useParams();
  const videoRef = useRef(null);
  const toast = useToast();
  const qrScannerRef = useRef(null);

  const [store, setStore] = useState(null);
  const [currentStep, setCurrentStep] = useState('scan'); // scan, validate, redeem, success
  const [scannedData, setScannedData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('scanner');
  const [scannerActive, setScannerActive] = useState(false);

  // Mock manager data
  const managerId = 1;

  useEffect(() => {
    loadStoreData();
    loadRecentTransactions();
    loadScanLogs();
  }, [storeId]);

  useEffect(() => {
    if (activeTab === 'scanner' && !scannerActive) {
      startScanner();
    } else if (activeTab !== 'scanner' && scannerActive) {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [activeTab]);

  const loadStoreData = async () => {
    try {
      // Use test data
      const storeData = getStoreById(storeId);
      if (storeData) {
        setStore(storeData);
      } else {
        // Fallback store
        const fallbackStore = {
          id: parseInt(storeId),
          name: 'Demo Store',
          code: 'DEMO001',
          location: 'Demo Location',
          manager_id: managerId
        };
        setStore(fallbackStore);
      }
    } catch (error) {
      console.error('Error loading store:', error);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      // Load transactions from test data
      const storeTransactions = getTransactionsByStoreId(storeId);
      // Add customer names to transactions
      const transactionsWithNames = storeTransactions.map(transaction => {
        const customer = getCustomerById(transaction.customer_id);
        return {
          ...transaction,
          customer_name: customer ? customer.name : 'Unknown Customer'
        };
      });
      setRecentTransactions(transactionsWithNames.slice(0, 10)); // Latest 10
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadScanLogs = async () => {
    try {
      // Load scan logs from test data
      const storeScanLogs = getQRScanLogsByStoreId(storeId);
      // Add customer names to logs
      const logsWithNames = storeScanLogs.map(log => {
        const customer = log.customer_id ? getCustomerById(log.customer_id) : null;
        return {
          ...log,
          customer_name: customer ? customer.name : 'Unknown Customer'
        };
      });
      setScanLogs(logsWithNames);
    } catch (error) {
      console.error('Error loading scan logs:', error);
    }
  };

  const startScanner = async () => {
    try {
      if (videoRef.current && !qrScannerRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => handleQRScan(result.data),
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        await qrScannerRef.current.start();
        setScannerActive(true);
      }
    } catch (error) {
      console.error('Error starting scanner:', error);
      setError('Camera access denied or not available');
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
      setScannerActive(false);
    }
  };

  const handleQRScan = async (qrData) => {
    setLoading(true);
    setError('');
    
    try {
      // Decode QR data
      let qrToken;
      try {
        qrToken = JSON.parse(atob(qrData));
      } catch (e) {
        setError('Invalid QR code format');
        setLoading(false);
        return;
      }

      // Check expiry
      const currentTime = Math.floor(Date.now() / 1000);
      if (qrToken.exp < currentTime) {
        setError('QR code has expired');
        setLoading(false);
        return;
      }

      // Get customer data
      const customer = getCustomerById(qrToken.customer_id);
      if (!customer) {
        setError('Customer not found');
        setLoading(false);
        return;
      }

      setScannedData(qrData);
      setCustomerData(customer);
      setCurrentStep('validate');
      stopScanner();
    } catch (error) {
      setError('Invalid QR code or expired token');
    } finally {
      setLoading(false);
    }
  };

  const handleRedemption = async () => {
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      setError('Please enter a valid points amount');
      return;
    }

    if (parseInt(pointsToRedeem) > customerData.wallet_points) {
      setError('Insufficient points balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use test data redemption
      const result = redeemPoints(
        customerData.id,
        parseInt(pointsToRedeem),
        storeId,
        managerId
      );

      if (result.success) {
        setSuccess(`Successfully redeemed ${pointsToRedeem} points!`);
        setCurrentStep('success');
        
        // Update customer data
        setCustomerData(prev => ({
          ...prev,
          wallet_points: result.remaining_balance
        }));

        // Refresh data
        loadRecentTransactions();
        loadScanLogs();
      } else {
        setError(result.error || 'Redemption failed. Please try again.');
      }
    } catch (error) {
      setError('Redemption failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setCurrentStep('scan');
    setScannedData(null);
    setCustomerData(null);
    setPointsToRedeem('');
    setError('');
    setSuccess('');
    if (activeTab === 'scanner') {
      startScanner();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      SUCCESS: 'text-green-600 bg-green-50',
      FAILED: 'text-red-600 bg-red-50',
      EXPIRED: 'text-yellow-600 bg-yellow-50',
      INVALID: 'text-red-600 bg-red-50'
    };
    return colors[status] || colors.FAILED;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Manager</h1>
              <p className="text-gray-600">{store?.name} • {store?.code}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Manager</p>
                <p className="font-medium">Store Manager</p>
              </div>
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm mb-6">
          {[
            { id: 'scanner', label: 'QR Scanner', icon: Scan },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
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
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            {currentStep === 'scan' && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Camera className="w-6 h-6 mr-2 text-primary-600" />
                    Scan Customer QR Code
                  </h2>
                  <p className="text-gray-600 mt-1">Point camera at customer's QR code to validate</p>
                </div>
                
                <div className="p-6">
                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                    />
                    {!scannerActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <div className="text-center text-white">
                          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Camera not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-800">{error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'validate' && customerData && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Customer Validated</h2>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customerData.name}</h3>
                      <p className="text-gray-600">{customerData.phone}</p>
                      <div className="flex items-center mt-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
                          {customerData.tier}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Available Points</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {customerData.wallet_points.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points to Redeem
                    </label>
                    <input
                      type="number"
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(e.target.value)}
                      placeholder="Enter points amount"
                      className="input-field"
                      min="1"
                      max={customerData.wallet_points}
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-800">{error}</span>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={handleRedemption}
                      disabled={loading || !pointsToRedeem}
                      className="flex-1 btn-primary flex items-center justify-center"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="w-5 h-5 mr-2" />
                      )}
                      Redeem Points
                    </button>
                    <button
                      onClick={resetScanner}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'success' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Redemption Successful!</h2>
                <p className="text-gray-600 mb-6">{success}</p>
                
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Points Redeemed</p>
                      <p className="text-xl font-bold text-green-600">{pointsToRedeem}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining Balance</p>
                      <p className="text-xl font-bold text-gray-900">
                        {customerData?.wallet_points.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetScanner}
                  className="btn-primary"
                >
                  Scan Next Customer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Redemptions</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <QrCode className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points Redeemed</p>
                    <p className="text-2xl font-bold text-gray-900">4,250</p>
                  </div>
                  <Wallet className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">94.2%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-success-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.customer_name}</p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-{transaction.points} pts</p>
                      <p className="text-sm text-gray-600">Redeemed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">QR Scan History</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {scanLogs.map((log) => (
                <div key={log.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.customer_name || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(log.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.points_redeemed && (
                      <>
                        <p className="font-semibold text-red-600">-{log.points_redeemed} pts</p>
                        <p className="text-sm text-gray-600">Redeemed</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;
