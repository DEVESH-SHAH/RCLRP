import axiosClient from './axiosClient';

export const authApi = {
  // Login
  login: (email, password) => 
    axiosClient.post('/auth/login', { email, password }),

  // Get current user info
  getCurrentUser: () => 
    axiosClient.get('/auth/me'),

  // Logout
  logout: () => 
    axiosClient.post('/auth/logout'),
};

// Auth utility functions
export const authUtils = {
  // Store auth data
  setAuthData: (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  // Get stored auth data
  getAuthData: () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return {
      token,
      user: userData ? JSON.parse(userData) : null
    };
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get user role
  getUserRole: () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
    return null;
  }
};

export default authApi;
