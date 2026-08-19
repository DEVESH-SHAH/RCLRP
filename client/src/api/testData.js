/**
 * Test Data Service for Loyalty Rewards System
 * Provides mock data for all entities when database is not available
 */

// Mock Customers
export const mockCustomers = [
  {
    id: 1,
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john.doe@example.com',
    tier: 'gold',
    wallet_points: 2450,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone: '+1234567891',
    email: 'jane.smith@example.com',
    tier: 'silver',
    wallet_points: 1230,
    created_at: '2024-02-20T14:15:00Z'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    phone: '+1234567892',
    email: 'mike.johnson@example.com',
    tier: 'platinum',
    wallet_points: 5670,
    created_at: '2024-01-05T09:45:00Z'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    phone: '+1234567893',
    email: 'sarah.wilson@example.com',
    tier: 'bronze',
    wallet_points: 450,
    created_at: '2024-03-10T16:20:00Z'
  }
];

// Mock Stores
export const mockStores = [
  {
    id: 1,
    name: 'Downtown Store',
    code: 'DS001',
    location: '123 Main Street, Downtown',
    manager_id: 2,
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Mall Location',
    code: 'ML002',
    location: '456 Shopping Mall, Level 2',
    manager_id: 3,
    active: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 3,
    name: 'Airport Branch',
    code: 'AB003',
    location: '789 Airport Terminal, Gate A',
    manager_id: null,
    active: true,
    created_at: '2024-02-01T00:00:00Z'
  }
];

// Mock Users
export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    store_id: null,
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Store Manager Downtown',
    email: 'manager.downtown@company.com',
    role: 'store_manager',
    store_id: 1,
    active: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 3,
    name: 'Store Manager Mall',
    email: 'manager.mall@company.com',
    role: 'store_manager',
    store_id: 2,
    active: true,
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 4,
    name: 'Marketing Manager',
    email: 'marketing@company.com',
    role: 'marketing',
    store_id: null,
    active: true,
    created_at: '2024-01-10T00:00:00Z'
  }
];

