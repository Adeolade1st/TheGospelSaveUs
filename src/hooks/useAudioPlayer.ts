import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioPlayerState, AudioTrack } from '../types/audio';

interface UseAudioPlayerProps {
  audioUrl?: string;
  audioFile?: File;
  onTrackEnd?: () => void;
  onError?: (error: string) => void;
  onReady?: () => void;
}

export const useAudioPlayer = ({
  audioUrl,
  audioFile,
  onTrackEnd,
  onError,
  onReady
}: UseAudioPlayerProps = {}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
    error: null,
    isReady: false,
    bufferedPercentage: 0
  });

  // Create object URL for file if provided
  const audioSrc = audioFile ? URL.createObjectURL(audioFile) : audioUrl;

  // Update state helper
  const updateState = useCallback((updates: Partial<AudioPlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear timeouts helper
  const clearTimeouts = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
  }, []);

  // Event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    const handleLoadStart = () => {
      updateState({ isLoading: true, error: null, isReady: false });
      
      // Set loading timeout - if audio doesn't load within 15 seconds, show error
      clearTimeouts();
      loadingTimeoutRef.current = setTimeout(() => {
        updateState({ 
          isLoading: false, 
          error: 'Audio loading timeout - file may be too large, corrupted, or inaccessible',
          isReady: false 
        });
        onError?.('Audio loading timeout - file may be too large, corrupted, or inaccessible');
      }, 15000); // 15 second timeout
    };

    const handleLoadedMetadata = () => {
      updateState({ duration: audio.duration });
    };

    const handleCanPlay = () => {
      clearTimeouts();
      updateState({ isLoading: false, isReady: true });
      onReady?.();
    };

    const handleTimeUpdate = () => {
      updateState({ currentTime: audio.currentTime });
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const bufferedPercentage = (bufferedEnd / audio.duration) * 100;
        updateState({ bufferedPercentage });
      }
    };

    const handleEnded = () => {
      clearTimeouts();
      updateState({ isPlaying: false, currentTime: 0 });
      onTrackEnd?.();
    };

    const handleError = (e: Event) => {
      clearTimeouts();
      const audioElement = e.target as HTMLAudioElement;
      let errorMessage = 'Audio playback failed';
      
      if (audioElement.error) {
        switch (audioElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error - check connection and file location';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error - file may be corrupted or wrong format';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported or file not found';
            break;
          default:
            errorMessage = `Audio error code: ${audioElement.error.code}`;
        }
      }

      // Check for CORS-related errors
      if (errorMessage.includes('CORS') || 
          errorMessage.includes('cross-origin') ||
          audioElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        errorMessage = 'CORS error: Audio file blocked by cross-origin policy';
      }

      updateState({ 
        isLoading: false, 
        isPlaying: false, 
        error: errorMessage 
      });
      onError?.(errorMessage);
    };

    const handleWaiting = () => {
      updateState({ isLoading: true });
    };

    const handleCanPlayThrough = () => {
      clearTimeouts();
      updateState({ isLoading: false });
    };

    const handleVolumeChange = () => {
      updateState({ 
        volume: audio.volume, 
        isMuted: audio.muted 
      });
    };

    const handleStalled = () => {
      // Set a timeout for stalled loading
      if (!loadingTimeoutRef.current) {
        loadingTimeoutRef.current = setTimeout(() => {
          updateState({ 
            isLoading: false, 
            error: 'Audio loading stalled - network issues or file problems',
            isReady: false 
          });
          onError?.('Audio loading stalled - network issues or file problems');
        }, 10000); // 10 second timeout for stalled loading
      }
    };

    const handleSuspend = () => {
      // Clear loading timeout when loading is suspended (normal behavior)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);

    // Set initial volume and configure CORS
    audio.volume = state.volume;
    audio.crossOrigin = 'anonymous';

    // Set the source
    if (audioSrc) {
      audio.src = audioSrc;
      audio.load();
    }

    return () => {
      clearTimeouts();
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
    };
  }, [audioSrc, onTrackEnd, onError, onReady, updateState, state.volume, clearTimeouts]);

  // Reset state when source changes
  useEffect(() => {
    clearTimeouts();
    updateState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      error: null,
      isReady: false,
      bufferedPercentage: 0
    });
  }, [audioSrc, updateState, clearTimeouts]);

  // Control functions
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !state.isReady) return;

    try {
      updateState({ isLoading: true, error: null });
      
      // Set play timeout - if play doesn't succeed within 8 seconds, show error
      playTimeoutRef.current = setTimeout(() => {
        updateState({ 
          isLoading: false, 
          error: 'Playback timeout - audio may be corrupted or network issues',
          isPlaying: false 
        });
        onError?.('Playback timeout - audio may be corrupted or network issues');
      }, 8000); // 8 second timeout for play operation

      await audio.play();
      
      // Clear timeout on successful play
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
        playTimeoutRef.current = null;
      }
      
      updateState({ isPlaying: true, error: null, isLoading: false });
    } catch (error) {
      // Clear timeout on error
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
        playTimeoutRef.current = null;
      }
      
      let errorMessage = 'Playback failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for CORS-related errors
        if (error.message.includes('CORS') || 
            error.message.includes('cross-origin') ||
            error.name === 'NotAllowedError') {
          errorMessage = 'CORS error: Audio file blocked by cross-origin policy';
        }
      }
      
      updateState({ error: errorMessage, isPlaying: false, isLoading: false });
      onError?.(errorMessage);
    }
  }, [state.isReady, updateState, onError]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Clear any pending play timeout
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }

    audio.pause();
    updateState({ isPlaying: false, isLoading: false });
  }, [updateState]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !state.isReady) return;

    audio.currentTime = Math.max(0, Math.min(time, state.duration));
  }, [state.isReady, state.duration]);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    audio.volume = clampedVolume;
    updateState({ volume: clampedVolume, isMuted: clampedVolume === 0 });
  }, [updateState]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isMuted) {
      audio.volume = state.volume;
      audio.muted = false;
      updateState({ isMuted: false });
    } else {
      audio.muted = true;
      updateState({ isMuted: true });
    }
  }, [state.isMuted, state.volume, updateState]);

  const skipForward = useCallback((seconds: number = 10) => {
    seek(state.currentTime + seconds);
  }, [state.currentTime, seek]);

  const skipBackward = useCallback((seconds: number = 10) => {
    seek(state.currentTime - seconds);
  }, [state.currentTime, seek]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    audioRef,
    state,
    controls: {
      play,
      pause,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      skipForward,
      skipBackward
    }
  };
};