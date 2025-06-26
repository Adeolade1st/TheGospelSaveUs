import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

class SupabaseStorageService {
  private bucketName = 'audio-files';

  /**
   * Initialize storage bucket if it doesn't exist
   */
  async initializeBucket(): Promise<boolean> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return false;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['audio/*'],
          fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }

        console.log(`Created bucket: ${this.bucketName}`);
      }

      return true;
    } catch (error) {
      console.error('Error initializing bucket:', error);
      return false;
    }
  }

  /**
   * Upload an audio file to Supabase Storage
   */
  async uploadAudioFile(file: File, fileName?: string): Promise<UploadResult> {
    try {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        return {
          success: false,
          error: 'File must be an audio file'
        };
      }

      // Generate unique filename if not provided
      const timestamp = Date.now();
      const sanitizedName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${sanitizedName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * List all audio files in the bucket
   */
  async listAudioFiles(): Promise<StorageFile[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

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
   * Delete an audio file from storage
   */
  async deleteAudioFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Get signed URL for private access (if needed)
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

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
   * Update audio file metadata in the database
   */
  async updateSpokenWordContent(id: string, audioUrl: string, duration?: string): Promise<boolean> {
    try {
      const updateData: any = { audio_url: audioUrl };
      if (duration) {
        updateData.duration = duration;
      }

      const { error } = await supabase
        .from('spoken_word_content')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating spoken word content:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating spoken word content:', error);
      return false;
    }
  }

  /**
   * Create new spoken word content with uploaded audio
   */
  async createSpokenWordContent(data: {
    title: string;
    artist?: string;
    description?: string;
    audioUrl: string;
    language: 'yoruba' | 'igbo' | 'hausa' | 'english';
    duration?: string;
    scriptureRef?: string;
    theme?: string;
    thumbnail?: string;
  }): Promise<string | null> {
    try {
      const { data: result, error } = await supabase
        .from('spoken_word_content')
        .insert({
          title: data.title,
          artist: data.artist || 'Evangelist Birdie Jones',
          description: data.description,
          audio_url: data.audioUrl,
          language: data.language,
          duration: data.duration || '0:00',
          scripture_ref: data.scriptureRef,
          theme: data.theme,
          thumbnail: data.thumbnail,
          is_active: true
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating spoken word content:', error);
        return null;
      }

      return result.id;
    } catch (error) {
      console.error('Error creating spoken word content:', error);
      return null;
    }
  }

  /**
   * Get all spoken word content from database
   */
  async getSpokenWordContent(language?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('spoken_word_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (language) {
        query = query.eq('language', language);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching spoken word content:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching spoken word content:', error);
      return [];
    }
  }
}

export const storageService = new SupabaseStorageService();