// Mock Rewards
export const mockRewards = [
  {
    id: 1,
    name: '$5 Coffee Voucher',
    description: 'Enjoy a free coffee at any partner cafe',
    image: null,
    points_required: 500,
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '$10 Store Credit',
    description: 'Store credit for any purchase',
    image: null,
    points_required: 1000,
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Free Lunch Combo',
    description: 'Complete lunch combo meal',
    image: null,
    points_required: 750,
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Premium Membership',
    description: '1 year premium membership benefits',
    image: null,
    points_required: 5000,
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Transactions
export const mockTransactions = [
  {
    id: 1,
    customer_id: 1,
    store_id: 1,
    manager_id: 2,
    type: 'REDEEM',
    points: 500,
    description: 'Redeemed $5 Coffee Voucher',
    created_at: '2024-12-06T14:30:00Z'
  },
  {
    id: 2,
    customer_id: 1,
    store_id: 1,
    manager_id: null,
    type: 'EARN',
    points: 200,
    description: 'Purchase bonus points',
    created_at: '2024-12-05T16:45:00Z'
  },
  {
    id: 3,
    customer_id: 2,
    store_id: 2,
    manager_id: 3,
    type: 'REDEEM',
    points: 300,
    description: 'Redeemed store credit',
    created_at: '2024-12-05T11:20:00Z'
  },
  {
    id: 4,
    customer_id: 1,
    store_id: 1,
    manager_id: null,
    type: 'EARN',
    points: 150,
    description: 'Welcome bonus',
    created_at: '2024-12-04T09:15:00Z'
  },
  {
    id: 5,
    customer_id: 3,
    store_id: 1,
    manager_id: 2,
    type: 'REDEEM',
    points: 1000,
    description: 'Redeemed Premium Membership',
    created_at: '2024-12-03T13:45:00Z'
  }
];

// Mock QR Scan Logs
export const mockQRScanLogs = [
  {
    id: 1,
    customer_id: 1,
    store_id: 1,
    manager_id: 2,
    status: 'SUCCESS',
    raw_token: 'mock_token_123',
    points_redeemed: 500,
    timestamp: '2024-12-06T14:30:00Z'
  },
  {
    id: 2,
    customer_id: 2,
    store_id: 2,
    manager_id: 3,
    status: 'SUCCESS',
    raw_token: 'mock_token_456',
    points_redeemed: 300,
    timestamp: '2024-12-05T11:20:00Z'
  },
  {
    id: 3,
    customer_id: null,
    store_id: 1,
    manager_id: 2,
    status: 'EXPIRED',
    raw_token: 'expired_token_789',
    points_redeemed: null,
    timestamp: '2024-12-04T18:30:00Z'
  }
];

// Mock Campaigns
export const mockCampaigns = [
  {
    id: 1,
    name: 'Holiday Bonus Points',
    description: 'Double points on all purchases during holidays',
    bonus_multiplier: 2.0,
    start_date: '2024-12-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    active: true,
    created_at: '2024-11-15T00:00:00Z'
  },
  {
    id: 2,
    name: 'Weekend Double Points',
    description: 'Extra points on weekend purchases',
    bonus_multiplier: 2.0,
    start_date: '2024-11-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    active: true,
    created_at: '2024-10-25T00:00:00Z'
  },
  {
    id: 3,
    name: 'New Customer Welcome',
    description: 'Welcome bonus for new customers',
    bonus_multiplier: 1.5,
    start_date: '2024-10-01T00:00:00Z',
    end_date: '2024-11-30T23:59:59Z',
    active: false,
    created_at: '2024-09-20T00:00:00Z'
  }
];

// Utility functions
export const getCustomerById = (id) => {
  return mockCustomers.find(customer => customer.id === parseInt(id));
};

export const getStoreById = (id) => {
  return mockStores.find(store => store.id === parseInt(id));
};

export const getUserById = (id) => {
  return mockUsers.find(user => user.id === parseInt(id));
};

export const getTransactionsByCustomerId = (customerId) => {
  return mockTransactions.filter(transaction => transaction.customer_id === parseInt(customerId));
};

export const getTransactionsByStoreId = (storeId) => {
  return mockTransactions.filter(transaction => transaction.store_id === parseInt(storeId));
};

export const getQRScanLogsByStoreId = (storeId) => {
  return mockQRScanLogs.filter(log => log.store_id === parseInt(storeId));
};

// Add new entities (for testing add functionality)
export const addCustomer = (customerData) => {
  console.log('🔥 testData.addCustomer called with:', customerData);
  const newCustomer = {
    id: Math.max(...mockCustomers.map(c => c.id)) + 1,
    ...customerData,
    wallet_points: 0,
    tier: 'bronze',
    created_at: new Date().toISOString()
  };
  mockCustomers.push(newCustomer);
  console.log('🔥 New customer added to mockCustomers:', newCustomer);
  console.log('🔥 Total customers now:', mockCustomers.length);
  return newCustomer;
};

export const addStore = (storeData) => {
  console.log('🔥 testData.addStore called with:', storeData);
  const newStore = {
    id: Math.max(...mockStores.map(s => s.id)) + 1,
    ...storeData,
    active: true,
    created_at: new Date().toISOString()
  };
  mockStores.push(newStore);
  console.log('🔥 New store added to mockStores:', newStore);
  console.log('🔥 Total stores now:', mockStores.length);
  return newStore;
};

export const addUser = (userData) => {
  console.log('🔥 testData.addUser called with:', userData);
  const newUser = {
    id: Math.max(...mockUsers.map(u => u.id)) + 1,
    ...userData,
    active: true,
    created_at: new Date().toISOString()
  };
  mockUsers.push(newUser);
  console.log('🔥 New user added to mockUsers:', newUser);
  console.log('🔥 Total users now:', mockUsers.length);
  return newUser;
};

export const addReward = (rewardData) => {
  const newReward = {
    id: Math.max(...mockRewards.map(r => r.id)) + 1,
    ...rewardData,
    active: true,
    created_at: new Date().toISOString()
  };
  mockRewards.push(newReward);
  return newReward;
};

export const addCampaign = (campaignData) => {
  console.log('🔥 testData.addCampaign called with:', campaignData);
  const newCampaign = {
    id: Math.max(...mockCampaigns.map(c => c.id)) + 1,
    ...campaignData,
    active: true,
    created_at: new Date().toISOString()
  };
  mockCampaigns.push(newCampaign);
  console.log('🔥 New campaign added to mockCampaigns:', newCampaign);
  console.log('🔥 Total campaigns now:', mockCampaigns.length);
  return newCampaign;
};

// Generate QR token for customer
export const generateMockQRToken = (customerId) => {
  const customer = getCustomerById(customerId);
  if (!customer) {
    console.error('🚨 generateMockQRToken: Customer not found for ID:', customerId);
    return null;
  }

  const expiry = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
  const qrToken = {
    customer_id: customer.id,
    name: customer.name,
    available_points: customer.wallet_points,
    exp: expiry,
    sig: 'mock_hmac_' + Date.now() + '_' + customer.id // More realistic mock signature
  };

  const encodedToken = btoa(JSON.stringify(qrToken));
  
  console.log('🎯 QR Token Generated:', {
    customer: customer.name,
    points: customer.wallet_points,
    expires_at: new Date(expiry * 1000).toLocaleTimeString(),
    token_length: encodedToken.length,
    contains_structure: true
  });

  return encodedToken;
};

// Redeem points
export const redeemPoints = (customerId, pointsToRedeem, storeId, managerId) => {
  const customer = mockCustomers.find(c => c.id === parseInt(customerId));
  if (!customer) {
    return { success: false, error: 'Customer not found' };
  }

  if (customer.wallet_points < pointsToRedeem) {
    return { success: false, error: 'Insufficient points' };
  }

  // Deduct points
  customer.wallet_points -= pointsToRedeem;

  // Create transaction
  const transaction = {
    id: Math.max(...mockTransactions.map(t => t.id)) + 1,
    customer_id: parseInt(customerId),
    store_id: parseInt(storeId),
    manager_id: parseInt(managerId),
    type: 'REDEEM',
    points: pointsToRedeem,
    description: `Points redeemed at store`,
    created_at: new Date().toISOString()
  };
  mockTransactions.push(transaction);

  // Create QR scan log
  const scanLog = {
    id: Math.max(...mockQRScanLogs.map(l => l.id)) + 1,
    customer_id: parseInt(customerId),
    store_id: parseInt(storeId),
    manager_id: parseInt(managerId),
    status: 'SUCCESS',
    raw_token: 'redeemed_token_' + Date.now(),
    points_redeemed: pointsToRedeem,
    timestamp: new Date().toISOString()
  };
  mockQRScanLogs.push(scanLog);

  return {
    success: true,
    transaction_id: transaction.id,
    remaining_balance: customer.wallet_points
  };
};
