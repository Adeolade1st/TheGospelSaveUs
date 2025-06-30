import { supabase } from '../lib/supabase';

export interface AdminCheckResponse {
  isAdmin: boolean;
  hasPermission: boolean;
  role: string;
  permissions: string[];
  error?: string;
}

export class AdminApiService {
  private static async makeAdminRequest(
    endpoint: string, 
    data?: any, 
    method: string = 'POST'
  ): Promise<AdminCheckResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
      const functionUrl = `${baseUrl}/functions/v1/${endpoint}`;

      const response = await fetch(functionUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Request failed`);
      }

      return await response.json();
    } catch (error) {
      console.error('Admin API request failed:', error);
      return {
        isAdmin: false,
        hasPermission: false,
        role: 'user',
        permissions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async checkAdminStatus(userId: string, requiredPermission?: string): Promise<AdminCheckResponse> {
    return this.makeAdminRequest('admin-middleware', {
      userId,
      requiredPermission
    });
  }

  static async verifyAdminAccess(requiredPermission?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const result = await this.checkAdminStatus(user.id, requiredPermission);
      return result.isAdmin && result.hasPermission;
    } catch (error) {
      console.error('Admin access verification failed:', error);
      return false;
    }
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    const result = await this.checkAdminStatus(userId);
    return result.permissions;
  }

  static async getUserRole(userId: string): Promise<string> {
    const result = await this.checkAdminStatus(userId);
    return result.role;
  }
}