import axios from 'axios';

// Base URL points to backend API server (configured via VITE_API_URL in production).
// withCredentials: true ensures HttpOnly cookies (authentication tokens) are included automatically in all requests.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication APIs
export const registerCustomer = (customerData) => {
  return api.post('/customers/register', customerData);
};

export const loginCustomer = (credentials) => {
  return api.post('/customers/login', credentials);
};

export const getCustomerProfile = () => {
  return api.get('/customers/me');
};

export const logoutCustomer = () => {
  return api.post('/customers/logout');
};

export const changeCustomerPassword = (passwordData) => {
  return api.patch('/customers/change-password', passwordData);
};

// Product Catalog APIs
export const getProducts = (params = {}) => {
  return api.get('/products', { params });
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = (productData) => {
  return api.post('/products', productData);
};

export const seedProducts = () => {
  return api.post('/products/seed', { force: false });
};

export default api;
