import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm
        onSwitchToRegister={() => window.location.href = '/register'}
        onSwitchToForgotPassword={() => window.location.href = '/forgot-password'}
        onSuccess={() => window.location.href = '/profile'}
      />
    </div>
  );
};

export default LoginPage;