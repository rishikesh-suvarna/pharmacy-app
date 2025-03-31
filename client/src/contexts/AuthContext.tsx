/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface User {
  address: string;
  phone: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isPharmacist: () => boolean;
  isStaff: () => boolean;
  hasRole: (role: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
}

interface JwtPayload {
  id: string;
  email: string;
  roles: string[];
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if token exists and is valid on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Set the auth header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Decode token to get user info
          const decoded = jwtDecode<JwtPayload>(token);

          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            throw new Error('Token expired');
          }

          // Get user profile from API
          const response = await axios.get('/api/auth/profile');
          setUser(response.data);
        } catch (err) {
          console.error('Auth error:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post('/api/auth/login', { email, password });
      const { token, ...userData } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Set the auth header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data in state
      setUser(userData);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post('/api/auth/register', data);
      const { token, ...userData } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Set the auth header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data in state
      setUser(userData);

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];

    // Clear user from state
    setUser(null);

    // Redirect to login
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const isAdmin = () => {
    return user?.roles?.includes('admin') || false;
  };

  const isPharmacist = () => {
    return user?.roles?.includes('pharmacist') || false;
  };

  const isStaff = () => {
    return user?.roles?.includes('staff') || false;
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isPharmacist,
    isStaff,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};