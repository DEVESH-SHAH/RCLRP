// QR Code Testing Utility
import { generateMockQRToken, getCustomerById } from '../api/testData';

export const testQRGeneration = () => {
  console.log('🔥 Testing QR Code Generation...');
  
  // Test with customer ID 1
  const customerId = 1;
  const customer = getCustomerById(customerId);
  
  console.log('📋 Customer Data:', customer);
  
  if (customer) {
    const qrToken = generateMockQRToken(customerId);
    console.log('🎯 Generated QR Token (Base64):', qrToken);
    
    // Decode the token
    try {
      const decoded = JSON.parse(atob(qrToken));
      console.log('📖 Decoded QR Content:', decoded);
      
      // Validate structure
      const requiredFields = ['customer_id', 'name', 'available_points', 'exp', 'sig'];
      const hasAllFields = requiredFields.every(field => field in decoded);
      
      console.log('✅ Has all required fields:', hasAllFields);
      console.log('⏰ Expires at:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('⏱️ Time until expiry:', Math.max(0, decoded.exp - Math.floor(Date.now() / 1000)), 'seconds');
      
      return {
        success: true,
        qrToken,
        decoded,
        isValid: hasAllFields
      };
    } catch (error) {
      console.error('🚨 Failed to decode QR token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  } else {
    console.error('🚨 Customer not found');
    return {
      success: false,
      error: 'Customer not found'
    };
  }
};

// Test QR scanning simulation
export const testQRScanning = (qrData) => {
  console.log('🔍 Testing QR Code Scanning...');
  console.log('📱 Scanned QR Data:', qrData);
  
  try {
    // Decode QR data (same as StoreDashboard)
    const qrToken = JSON.parse(atob(qrData));
    console.log('📖 Decoded Token:', qrToken);
    
    // Check expiry (same as StoreDashboard)
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = qrToken.exp < currentTime;
    
    console.log('⏰ Current Time:', currentTime);
    console.log('⏰ Token Expiry:', qrToken.exp);
    console.log('❌ Is Expired:', isExpired);
    
    if (isExpired) {
      return {
        success: false,
        error: 'QR code has expired'
      };
    }
    
    // Get customer data (same as StoreDashboard)
    const customer = getCustomerById(qrToken.customer_id);
    
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found'
      };
    }
    
    console.log('✅ QR Scan Successful!');
    console.log('👤 Customer:', customer.name);
    console.log('💰 Available Points:', customer.wallet_points);
    
    return {
      success: true,
      customer,
      qrToken
    };
    
  } catch (error) {
    console.error('🚨 QR Scan Failed:', error);
    return {
      success: false,
      error: 'Invalid QR code format'
    };
  }
};

// Run tests
if (typeof window !== 'undefined') {
  window.testQR = {
    generate: testQRGeneration,
    scan: testQRScanning
  };
}
