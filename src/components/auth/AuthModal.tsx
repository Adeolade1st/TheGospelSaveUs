import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Form Content */}
          {mode === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setMode('register')}
              onSwitchToForgotPassword={() => setMode('forgot-password')}
              onSuccess={handleSuccess}
            />
          )}
          
          {mode === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setMode('login')}
              onSuccess={handleSuccess}
            />
          )}
          
          {mode === 'forgot-password' && (
            <ForgotPasswordForm
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;