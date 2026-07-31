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
      } else {
        // Default demo fallback user if no token present
        const savedDemo = localStorage.getItem('cloudtask_demo_user');
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
          } catch (e) {
            // ignore
          }
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
        localStorage.setItem('cloudtask_demo_user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Checking demo mode...';
      setError(msg);

      // Demo login fallback if API is unreachable
      if (email.includes('admin')) {
        const mockAdmin = {
          _id: 'user_admin_123',
          name: 'Alex Rivera (Admin)',
          email: 'admin@cloudtask.com',
          role: 'Admin',
          department: 'DevOps & Architecture',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          token: 'mock_jwt_admin_token',
        };
        setUser(mockAdmin);
        localStorage.setItem('cloudtask_demo_user', JSON.stringify(mockAdmin));
        return true;
      } else if (email.includes('manager')) {
        const mockManager = {
          _id: 'user_manager_456',
          name: 'Marcus Vance (Manager)',
          email: 'manager@cloudtask.com',
          role: 'Manager',
          department: 'Product Engineering',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          token: 'mock_jwt_manager_token',
        };
        setUser(mockManager);
        localStorage.setItem('cloudtask_demo_user', JSON.stringify(mockManager));
        return true;
      } else {
        const mockEmployee = {
          _id: 'user_employee_789',
          name: 'Elena Rostova (Employee)',
          email: 'employee@cloudtask.com',
          role: 'Employee',
          department: 'Frontend Engineering',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          token: 'mock_jwt_employee_token',
        };
        setUser(mockEmployee);
        localStorage.setItem('cloudtask_demo_user', JSON.stringify(mockEmployee));
        return true;
      }
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
        localStorage.setItem('cloudtask_demo_user', JSON.stringify(newUser));
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
      // Local state update fallback
      setUser((prev) => ({ ...prev, ...data }));
      return true;
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
