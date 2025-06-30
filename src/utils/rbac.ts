import { AuthUser, Permission } from '../types/auth';

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

export const PERMISSIONS = {
  // Admin permissions
  ADMIN_DASHBOARD_ACCESS: 'admin:dashboard:read',
  USER_MANAGEMENT: 'admin:users:manage',
  CONTENT_MANAGEMENT: 'admin:content:manage',
  ANALYTICS_ACCESS: 'admin:analytics:read',
  SYSTEM_SETTINGS: 'admin:system:manage',
  
  // User permissions
  PROFILE_READ: 'user:profile:read',
  PROFILE_UPDATE: 'user:profile:update',
  CONTENT_VIEW: 'user:content:read',
  
  // Moderator permissions
  CONTENT_MODERATE: 'moderator:content:moderate',
  USER_MODERATE: 'moderator:users:moderate'
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ADMIN_DASHBOARD_ACCESS,
    PERMISSIONS.USER_MANAGEMENT,
    PERMISSIONS.CONTENT_MANAGEMENT,
    PERMISSIONS.ANALYTICS_ACCESS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.USER_MODERATE
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.USER_MODERATE,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.CONTENT_VIEW
  ],
  [ROLES.USER]: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.CONTENT_VIEW
  ]
} as const;

export class RBACService {
  static getUserRole(user: AuthUser | null): string {
    if (!user) return ROLES.USER;
    
    // Check app_metadata first (server-side role)
    if (user.app_metadata?.role) {
      return user.app_metadata.role;
    }
    
    // Fallback to user_metadata (client-side role)
    if (user.user_metadata?.role) {
      return user.user_metadata.role;
    }
    
    return ROLES.USER;
  }

  static getUserPermissions(user: AuthUser | null): string[] {
    if (!user) return ROLE_PERMISSIONS[ROLES.USER];
    
    const role = this.getUserRole(user);
    
    // Check for explicit permissions in app_metadata
    if (user.app_metadata?.permissions) {
      return user.app_metadata.permissions;
    }
    
    // Return default permissions for role
    return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS[ROLES.USER];
  }

  static hasPermission(user: AuthUser | null, permission: string): boolean {
    const userPermissions = this.getUserPermissions(user);
    return userPermissions.includes(permission);
  }

  static hasRole(user: AuthUser | null, role: string): boolean {
    const userRole = this.getUserRole(user);
    return userRole === role;
  }

  static isAdmin(user: AuthUser | null): boolean {
    return this.hasRole(user, ROLES.ADMIN);
  }

  static isModerator(user: AuthUser | null): boolean {
    return this.hasRole(user, ROLES.MODERATOR);
  }

  static canAccessAdminDashboard(user: AuthUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.ADMIN_DASHBOARD_ACCESS);
  }

  static canManageUsers(user: AuthUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.USER_MANAGEMENT);
  }

  static canManageContent(user: AuthUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.CONTENT_MANAGEMENT);
  }

  static canAccessAnalytics(user: AuthUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.ANALYTICS_ACCESS);
  }

  static canManageSystem(user: AuthUser | null): boolean {
    return this.hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS);
  }
}