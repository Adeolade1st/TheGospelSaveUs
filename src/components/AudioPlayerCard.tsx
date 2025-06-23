import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, AlertCircle } from 'lucide-react';

interface AudioPlayerCardProps {
  title: string;
  language: string;
  description: string;
  audioUrl: string;
  duration: string;
  gradientColors: string;
  textColor: string;
}

const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  title,
  language,
  description,
  audioUrl,
  duration,
  gradientColors,
  textColor
}) => {
  // Create unique keys for localStorage based on audioUrl
  const storageKey = `audio-player-${audioUrl.split('/').pop() || 'default'}`;
  const volumeKey = `${storageKey}-volume`;
  const muteKey = `${storageKey}-muted`;
  const positionKey = `${storageKey}-position`;

  // Initialize state with localStorage values
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const saved = localStorage.getItem(positionKey);
    return saved ? parseFloat(saved) : 0;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(volumeKey);
    return saved ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem(muteKey);
    return saved === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const maxRetries = 3;

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(volumeKey, volume.toString());
  }, [volume, volumeKey]);

  useEffect(() => {
    localStorage.setItem(muteKey, isMuted.toString());
  }, [isMuted, muteKey]);

  useEffect(() => {
    localStorage.setItem(positionKey, currentTime.toString());
  }, [currentTime, positionKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume and mute state
    audio.volume = isMuted ? 0 : volume;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleLoadStart = () => {
      setIsLoading(true);
      setPlaybackError(null);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      // Restore last position if available
      const savedPosition = localStorage.getItem(positionKey);
      if (savedPosition && parseFloat(savedPosition) > 0) {
        audio.currentTime = parseFloat(savedPosition);
      }
    };
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      localStorage.removeItem(positionKey);
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          audio.load();
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        setPlaybackError('Unable to load audio. Please check your connection and try again.');
      }
    };
    const handleCanPlayThrough = () => {
      setIsLoading(false);
      setRetryCount(0); // Reset retry count on successful load
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [volume, isMuted, positionKey, retryCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!audioRef.current) return;
      
      // Only handle keys when the component is focused
      if (!document.activeElement?.closest(`[data-audio-player="${storageKey}"]`)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [storageKey]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || playbackError) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      setPlaybackError('Playback failed. Please try again.');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        const restoredVolume = volume > 0 ? volume : 0.5;
        audioRef.current.volume = restoredVolume;
        setVolume(restoredVolume);
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;

    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const progressWidth = progressBar.offsetWidth;
    const clickRatio = clickX / progressWidth;
    const newTime = clickRatio * audioDuration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const retryLoad = () => {
    setPlaybackError(null);
    setRetryCount(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const progressPercentage = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div 
      className={`${gradientColors} rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 min-h-[400px] flex flex-col`}
      data-audio-player={storageKey}
      tabIndex={0}
      role="region"
      aria-label={`Audio player for ${language} content`}
    >
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Header */}
      <div className="text-center mb-8 flex-shrink-0">
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <span className="text-sm font-bold uppercase tracking-wider">{language}</span>
        </div>
        {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
        {description && <p className="text-white/80 text-sm">{description}</p>}
      </div>

      {/* Error Display */}
      {playbackError && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6 flex-shrink-0">
          <div className="flex items-center mb-2">
            <AlertCircle className="mr-2" size={20} />
            <span className="font-semibold">Playback Error</span>
          </div>
          <p className="text-sm text-red-100 mb-3">{playbackError}</p>
          <button
            onClick={retryLoad}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            aria-label="Retry loading audio"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6 flex-shrink-0">
        <div 
          className="w-full h-3 bg-white/20 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.floor(progressPercentage)}
          aria-label="Audio progress"
          tabIndex={0}
        >
          <div 
            className="h-full bg-white rounded-full transition-all duration-100 shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/70 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{audioDuration > 0 ? formatTime(audioDuration) : duration}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-6 mb-6 flex-shrink-0">
        <button
          className="text-white/70 hover:text-white transition-colors duration-200"
          disabled
          aria-label="Previous track (not available)"
        >
          <SkipBack size={24} />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading || !!playbackError}
          className="w-16 h-16 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-white/90 transition-all duration-200 transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={28} />
          ) : (
            <Play size={28} className="ml-1" />
          )}
        </button>

        <button
          className="text-white/70 hover:text-white transition-colors duration-200"
          disabled
          aria-label="Next track (not available)"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <button 
          onClick={toggleMute} 
          className="text-white/70 hover:text-white transition-colors duration-200"
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-white"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={isMuted ? 0 : volume}
          aria-label="Volume control"
        />
        <span className="text-xs text-white/70 w-8 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="mt-4 text-xs text-white/50 text-center flex-shrink-0">
        <details className="cursor-pointer">
          <summary className="hover:text-white/70 transition-colors">Keyboard shortcuts</summary>
          <div className="mt-2 text-left bg-white/10 rounded-lg p-3">
            <div>Space: Play/Pause</div>
            <div>←/→: Seek ±10s</div>
            <div>↑/↓: Volume ±10%</div>
            <div>M: Mute/Unmute</div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AudioPlayerCard;