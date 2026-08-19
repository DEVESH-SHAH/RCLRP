import axiosClient from './axiosClient';

export const adminApi = {
  // System Overview
  getSystemOverview: () => 
    axiosClient.get('/admin/overview'),

  // User Management
  getUsers: (skip = 0, limit = 100) => 
    axiosClient.get(`/admin/users?skip=${skip}&limit=${limit}`),

  getUser: (userId) => 
    axiosClient.get(`/admin/users/${userId}`),

  createUser: (userData) => 
    axiosClient.post('/admin/users', userData),

  deactivateUser: (userId) => 
    axiosClient.delete(`/admin/users/${userId}`),

  // Store Management
  createStoreAdmin: (storeData) => 
    axiosClient.post('/admin/stores', storeData),

  updateStore: (storeId, storeData) => 
    axiosClient.put(`/admin/stores/${storeId}`, storeData),

  deactivateStore: (storeId) => 
    axiosClient.delete(`/admin/stores/${storeId}`),

  // Customer Management
  getAllCustomers: (skip = 0, limit = 100) => 
    axiosClient.get(`/admin/customers?skip=${skip}&limit=${limit}`),

  adjustCustomerPoints: (customerId, pointsAdjustment, reason) => 
    axiosClient.post(`/admin/customers/${customerId}/adjust-points`, {
      points_adjustment: pointsAdjustment,
      reason
    }),

  // Analytics
  getDashboardAnalytics: (days = 30) => 
    axiosClient.get(`/analytics/dashboard?days=${days}`),

  getCustomerAnalytics: () => 
    axiosClient.get('/analytics/customers'),

  getStoreAnalytics: () => 
    axiosClient.get('/analytics/stores'),

  getQRScanAnalytics: (days = 7) => 
    axiosClient.get(`/analytics/qr-scans?days=${days}`),

  getCampaignAnalytics: () => 
    axiosClient.get('/analytics/campaigns'),
};

export default adminApi;
