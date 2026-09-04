import axios from 'axios';

declare global {
  interface Window {
    __API_URL__?: string;
  }
}

const runtimeApiUrl = typeof window !== 'undefined' ? window.__API_URL__ : undefined;
const buildTimeApiUrl = import.meta.env.VITE_API_URL;
const fallbackUrl = 'http://localhost:3000';

const api = axios.create({
  baseURL: runtimeApiUrl || buildTimeApiUrl || fallbackUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const publicRoutes = ['/login', '/register', '/verify-email', '/products', '/cart', '/about', '/contact', '/terms', '/privacy', '/privacy-policy', '/help', '/faq'];
      const isPublicRoute = window.location.pathname === '/' || publicRoutes.some(route => window.location.pathname.startsWith(route));
      if (!isPublicRoute) {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
