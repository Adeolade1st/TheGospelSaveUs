import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../utils/rbac';

export const usePermissions = () => {
  const { user, userRole, userPermissions, loading } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!userRole) return false;
    return userRole === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isModerator = (): boolean => {
    return hasRole('moderator');
  };

  const canAccessAdminDashboard = (): boolean => {
    return hasPermission(PERMISSIONS.ADMIN_DASHBOARD_ACCESS);
  };

  const canManageUsers = (): boolean => {
    return hasPermission(PERMISSIONS.USER_MANAGEMENT);
  };

  const canManageContent = (): boolean => {
    return hasPermission(PERMISSIONS.CONTENT_MANAGEMENT);
  };

  const canAccessAnalytics = (): boolean => {
    return hasPermission(PERMISSIONS.ANALYTICS_ACCESS);
  };

  const canManageSystem = (): boolean => {
    return hasPermission(PERMISSIONS.SYSTEM_SETTINGS);
  };

  return {
    user,
    role: userRole || 'user',
    permissions: userPermissions || [],
    hasPermission,
    hasRole,
    isAdmin,
    isModerator,
    canAccessAdminDashboard,
    canManageUsers,
    canManageContent,
    canAccessAnalytics,
    canManageSystem,
    loading
  };
};