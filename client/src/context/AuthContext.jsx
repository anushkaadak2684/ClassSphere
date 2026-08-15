import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync profile from MongoDB
  const fetchUserProfile = async (fbUser) => {
    try {
      if (!fbUser) {
        setUser(null);
        return;
      }

      const token = await fbUser.getIdToken();
      localStorage.setItem('classsphere_token', token);

      try {
        const profile = await authService.getMe();
        setUser(profile);
      } catch (err) {
        // If MongoDB record does not exist yet (e.g. fresh register sync in progress), sync it
        const role = localStorage.getItem('classsphere_role') || 'student';
        const synced = await authService.register(
          fbUser.displayName || fbUser.email.split('@')[0],
          fbUser.email,
          'defaultPass',
          role
        );
        setUser(synced);
      }
    } catch (err) {
      console.error('[AuthContext Profile Fetch Notice]:', err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchUserProfile(fbUser);
      } else {
        setUser(null);
        localStorage.removeItem('classsphere_token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data);
      if (data.role) localStorage.setItem('classsphere_role', data.role);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      localStorage.setItem('classsphere_role', role);
      const data = await authService.register(name, email, password, role);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('classsphere_role');
      localStorage.removeItem('classsphere_token');
    } catch (err) {
      console.error('[Logout Error]:', err);
    }
  };

  const updateProfile = async (data) => {
    try {
      const updated = await authService.updateMe(data);
      setUser((prev) => ({ ...prev, ...updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
