import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RBACService } from '../../utils/rbac';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions/roles
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  role,
  fallback = null,
  requireAll = false
}) => {
  const { user } = useAuth();

  const hasAccess = () => {
    if (!user) return false;

    const checks: boolean[] = [];

    if (permission) {
      if (Array.isArray(permission)) {
        const permissionChecks = permission.map(p => RBACService.hasPermission(user, p));
        checks.push(requireAll ? permissionChecks.every(Boolean) : permissionChecks.some(Boolean));
      } else {
        checks.push(RBACService.hasPermission(user, permission));
      }
    }

    if (role) {
      if (Array.isArray(role)) {
        const roleChecks = role.map(r => RBACService.hasRole(user, r));
        checks.push(requireAll ? roleChecks.every(Boolean) : roleChecks.some(Boolean));
      } else {
        checks.push(RBACService.hasRole(user, role));
      }
    }

    // If no permission or role specified, allow access
    if (checks.length === 0) return true;

    return requireAll ? checks.every(Boolean) : checks.some(Boolean);
  };

  return hasAccess() ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;