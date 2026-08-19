import axiosClient from './axiosClient';

export const qrApi = {
  // Generate QR code for customer
  generateQR: (customerId) => 
    axiosClient.post('/qr/generate', { customer_id: customerId }),

  // Validate QR code
  validateQR: (qrToken, storeId, managerId) => 
    axiosClient.post('/qr/validate', {
      qr_token: qrToken,
      store_id: storeId,
      manager_id: managerId
    }),

  // Redeem points using QR
  redeemPoints: (qrToken, storeId, managerId, pointsToRedeem) => 
    axiosClient.post('/qr/redeem', {
      qr_token: qrToken,
      store_id: storeId,
      manager_id: managerId,
      points_to_redeem: pointsToRedeem
    }),

  // Get scan logs for store
  getScanLogs: (storeId, limit = 50) => 
    axiosClient.get(`/qr/scan-logs/${storeId}?limit=${limit}`),
};

export default qrApi;
