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

  // Event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    const handleLoadStart = () => {
      updateState({ isLoading: true, error: null, isReady: false });
    };

    const handleLoadedMetadata = () => {
      updateState({ duration: audio.duration });
    };

    const handleCanPlay = () => {
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
      updateState({ isPlaying: false, currentTime: 0 });
      onTrackEnd?.();
    };

    const handleError = (e: Event) => {
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
      updateState({ isLoading: false });
    };

    const handleVolumeChange = () => {
      updateState({ 
        volume: audio.volume, 
        isMuted: audio.muted 
      });
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

    // Set initial volume and configure CORS
    audio.volume = state.volume;
    audio.crossOrigin = 'anonymous';

    // Set the source
    if (audioSrc) {
      audio.src = audioSrc;
      audio.load();
    }

    return () => {
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
    };
  }, [audioSrc, onTrackEnd, onError, onReady, updateState, state.volume]);

  // Reset state when source changes
  useEffect(() => {
    updateState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      error: null,
      isReady: false,
      bufferedPercentage: 0
    });
  }, [audioSrc, updateState]);

  // Control functions
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !state.isReady) return;

    try {
      await audio.play();
      updateState({ isPlaying: true, error: null });
    } catch (error) {
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
      
      updateState({ error: errorMessage, isPlaying: false });
      onError?.(errorMessage);
    }
  }, [state.isReady, updateState, onError]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    updateState({ isPlaying: false });
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