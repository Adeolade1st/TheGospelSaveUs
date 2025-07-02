import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { validateEmail } from '../utils/validation';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const AdminLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Handle lock timer countdown
  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const interval = setInterval(() => {
        setLockTimer(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (isLocked && lockTimer === 0) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [isLocked, lockTimer]);

  // Load login attempts from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem('adminLoginAttempts');
    const storedLockTime = localStorage.getItem('adminLockUntil');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockTime) {
      const lockUntil = parseInt(storedLockTime);
      const now = Date.now();
      
      if (lockUntil > now) {
        setIsLocked(true);
        setLockTimer(Math.ceil((lockUntil - now) / 1000));
      } else {
        localStorage.removeItem('adminLockUntil');
        localStorage.removeItem('adminLoginAttempts');
      }
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await signIn(data.email, data.password);

      if (authError) {
        // Increment login attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('adminLoginAttempts', newAttempts.toString());
        
        // Check if account should be locked
        if (newAttempts >= 5) {
          const lockDuration = 15 * 60; // 15 minutes in seconds
          const lockUntil = Date.now() + (lockDuration * 1000);
          
          setIsLocked(true);
          setLockTimer(lockDuration);
          localStorage.setItem('adminLockUntil', lockUntil.toString());
          
          setError('Too many failed login attempts. Account locked for 15 minutes.');
        } else {
          // Handle specific error types
          switch (authError.message) {
            case 'Invalid login credentials':
              setError(`Invalid email or password. ${5 - newAttempts} attempts remaining.`);
              break;
            case 'Email not confirmed':
              setError('Please verify your email address before signing in.');
              break;
            case 'Too many requests':
              setError('Too many login attempts. Please wait a few minutes before trying again.');
              break;
            default:
              setError(authError.message || 'An error occurred during sign in.');
          }
        }
      } else {
        // Successful login - check if user has admin permissions
        // This will be handled by the AdminRoute component
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('adminLockUntil');
        navigate('/admin');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLockTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isLocked ? (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Account Temporarily Locked</h3>
              <p className="text-yellow-700 text-sm mb-2">
                Too many failed login attempts. Please try again in:
              </p>
              <div className="text-center">
                <span className="text-2xl font-bold text-yellow-800">{formatLockTime(lockTimer)}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      validate: (value) => validateEmail(value) || 'Please enter a valid email address'
                    })}
                    type="email"
                    id="admin-email"
                    name="email"
                    autoComplete="email"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="admin@example.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password"
                    name="password"
                    autoComplete="current-password"
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('rememberMe')}
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In to Admin</span>
                )}
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              This is a secure area. All login attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;