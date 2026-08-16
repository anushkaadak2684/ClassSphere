import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
   * Change user password securely with re-authentication via Firebase Auth
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('User authentication session not found.');
      }

      // 1. Re-authenticate with current credentials
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update to new password
      await updatePassword(user, newPassword);

      // 3. Refresh token
      const freshToken = await user.getIdToken(true);
      localStorage.setItem('classsphere_token', freshToken);

      return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
      console.error('[AuthService Change Password Error]:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak. Please use at least 6 characters.');
      }
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
