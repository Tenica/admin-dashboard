import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin, AuthContextType } from '../types';
import { authService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');

    if (storedToken && storedAdmin) {
      try {
        setToken(storedToken);
        setAdmin(JSON.parse(storedAdmin));
      } catch (err) {
        console.error('Failed to restore auth state:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      if (response.token && response.admin) {
        setToken(response.token);
        setAdmin(response.admin);

        // Store in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('admin', JSON.stringify(response.admin));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred during login';

      // Handle timeout errors
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. The server is taking too long to respond. Please check your internet connection and try again.';
      } else if (err?.response?.status === 0 || err?.message?.includes('Network Error')) {
        errorMessage = 'Network error. Unable to connect to the server. Please check your internet connection.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state and storage regardless of API response
      setToken(null);
      setAdmin(null);
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    admin,
    token,
    isAuthenticated: !!token && !!admin,
    login,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
