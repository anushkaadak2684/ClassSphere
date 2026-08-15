import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach fresh Firebase ID token
api.interceptors.request.use(
  async (config) => {
    try {
      if (config.headers.Authorization) {
        return config;
      }

      if (!auth.currentUser && typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        // getIdToken() retrieves a fresh unexpired token
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const storedToken = localStorage.getItem('classsphere_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
    } catch (error) {
      console.error('[API Interceptor] Failed to retrieve fresh token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-retry on 401 with forced token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry && auth.currentUser) {
      originalRequest._retry = true;
      try {
        const freshToken = await auth.currentUser.getIdToken(true);
        localStorage.setItem('classsphere_token', freshToken);
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error('[Token Refresh Error]:', refreshErr);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default api;
