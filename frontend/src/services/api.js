import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base API configuration
// For mobile device, use your computer's IP address instead of localhost
// Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = 'http://192.168.1.48:5000/api'; // Your computer's IP address for mobile testing

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('token');
      // You might want to redirect to login screen here
    }
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password, role = 'user') =>
    api.post('/auth/register', { name, email, password, role }),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  updateProfile: (name, email) =>
    api.put('/auth/profile', { name, email }),
  
  resendVerification: (email) =>
    api.post('/auth/resend-verification', { email }),
};

// Customer API
export const customerAPI = {
  getCustomers: ({ page = 1, limit = 10, search = '', status = '' }) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    return api.get(`/customers?${params.toString()}`);
  },
  
  getCustomerById: (customerId) =>
    api.get(`/customers/${customerId}`),
  
  createCustomer: (customerData) =>
    api.post('/customers', customerData),
  
  updateCustomer: (customerId, customerData) =>
    api.put(`/customers/${customerId}`, customerData),
  
  deleteCustomer: (customerId) =>
    api.delete(`/customers/${customerId}`),
};

// Lead API
export const leadAPI = {
  getLeads: ({ page = 1, limit = 10, status = '', customer = '', priority = '' }) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (customer) params.append('customer', customer);
    if (priority) params.append('priority', priority);
    
    return api.get(`/leads?${params.toString()}`);
  },
  
  getLeadById: (leadId) =>
    api.get(`/leads/${leadId}`),
  
  getLeadsByCustomer: (customerId, status = '') => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/leads/customer/${customerId}${params}`);
  },
  
  createLead: (leadData) =>
    api.post('/leads', leadData),
  
  updateLead: (leadId, leadData) =>
    api.put(`/leads/${leadId}`, leadData),
  
  deleteLead: (leadId) =>
    api.delete(`/leads/${leadId}`),
  
  addNote: (leadId, content) =>
    api.post(`/leads/${leadId}/notes`, { content }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard/stats'),
  
  getLeadsChart: (type = 'status') =>
    api.get(`/dashboard/leads-chart?type=${type}`),
  
  getConversionFunnel: () =>
    api.get('/dashboard/conversion-funnel'),
  
  getRecentActivities: (limit = 10) =>
    api.get(`/dashboard/recent-activities?limit=${limit}`),
};

export default api;
