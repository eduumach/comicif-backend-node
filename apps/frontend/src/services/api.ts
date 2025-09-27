import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy will redirect to backend
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('comicif_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('comicif_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;