import React, { createContext, useContext, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qr_portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('qr_portal_token') || '';
  });

  const login = async (username, password) => {
    const res = await fetch(API_ENDPOINTS.QR_AUTH_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Login failed. Please check your credentials.');
    }

    const userData = json.data;
    const userToken = json.token || '';

    setUser(userData);
    setToken(userToken);

    localStorage.setItem('qr_portal_user', JSON.stringify(userData));
    if (userToken) {
      localStorage.setItem('qr_portal_token', userToken);
    }
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('qr_portal_user');
    localStorage.removeItem('qr_portal_token');
  };

  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
