import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredPermission,
  fallbackPath = '/admin/login' 
}) => {
  const { 
    user, 
    loading, 
    canAccessAdminDashboard, 
    hasPermission, 
    role 
  } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-red-600" size={48} />
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user can access admin dashboard
  if (!canAccessAdminDashboard()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="text-red-600" size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              You don't have permission to access the admin dashboard. Please contact an administrator if you believe this is an error.
            </p>

            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-red-500" size={16} />
                  <span className="text-sm text-red-700 font-medium">
                    Required: Admin privileges
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Current role: {role}
                </p>
              </div>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check specific permission if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-yellow-600" size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Insufficient Permissions
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              You don't have the required permissions to access this section of the admin dashboard.
            </p>

            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-yellow-500" size={16} />
                  <span className="text-sm text-yellow-700 font-medium">
                    Required permission: {requiredPermission}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;