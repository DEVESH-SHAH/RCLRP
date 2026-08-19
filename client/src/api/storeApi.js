import axiosClient from './axiosClient';

export const storeApi = {
  // Get all stores
  getStores: (skip = 0, limit = 100) => 
    axiosClient.get(`/stores?skip=${skip}&limit=${limit}`),

  // Get store by ID
  getStore: (storeId) => 
    axiosClient.get(`/stores/${storeId}`),

  // Get store by code
  getStoreByCode: (storeCode) => 
    axiosClient.get(`/stores/code/${storeCode}`),

  // Create new store
  createStore: (storeData) => 
    axiosClient.post('/stores', storeData),

  // Get store transactions
  getStoreTransactions: (storeId, skip = 0, limit = 50) => 
    axiosClient.get(`/stores/${storeId}/transactions?skip=${skip}&limit=${limit}`),

  // Get store analytics
  getStoreAnalytics: (storeId) => 
    axiosClient.get(`/stores/${storeId}/analytics`),
};

export default storeApi;
