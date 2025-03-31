import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './index.css'

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
      </Route>

      {/* Dashboard routes - protected */}
      <Route path="/dashboard" element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;