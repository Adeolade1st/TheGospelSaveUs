import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  duration: string;
  onNext?: () => void;
  onPrevious?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  duration,
  onNext,
  onPrevious
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Event handlers
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      setIsReady(false);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setIsReady(true);
      setTotalDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Failed to load audio. Please check your connection and try again.');
    };
    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlayThrough = () => setIsLoading(false);

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    
    // Cleanup function
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [audioUrl]);

  // Reset state when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    setIsReady(false);
  }, [audioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setError('Unable to play audio. Please try again.');
      setIsPlaying(false);
      setIsLoading(false);
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
        audioRef.current.volume = volume;
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
    if (!audio || !isReady) return;

    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const progressWidth = progressBar.offsetWidth;
    const clickRatio = clickX / progressWidth;
    const newTime = clickRatio * audio.duration;
    
    if (isFinite(newTime)) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSeek = (direction: 'forward' | 'backward') => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    const seekAmount = 10; // seconds
    const newTime = direction === 'forward' 
      ? Math.min(audio.currentTime + seekAmount, audio.duration)
      : Math.max(audio.currentTime - seekAmount, 0);
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        aria-label={`Audio player for ${title}`}
      />
      
      {/* Track Info */}
      <div className="text-center mb-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-gray-500">
          {totalDuration > 0 ? formatTime(totalDuration) : duration}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div 
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative"
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalDuration}
          aria-valuenow={currentTime}
          aria-label="Audio progress"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') handleSeek('backward');
            if (e.key === 'ArrowRight') handleSeek('forward');
          }}
        >
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
          {/* Progress handle */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-red-500 rounded-full shadow-md transition-all duration-100"
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{totalDuration > 0 ? formatTime(totalDuration) : duration}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        <button
          onClick={onPrevious}
          disabled={!onPrevious || isLoading}
          className="text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Previous track"
        >
          <SkipBack size={24} />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading || !!error || !isReady}
          className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-1" />
          )}
        </button>

        <button
          onClick={onNext}
          disabled={!onNext || isLoading}
          className="text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Next track"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleMute} 
          className="text-gray-600 hover:text-red-600 transition-colors duration-200"
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          disabled={isLoading || !!error}
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
          disabled={isLoading || !!error}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Volume control"
        />
        <span className="text-xs text-gray-500 w-8 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* Keyboard shortcuts info */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Space: Play/Pause • ←/→: Seek • ↑/↓: Volume</p>
      </div>
    </div>
  );
};

export default AudioPlayer;