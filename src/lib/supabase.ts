import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      spoken_word_content: {
        Row: {
          id: string;
          title: string;
          artist: string;
          description: string | null;
          audio_url: string;
          language: 'yoruba' | 'igbo' | 'hausa' | 'english';
          duration: string;
          scripture_ref: string | null;
          theme: string | null;
          thumbnail: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          artist?: string;
          description?: string | null;
          audio_url: string;
          language: 'yoruba' | 'igbo' | 'hausa' | 'english';
          duration?: string;
          scripture_ref?: string | null;
          theme?: string | null;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string;
          description?: string | null;
          audio_url?: string;
          language?: 'yoruba' | 'igbo' | 'hausa' | 'english';
          duration?: string;
          scripture_ref?: string | null;
          theme?: string | null;
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
    };
  };
}

// Type helpers
export type SpokenWordContent = Database['public']['Tables']['spoken_word_content']['Row'];
export type SpokenWordContentInsert = Database['public']['Tables']['spoken_word_content']['Insert'];
export type SpokenWordContentUpdate = Database['public']['Tables']['spoken_word_content']['Update'];