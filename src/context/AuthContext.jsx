import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qr_portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Login failed. Please check your credentials.');
    }

    setUser(json.data);
    localStorage.setItem('qr_portal_user', JSON.stringify(json.data));
    return json.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qr_portal_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
