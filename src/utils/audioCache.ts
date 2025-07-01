/**
 * Audio Caching and Optimization Utility
 * Implements intelligent caching for MP3 files and audio optimization
 */

interface CacheEntry {
  blob: Blob;
  timestamp: number;
  url: string;
  metadata: {
    title: string;
    artist: string;
    duration: string;
    size: number;
  };
}

interface AudioOptimizationOptions {
  quality: 'high' | 'medium' | 'low';
  enableCaching: boolean;
  preloadStrategy: 'none' | 'metadata' | 'auto';
  maxCacheSize: number; // in MB
}

export class AudioCacheService {
  private static cache = new Map<string, CacheEntry>();
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly DEFAULT_MAX_CACHE_SIZE = 100; // 100MB

  /**
   * Initialize audio caching with optimization settings
   */
  static initialize(options: Partial<AudioOptimizationOptions> = {}) {
    const config = {
      quality: 'high',
      enableCaching: true,
      preloadStrategy: 'metadata',
      maxCacheSize: this.DEFAULT_MAX_CACHE_SIZE,
      ...options
    } as AudioOptimizationOptions;

    console.log('🎵 Audio cache initialized:', config);
    
    // Clean up expired cache entries on initialization
    this.cleanupExpiredEntries();
    
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60 * 60 * 1000); // Every hour

    return config;
  }

  /**
   * Get cached audio or fetch and cache if not available
   */
  static async getCachedAudio(url: string, metadata: any): Promise<string> {
    const cacheKey = this.generateCacheKey(url);
    
    // Check if audio is already cached and not expired
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      console.log('🎯 Cache hit for:', metadata.title);
      return URL.createObjectURL(cached.blob);
    }

    console.log('📥 Fetching and caching audio:', metadata.title);
    
    try {
      // For local files, we need to handle them differently
      if (url.startsWith('/')) {
        console.log('🏠 Local file detected:', url);
        // Return the URL as is for local files
        return url;
      }
      
      // Fetch the audio file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      const size = blob.size;

      // Check cache size limits
      if (this.getCacheSize() + size > this.DEFAULT_MAX_CACHE_SIZE * 1024 * 1024) {
        this.evictOldestEntries(size);
      }

      // Cache the audio
      const cacheEntry: CacheEntry = {
        blob,
        timestamp: Date.now(),
        url,
        metadata: {
          title: metadata.title,
          artist: metadata.artist,
          duration: metadata.duration,
          size
        }
      };

      this.cache.set(cacheKey, cacheEntry);
      console.log('✅ Audio cached successfully:', metadata.title);

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('❌ Failed to cache audio:', error);
      // Return original URL as fallback
      return url;
    }
  }

  /**
   * Preload audio files for better performance
   */
  static async preloadAudio(audioList: Array<{ url: string; metadata: any }>) {
    console.log('🚀 Preloading audio files:', audioList.length);
    
    const preloadPromises = audioList.map(async ({ url, metadata }) => {
      try {
        // For local files, we don't need to preload
        if (url.startsWith('/')) {
          console.log('✅ Local file, no preload needed:', metadata.title);
          return;
        }
        
        await this.getCachedAudio(url, metadata);
        console.log('✅ Preloaded:', metadata.title);
      } catch (error) {
        console.warn('⚠️ Failed to preload:', metadata.title, error);
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('🎯 Audio preloading completed');
  }

  /**
   * Optimize audio element for better performance
   */
  static optimizeAudioElement(audioElement: HTMLAudioElement, options: Partial<AudioOptimizationOptions> = {}) {
    const config = {
      preloadStrategy: 'metadata',
      ...options
    };

    // Set preload strategy
    audioElement.preload = config.preloadStrategy;
    
    // Enable cross-origin for cached content
    audioElement.crossOrigin = 'anonymous';
    
    // Optimize for streaming
    audioElement.setAttribute('controlsList', 'nodownload');
    
    // Add performance optimizations
    audioElement.addEventListener('loadstart', () => {
      console.log('🎵 Audio loading started');
    });

    audioElement.addEventListener('canplaythrough', () => {
      console.log('✅ Audio ready for playback');
    });

    audioElement.addEventListener('error', (e) => {
      console.error('❌ Audio error:', e);
    });

    return audioElement;
  }

  /**
   * Lazy load audio content when needed
   */
  static createLazyAudioLoader(audioUrl: string, metadata: any) {
    let audioElement: HTMLAudioElement | null = null;
    let isLoaded = false;

    return {
      async load(): Promise<HTMLAudioElement> {
        if (isLoaded && audioElement) {
          return audioElement;
        }

        console.log('🔄 Lazy loading audio:', metadata.title);
        
        // For local files, we don't need to cache
        if (audioUrl.startsWith('/')) {
          audioElement = new Audio(audioUrl);
        } else {
          const cachedUrl = await AudioCacheService.getCachedAudio(audioUrl, metadata);
          audioElement = new Audio(cachedUrl);
        }
        
        AudioCacheService.optimizeAudioElement(audioElement);
        isLoaded = true;
        
        return audioElement;
      },

      unload() {
        if (audioElement) {
          audioElement.pause();
          audioElement.src = '';
          audioElement = null;
          isLoaded = false;
          console.log('🗑️ Audio unloaded:', metadata.title);
        }
      },

      get isLoaded() {
        return isLoaded;
      }
    };
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.metadata.size, 0);
    
    return {
      entryCount: entries.length,
      totalSize: this.formatBytes(totalSize),
      oldestEntry: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.timestamp))) : null,
      newestEntry: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.timestamp))) : null
    };
  }

  /**
   * Clear all cached audio
   */
  static clearCache() {
    console.log('🗑️ Clearing audio cache');
    this.cache.clear();
  }

  /**
   * Private helper methods
   */
  private static generateCacheKey(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }

  private static isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.CACHE_EXPIRY;
  }

  private static cleanupExpiredEntries() {
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  private static getCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.metadata.size, 0);
  }

  private static evictOldestEntries(requiredSpace: number) {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    let freedSpace = 0;
    const keysToRemove: string[] = [];

    for (const [key, entry] of entries) {
      keysToRemove.push(key);
      freedSpace += entry.metadata.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }

    keysToRemove.forEach(key => {
      this.cache.delete(key);
    });

    console.log(`🗑️ Evicted ${keysToRemove.length} cache entries to free ${this.formatBytes(freedSpace)}`);
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export convenience functions
export const initializeAudioCache = AudioCacheService.initialize.bind(AudioCacheService);
export const getCachedAudio = AudioCacheService.getCachedAudio.bind(AudioCacheService);
export const preloadAudio = AudioCacheService.preloadAudio.bind(AudioCacheService);
export const createLazyAudioLoader = AudioCacheService.createLazyAudioLoader.bind(AudioCacheService);
export const getCacheStats = AudioCacheService.getCacheStats.bind(AudioCacheService);
export const clearAudioCache = AudioCacheService.clearCache.bind(AudioCacheService);