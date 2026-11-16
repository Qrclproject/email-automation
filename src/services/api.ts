import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Fallback to localhost if VITE_API_URL is missing
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log the URL so you can verify it in the browser console
console.log("🚀 API Base URL is set to:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the exact error for debugging
    console.error("❌ API Error:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      // Don't redirect if we are already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);