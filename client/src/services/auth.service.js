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
   * Register a new user with Firebase, then sync MongoDB user profile
   */
  async register(name, email, password, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (name) {
        await updateProfile(user, { displayName: name });
      }

      const token = await user.getIdToken(true);
      localStorage.setItem('classsphere_token', token);
      if (role) {
        localStorage.setItem('classsphere_role', role);
      }

      // Sync user profile to backend MongoDB
      const res = await api.post(
        '/users/sync',
        {
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          role: role || 'student',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data;
    } catch (error) {
      console.error('[AuthService Register Error]:', error);
      throw error;
    }
  },

  /**
   * Login user with Firebase, then sync/fetch MongoDB profile
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(true);
      localStorage.setItem('classsphere_token', token);

      // Sync/Fetch profile from MongoDB
      const res = await api.post(
        '/users/sync',
        {
          email: email.toLowerCase(),
          name: user.displayName || email.split('@')[0],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data;
    } catch (error) {
      console.error('[AuthService Login Error]:', error);
      throw error;
    }
  },

  /**
   * Logout user from Firebase and clear local session
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('[AuthService Logout Notice]:', error.message);
    } finally {
      localStorage.removeItem('classsphere_token');
      localStorage.removeItem('classsphere_role');
    }
  },

  /**
   * Get current user profile from MongoDB
   */
  async getMe() {
    const res = await api.get('/users/me');
    return res.data;
  },

  /**
   * Update user profile in MongoDB
   */
  async updateMe(data) {
    const res = await api.put('/users/me', data);
    return res.data;
  },
};

export default authService;
