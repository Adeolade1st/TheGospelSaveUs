import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class StorageService {
  static readonly AUDIO_BUCKET = 'spoken-word-audio';

  /**
   * Get a public URL for an audio file
   * @param path Path within the audio bucket
   * @returns Public URL for streaming
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage.from(this.AUDIO_BUCKET).getPublicUrl(path);
    console.log('Storage service generating URL for path:', path);
    console.log('Generated public URL:', data.publicUrl);
    return data.publicUrl;
  }

  /**
   * Create a signed URL for secure downloads
   * @param path Path within the audio bucket
   * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL with expiration
   */
  static async createSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.AUDIO_BUCKET)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
  }

  /**
   * Upload a file to storage
   * @param path Path within the audio bucket
   * @param file File to upload
   * @returns Public URL if successful, null otherwise
   */
  static async uploadFile(path: string, file: File): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.AUDIO_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      return this.getPublicUrl(data.path);
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  /**
   * List all files in the audio bucket
   * @param folder Optional folder path within the bucket
   * @returns Array of file objects
   */
  static async listFiles(folder = ''): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.AUDIO_BUCKET)
        .list(folder);

      if (error) {
        console.error('Error listing files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Delete a file from storage
   * @param path Path within the audio bucket
   * @returns True if successful, false otherwise
   */
  static async deleteFile(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.AUDIO_BUCKET)
        .remove([path]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   * @param path Path within the audio bucket
   * @returns File metadata if successful, null otherwise
   */
  static async getFileMetadata(path: string): Promise<any | null> {
    try {
      // This is a workaround since Supabase doesn't have a direct method to get metadata
      const { data, error } = await supabase.storage
        .from(this.AUDIO_BUCKET)
        .list('', {
          search: path
        });

      if (error || !data || data.length === 0) {
        console.error('Error getting file metadata:', error);
        return null;
      }

      return data.find(file => file.name === path.split('/').pop());
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }
}