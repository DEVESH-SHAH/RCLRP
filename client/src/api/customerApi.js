import axiosClient from './axiosClient';

export const customerApi = {
  // Get customer by ID
  getCustomer: (customerId) => 
    axiosClient.get(`/customers/${customerId}`),

  // Get customer by phone
  getCustomerByPhone: (phone) => 
    axiosClient.get(`/customers/phone/${phone}`),

  // Create new customer
  createCustomer: (customerData) => 
    axiosClient.post('/customers', customerData),

  // Update customer
  updateCustomer: (customerId, updateData) => 
    axiosClient.put(`/customers/${customerId}`, updateData),

  // Get customer transactions
  getCustomerTransactions: (customerId, skip = 0, limit = 50) => 
    axiosClient.get(`/customers/${customerId}/transactions?skip=${skip}&limit=${limit}`),

  // Add points to customer (admin function)
  addPoints: (customerId, points, description) => 
    axiosClient.post(`/customers/${customerId}/points/add`, {
      points,
      description
    }),

  // Get customer transaction summary
  getTransactionSummary: (customerId) => 
    axiosClient.get(`/transactions/customer/${customerId}/summary`),
};

export default customerApi;
