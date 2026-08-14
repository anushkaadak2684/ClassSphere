import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Check localStorage fallback for dev session tokens
        const storedToken = localStorage.getItem('classsphere_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
    } catch (error) {
      console.error('[API Interceptor] Failed to retrieve token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors consistently
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // Check for 401 unauthorized
    if (error.response?.status === 401) {
      // Optional trigger for auth logout or refresh
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
