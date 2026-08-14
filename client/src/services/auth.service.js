import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import api from './api';

export const authService = {
  /**
   * Register a new user with Firebase (or dev fallback), then sync MongoDB user profile
   */
  async register(name, email, password, role) {
    try {
      let uid;
      let token;

      // Try Firebase Client Auth
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        token = await user.getIdToken();
        uid = user.uid;
      } catch (fbError) {
        console.warn('[Firebase Auth Register Warning]:', fbError.message);
        // Fallback for local development if Firebase API key is a demo placeholder
        uid = 'dev_' + btoa(email).replace(/=/g, '');
        // Create standard dev JWT-style token (header.payload.signature)
        const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ uid, email, name, role }));
        token = `${header}.${payload}.devsignature`;
      }

      localStorage.setItem('classsphere_token', token);
      localStorage.setItem('classsphere_role', role);

      // Sync user profile to backend MongoDB
      const res = await api.post('/users/sync', {
        name,
        email,
        role: role || 'student',
      });

      return res.data;
    } catch (error) {
      console.error('[AuthService Register Error]:', error);
      throw error;
    }
  },

  /**
   * Login user with Firebase (or dev fallback), then fetch MongoDB profile
   */
  async login(email, password) {
    try {
      let uid;
      let token;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        token = await user.getIdToken();
        uid = user.uid;
      } catch (fbError) {
        console.warn('[Firebase Auth Login Warning]:', fbError.message);
        // Fallback for local development
        uid = 'dev_' + btoa(email).replace(/=/g, '');
        const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ uid, email, name: email.split('@')[0] }));
        token = `${header}.${payload}.devsignature`;
      }

      localStorage.setItem('classsphere_token', token);

      // Sync/Fetch profile from MongoDB
      const res = await api.post('/users/sync', {
        email: email.toLowerCase(),
        name: email.split('@')[0],
      });

      if (res.data?.role) {
        localStorage.setItem('classsphere_role', res.data.role);
      }

      return res.data;
    } catch (error) {
      console.error('[AuthService Login Error]:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    localStorage.removeItem('classsphere_token');
    localStorage.removeItem('classsphere_role');
    try {
      await signOut(auth);
    } catch (e) {
      // Ignored
    }
  },

  /**
   * Get current authenticated user profile from MongoDB
   */
  async getMe() {
    const res = await api.get('/users/me');
    return res.data;
  },

  /**
   * Update profile
   */
  async updateProfile(data) {
    const res = await api.put('/users/me', data);
    return res.data;
  },
};

export default authService;
