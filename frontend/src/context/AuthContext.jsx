import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi, updateProfileApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cloudtask_token');
      if (token) {
        try {
          const res = await getMeApi();
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.warn('[AuthContext]: Stale or invalid token, logging out.');
          localStorage.removeItem('cloudtask_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await loginApi({ email, password });
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('cloudtask_token', userData.token);
        setUser(userData);
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
    }
    return false;
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await registerApi(userData);
      if (res.data.success) {
        const newUser = res.data.data;
        localStorage.setItem('cloudtask_token', newUser.token);
        setUser(newUser);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('cloudtask_token');
    localStorage.removeItem('cloudtask_demo_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const res = await updateProfileApi(data);
      if (res.data.success) {
        setUser((prev) => ({ ...prev, ...res.data.data }));
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
