import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';

interface AudioPlaceholderProps {
  language: string;
  nativeName: string;
  duration: string;
  description: string;
  gradient: string;
  sampleTitle: string;
  audioUrl: string;
  className?: string;
}

const AudioPlaceholder: React.FC<AudioPlaceholderProps> = ({
  language,
  nativeName,
  duration,
  description,
  gradient,
  sampleTitle,
  audioUrl,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      setIsReady(false);
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to load audio file');
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [audioUrl]);

  const handlePlayPause = async () => {
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
      setError('Playback failed');
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

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 audio-placeholder ${className}`}>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
        aria-label={`Audio player for ${sampleTitle} in ${nativeName}`}
      />

      {/* Header with Language Info */}
      <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-sm font-bold uppercase tracking-wider">{language}</span>
          </div>
          <div className="flex items-center space-x-1 text-white/80">
            <Volume2 size={16} />
            <span className="text-sm">
              {totalDuration > 0 ? formatTime(totalDuration) : duration}
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1">{nativeName}</h3>
        <p className="text-white/90 text-sm">{description}</p>
      </div>

      {/* Audio Content */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">{sampleTitle}</h4>
          <p className="text-sm text-gray-600">Audio content in {nativeName}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (audioRef.current) {
                    audioRef.current.load();
                  }
                }}
                className="text-red-600 hover:text-red-800 text-xs mt-1"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{totalDuration > 0 ? formatTime(totalDuration) : duration}</span>
          </div>
          <div 
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalDuration}
            aria-valuenow={currentTime}
            aria-label="Audio progress"
            tabIndex={0}
          >
            <div 
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-100 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePlayPause}
            disabled={isLoading || !!error}
            className={`w-12 h-12 bg-gradient-to-r ${gradient} text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="ml-0.5" />
            )}
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Audio Sample
            </span>
            <a
              href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Full Collection →
            </a>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleMute}
            disabled={isLoading || !!error}
            className="text-gray-600 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={isLoading || !!error}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            aria-label="Volume control"
          />
          
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Loading indicator */}
        {isLoading && !error && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm">Loading audio...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlaceholder;