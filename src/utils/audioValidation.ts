/**
 * Audio File Validation Utility
 * Comprehensive validation for MP3 files and audio playback
 */

export interface AudioValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    exists: boolean;
    size?: number;
    contentType?: string;
    isMP3: boolean;
    duration?: number;
  };
}

export interface BrowserAudioSupport {
  mp3: boolean;
  wav: boolean;
  ogg: boolean;
  webm: boolean;
  autoplay: boolean;
}

export class AudioValidator {
  /**
   * Check browser audio support capabilities
   */
  static getBrowserAudioSupport(): BrowserAudioSupport {
    const audio = document.createElement('audio');
    
    return {
      mp3: audio.canPlayType('audio/mpeg') !== '',
      wav: audio.canPlayType('audio/wav') !== '',
      ogg: audio.canPlayType('audio/ogg') !== '',
      webm: audio.canPlayType('audio/webm') !== '',
      autoplay: 'autoplay' in audio
    };
  }

  /**
   * Validate audio file URL and accessibility
   */
  static async validateAudioFile(url: string): Promise<AudioValidationResult> {
    const result: AudioValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      fileInfo: {
        exists: false,
        isMP3: false
      }
    };

    try {
      // Check URL format
      if (!url || typeof url !== 'string') {
        result.errors.push('Invalid audio URL provided');
        return result;
      }

      // For local files, we need special handling
      if (url.startsWith('/')) {
        console.log('🏠 Local file detected:', url);
        
        // Check if URL appears to be MP3
        const isMP3Url = url.toLowerCase().endsWith('.mp3');
        result.fileInfo.isMP3 = isMP3Url;
        
        if (!isMP3Url) {
          result.warnings.push('URL does not appear to be an MP3 file');
        }
        
        // For local files, we'll assume they exist but add a warning
        result.fileInfo.exists = true;
        result.warnings.push('Local file: existence assumed but not verified');
        result.isValid = true;
        
        return result;
      }

      // Check if URL appears to be MP3
      const isMP3Url = url.toLowerCase().includes('.mp3') || 
                       url.includes('audio/mpeg') || 
                       url.includes('audio/mp3');
      
      result.fileInfo.isMP3 = isMP3Url;

      if (!isMP3Url) {
        result.warnings.push('URL does not appear to be an MP3 file');
      }

      // Perform HEAD request to check file existence and properties
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });

      result.fileInfo.exists = response.ok;

      if (!response.ok) {
        result.errors.push(`File not accessible (HTTP ${response.status})`);
        return result;
      }

      // Get file information from headers
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const acceptRanges = response.headers.get('accept-ranges');

      result.fileInfo.contentType = contentType || undefined;
      result.fileInfo.size = contentLength ? parseInt(contentLength, 10) : undefined;

      // Validate content type
      if (contentType) {
        if (!contentType.includes('audio')) {
          result.errors.push(`Invalid content type: ${contentType}`);
        } else if (!contentType.includes('mpeg') && !contentType.includes('mp3')) {
          result.warnings.push(`Content type suggests non-MP3 format: ${contentType}`);
        }
      } else {
        result.warnings.push('No content type header found');
      }

      // Check file size
      if (result.fileInfo.size) {
        if (result.fileInfo.size < 1024) {
          result.warnings.push('File size is very small, may be corrupted');
        } else if (result.fileInfo.size > 50 * 1024 * 1024) {
          result.warnings.push('File size is very large, may cause loading issues');
        }
      }

      // Check if server supports range requests (important for audio seeking)
      if (acceptRanges !== 'bytes') {
        result.warnings.push('Server does not support range requests, seeking may not work');
      }

      // If we get here, basic validation passed
      result.isValid = result.errors.length === 0;

    } catch (error) {
      console.error('Audio validation error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        result.errors.push('Network error: Unable to connect to audio server');
      } else if (error instanceof Error) {
        result.errors.push(`Validation error: ${error.message}`);
      } else {
        result.errors.push('Unknown validation error occurred');
      }
    }

    return result;
  }

  /**
   * Test audio playback capability
   */
  static async testAudioPlayback(url: string): Promise<{
    canPlay: boolean;
    error?: string;
    duration?: number;
  }> {
    return new Promise((resolve) => {
      const audio = new Audio();
      let resolved = false;

      const cleanup = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      };

      const onCanPlay = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve({
          canPlay: true,
          duration: audio.duration
        });
      };

      const onError = () => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve({
          canPlay: false,
          error: audio.error?.message || 'Unknown playback error'
        });
      };

      const onLoadedMetadata = () => {
        // Additional check when metadata is loaded
        if (audio.duration && audio.duration > 0) {
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve({
              canPlay: true,
              duration: audio.duration
            });
          }
        }
      };

      // Set up event listeners
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({
            canPlay: false,
            error: 'Timeout: Audio took too long to load'
          });
        }
      }, 10000);

      // Start loading
      audio.preload = 'metadata';
      audio.src = url;
    });
  }

  /**
   * Get detailed browser and device information for troubleshooting
   */
  static getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    let browser = 'Unknown';
    let version = 'Unknown';

    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return {
      browser,
      version,
      platform,
      userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  /**
   * Generate troubleshooting recommendations based on error type
   */
  static getTroubleshootingSteps(error: string, browserInfo?: any): string[] {
    const steps: string[] = [];
    const info = browserInfo || this.getBrowserInfo();

    // Network-related errors
    if (error.toLowerCase().includes('network') || 
        error.toLowerCase().includes('fetch') || 
        error.toLowerCase().includes('404') ||
        error.toLowerCase().includes('not found')) {
      steps.push('Check your internet connection');
      steps.push('Try refreshing the page');
      steps.push('Verify the audio file exists');
    }

    // Format/codec errors
    if (error.toLowerCase().includes('format') || 
        error.toLowerCase().includes('codec') || 
        error.toLowerCase().includes('decode') ||
        error.toLowerCase().includes('not supported')) {
      steps.push('Try using a different browser (Chrome, Firefox, Safari)');
      steps.push('Update your browser to the latest version');
      steps.push('Download the MP3 file to play locally');
    }

    // Permission/access errors
    if (error.toLowerCase().includes('403') || 
        error.toLowerCase().includes('forbidden') || 
        error.toLowerCase().includes('access')) {
      steps.push('You may not have permission to access this file');
      steps.push('Try logging in again');
      steps.push('Contact support for assistance');
    }

    // Browser-specific recommendations
    if (info.browser === 'Safari' && parseInt(info.version) < 14) {
      steps.push('Update Safari to version 14 or later for better audio support');
    }

    if (info.browser === 'Firefox' && parseInt(info.version) < 80) {
      steps.push('Update Firefox to version 80 or later for improved audio playback');
    }

    // Mobile-specific recommendations
    if (info.platform.includes('iPhone') || info.platform.includes('iPad')) {
      steps.push('Ensure your device is not in silent mode');
      steps.push('Try using headphones or external speakers');
    }

    // General fallback steps
    if (steps.length === 0) {
      steps.push('Try refreshing the page');
      steps.push('Clear your browser cache and cookies');
      steps.push('Try using a different browser');
      steps.push('Contact support if the problem persists');
    }

    return steps;
  }
}

// Export utility functions
export const validateAudioFile = AudioValidator.validateAudioFile.bind(AudioValidator);
export const testAudioPlayback = AudioValidator.testAudioPlayback.bind(AudioValidator);
export const getBrowserAudioSupport = AudioValidator.getBrowserAudioSupport.bind(AudioValidator);
export const getBrowserInfo = AudioValidator.getBrowserInfo.bind(AudioValidator);
export const getTroubleshootingSteps = AudioValidator.getTroubleshootingSteps.bind(AudioValidator);