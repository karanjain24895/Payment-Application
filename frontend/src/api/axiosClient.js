import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
const baseURL = rawUrl
  ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wallet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('wallet_token');
        localStorage.removeItem('wallet_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
