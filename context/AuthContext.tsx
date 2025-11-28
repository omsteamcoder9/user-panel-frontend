'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser } from '@/lib/auth-api'; // Import your API functions

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      // Use your actual API endpoint
      const response = await loginUser(credentials);

      if (response.success) {
        // Handle both possible response formats from your API
        const userData = response.user || response.data;
        const authToken = response.token || response.data?.token;

        if (userData && authToken) {
          setUser(userData);
          setToken(authToken);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          localStorage.setItem('token', authToken);
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Clear any existing auth data on login failure
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      // Use your actual API endpoint
      const response = await registerUser(userData);

      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      // Registration successful - you might want to automatically log the user in
      // For now, we'll just return success and let the component handle redirect
      
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken'); // Clean up old key if exists
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}