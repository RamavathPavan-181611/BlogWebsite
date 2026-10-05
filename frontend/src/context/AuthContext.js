import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Safely parse a JSON string from localStorage.
 * Returns null (instead of throwing) when the value is absent, not a string,
 * or not valid JSON – all of which indicate a corrupt/missing entry that
 * should be treated the same as "not logged in".
 */
const safeParse = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Clear all auth state and localStorage in one place so nothing is ever
   * left in a half-logged-in state.
   */
  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = safeParse(localStorage.getItem('user'));

      // Nothing persisted → user is simply not logged in.
      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      // Optimistically set the cached user so the UI is responsive immediately.
      setUser(storedUser);
      setIsAuthenticated(true);

      // Revalidate the token against the backend in the background.
      // This catches expired tokens, revoked accounts, etc.
      try {
        const data = await api.getCurrentUser();
        // Replace the cached user with the freshest data from the server.
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        // The token is invalid or expired – silently log the user out so they
        // aren't stuck in an authenticated-but-broken state.
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [clearSession]);

  const login = useCallback((userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('authToken', token);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = {
    user,
    login,
    updateUser,
    logout,
    loading,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
