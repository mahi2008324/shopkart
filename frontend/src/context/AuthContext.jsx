import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCustomerProfile, loginCustomer, logoutCustomer, registerCustomer } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomerProfile();
      setUser(response.data);
      setAuthError(null);
      return response.data;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const res = await loginCustomer(credentials);
      if (res.data.success) {
        const profile = await fetchProfile();
        return { success: true, user: profile };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const register = async (customerData) => {
    setAuthError(null);
    try {
      const res = await registerCustomer(customerData);
      return { success: true, message: res.data.message, customer: res.data.customer };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
