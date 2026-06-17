import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/divaApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user');
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('user');
  });

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }

    api
      .authMe()
      .then((u) => {
        setUser(u);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(u));
      })
      .catch(() => {
        api.setToken(null);
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, token) => {
    if (token) api.setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
