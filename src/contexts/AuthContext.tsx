import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AdminApiService } from '../utils/adminApi';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  userPermissions: string[] | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[] | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role and permissions if user exists
      if (session?.user) {
        try {
          const { role, permissions, error } = await AdminApiService.checkAdminStatus(session.user.id);
          if (!error) {
            setUserRole(role);
            setUserPermissions(permissions);
          } else {
            console.error('Error fetching user role:', error);
            setUserRole('user'); // Default to user role if there's an error
            setUserPermissions([]);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setUserRole('user');
          setUserPermissions([]);
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Reset role and permissions when signing out
        if (event === 'SIGNED_OUT') {
          setUserRole(null);
          setUserPermissions(null);
        }
        
        // Fetch user role and permissions when signing in
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          try {
            const { role, permissions, error } = await AdminApiService.checkAdminStatus(session.user.id);
            if (!error) {
              setUserRole(role);
              setUserPermissions(permissions);
            } else {
              console.error('Error fetching user role:', error);
              setUserRole('user');
              setUserPermissions([]);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            setUserRole('user');
            setUserPermissions([]);
          }
        }
        
        setLoading(false);

        // Create user profile on sign up
        if (event === 'SIGNED_UP' && session?.user) {
          await createUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null
          }
        }
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    userPermissions,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};