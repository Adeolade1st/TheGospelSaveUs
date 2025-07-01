/**
 * Audio Download Utility
 * Handles downloading audio files with proper metadata and formatting
 */

interface AudioMetadata {
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string;
  language?: string;
}

interface DownloadOptions {
  filename?: string;
  quality?: 'high' | 'medium' | 'low';
  format?: 'mp3' | 'wav' | 'ogg';
}

export class AudioDownloadService {
  /**
   * Download audio file with proper metadata
   */
  static async downloadAudio(
    audioUrl: string, 
    metadata: AudioMetadata, 
    options: DownloadOptions = {}
  ): Promise<boolean> {
    try {
      console.log('🎵 Starting audio download:', metadata.title);
      
      const {
        filename = this.generateFilename(metadata),
        quality = 'high',
        format = 'mp3'
      } = options;

      // Check if the audio URL is accessible
      const response = await fetch(audioUrl, {
        method: 'HEAD'
      });

      if (!response.ok) {
        throw new Error(`Audio file not accessible: ${response.status}`);
      }

      // Get file size for progress tracking
      const contentLength = response.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

      console.log(`📁 File size: ${this.formatFileSize(fileSize)}`);

      // Download the audio file
      const downloadResponse = await fetch(audioUrl);
      
      if (!downloadResponse.ok) {
        throw new Error(`Download failed: ${downloadResponse.status}`);
      }

      const blob = await downloadResponse.blob();
      
      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Add metadata to the download
      link.setAttribute('data-title', metadata.title);
      link.setAttribute('data-artist', metadata.artist);
      if (metadata.album) link.setAttribute('data-album', metadata.album);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      
      console.log('✅ Download completed:', filename);
      return true;
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  /**
   * Generate a proper filename from metadata
   */
  private static generateFilename(metadata: AudioMetadata): string {
    const sanitize = (str: string) => str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const artist = sanitize(metadata.artist);
    const title = sanitize(metadata.title);
    const timestamp = new Date().getFullYear();
    
    return `${artist}_-_${title}_${timestamp}.mp3`;
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if browser supports audio downloads
   */
  static isDownloadSupported(): boolean {
    return typeof document !== 'undefined' && 'createElement' in document;
  }

  /**
   * Get estimated download time
   */
  static estimateDownloadTime(fileSizeBytes: number, connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium'): string {
    const speeds = {
      slow: 1 * 1024 * 1024, // 1 Mbps
      medium: 5 * 1024 * 1024, // 5 Mbps
      fast: 25 * 1024 * 1024 // 25 Mbps
    };
    
    const bytesPerSecond = speeds[connectionSpeed] / 8; // Convert to bytes per second
    const seconds = fileSizeBytes / bytesPerSecond;
    
    if (seconds < 60) {
      return `${Math.ceil(seconds)} seconds`;
    } else {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  /**
   * Create a download progress tracker
   */
  static async downloadWithProgress(
    audioUrl: string,
    metadata: AudioMetadata,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    try {
      console.log('🎵 Starting download with progress tracking:', metadata.title);
      
      const response = await fetch(audioUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        received += value.length;
        
        if (total > 0 && onProgress) {
          const progress = (received / total) * 100;
          onProgress(Math.round(progress));
        }
      }

      // Combine chunks into a single array
      const allChunks = new Uint8Array(received);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // Create blob and download
      const blob = new Blob([allChunks], { type: 'audio/mpeg' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const filename = this.generateFilename(metadata);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      
      console.log('✅ Download with progress completed:', filename);
      return true;
      
    } catch (error) {
      console.error('❌ Download with progress failed:', error);
      throw error;
    }
  }
}

// Export utility functions
export const downloadAudio = AudioDownloadService.downloadAudio.bind(AudioDownloadService);
export const downloadWithProgress = AudioDownloadService.downloadWithProgress.bind(AudioDownloadService);
export const isDownloadSupported = AudioDownloadService.isDownloadSupported.bind(AudioDownloadService);
export const estimateDownloadTime = AudioDownloadService.estimateDownloadTime.bind(AudioDownloadService);