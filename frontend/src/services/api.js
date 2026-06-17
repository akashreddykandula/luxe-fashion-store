import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxe_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('luxe_token');
      localStorage.removeItem('luxe_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// ── Products ─────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (slug) => api.get(`/products/${slug}`),
  getFilterOptions: (params) => api.get('/products/filter-options', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addImages: (id, formData) => api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id, imageId) => api.delete(`/products/${id}/images/${imageId}`),
};

// ── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getOne: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ── Cart ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  saveForLater: (itemId) => api.post(`/cart/${itemId}/save-later`),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon/remove'),
};

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/${productId}`),
};

// ── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),
  requestReturn: (id, data) => api.post(`/orders/${id}/return`, data),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder: (orderId) => api.post('/payments/razorpay/create-order', { orderId }),
  verifyPayment: (data) => api.post('/payments/razorpay/verify', data),
};

// ── Reviews ──────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  voteHelpful: (id) => api.post(`/reviews/${id}/helpful`),
};

// ── Coupons ──────────────────────────────────────────────────────────────────
export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// ── Banners ──────────────────────────────────────────────────────────────────
export const bannerAPI = {
  getAll: (params) => api.get('/upload/banners', { params }),
};

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addAddress: (data) => api.post('/users/address', data),
  updateAddress: (id, data) => api.put(`/users/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
  getAll: (params) => api.get('/users', { params }),
  updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
};

// ── Newsletter ────────────────────────────────────────────────────────────────
export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactAPI = {
  send: (data) => api.post('/contact', data),
};

export default api;
