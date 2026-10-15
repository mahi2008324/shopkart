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

// Wishlist APIs
export const getWishlist = () => {
  return api.get('/wishlist');
};

export const addToWishlist = (productId) => {
  return api.post(`/wishlist/${productId}`);
};

export const removeFromWishlist = (productId) => {
  return api.delete(`/wishlist/${productId}`);
};

export const toggleWishlist = (productId) => {
  return api.patch(`/wishlist/${productId}/toggle`);
};

// Cart APIs
export const getCart = () => {
  return api.get('/cart');
};

export const addToCart = (productId) => {
  return api.post(`/cart/${productId}`);
};

export const updateCartQuantity = (productId, quantity) => {
  return api.patch(`/cart/${productId}`, { quantity });
};

export const removeFromCart = (productId) => {
  return api.delete(`/cart/${productId}`);
};

// Order & Payment APIs
export const createPaymentOrder = (orderData) => {
  return api.post('/orders/create-payment-order', orderData);
};

export const verifyPayment = (paymentData) => {
  return api.post('/orders/verify-payment', paymentData);
};

export const getMyOrders = () => {
  return api.get('/orders');
};

export const getOrderById = (orderId) => {
  return api.get(`/orders/${orderId}`);
};

export const updateOrderStatus = (orderId, status) => {
  return api.patch(`/orders/${orderId}/status`, { status });
};

export default api;

