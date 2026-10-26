import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL;
const BASE = (import.meta.env.PROD || !rawBase || rawBase.includes('localhost'))
  ? '/api/v1'
  : rawBase;

export const api = axios.create({ baseURL: BASE, withCredentials: false });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      const path = window.location.pathname;
      if (path.startsWith('/admin') || path.startsWith('/stock') || path.startsWith('/checkout') || path.startsWith('/orders') || path.startsWith('/customer')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const unwrap = <T,>(r: { data: { data: T } }) => r.data.data;
