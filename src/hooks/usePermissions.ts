import { useAuth } from '../contexts/AuthContext';
import { RBACService } from '../utils/rbac';

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    user,
    role: RBACService.getUserRole(user),
    permissions: RBACService.getUserPermissions(user),
    hasPermission: (permission: string) => RBACService.hasPermission(user, permission),
    hasRole: (role: string) => RBACService.hasRole(user, role),
    isAdmin: () => RBACService.isAdmin(user),
    isModerator: () => RBACService.isModerator(user),
    canAccessAdminDashboard: () => RBACService.canAccessAdminDashboard(user),
    canManageUsers: () => RBACService.canManageUsers(user),
    canManageContent: () => RBACService.canManageContent(user),
    canAccessAnalytics: () => RBACService.canAccessAnalytics(user),
    canManageSystem: () => RBACService.canManageSystem(user)
  };
};