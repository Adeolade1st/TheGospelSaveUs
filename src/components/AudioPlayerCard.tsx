import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, AlertCircle, Info } from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`Audio Debug: ${message}`);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    addDebugInfo(`Initializing audio with URL: ${audioUrl}`);

    // Event handlers with detailed logging
    const handleLoadStart = () => {
      addDebugInfo('Load start - Beginning to load audio');
      setIsLoading(true);
      setError(null);
      setIsReady(false);
    };

    const handleLoadedMetadata = () => {
      addDebugInfo(`Metadata loaded - Duration: ${audio.duration}s`);
      setTotalDuration(audio.duration);
    };

    const handleCanPlay = () => {
      addDebugInfo('Can play - Audio is ready to play');
      setIsLoading(false);
      setIsReady(true);
      setTotalDuration(audio.duration);
    };

    const handleCanPlayThrough = () => {
      addDebugInfo('Can play through - Audio can play without buffering');
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      addDebugInfo('Audio playback ended');
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement;
      let errorMessage = 'Unknown audio error';
      
      if (audioElement.error) {
        switch (audioElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error - file may be corrupted';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported or file not found';
            break;
          default:
            errorMessage = `Audio error code: ${audioElement.error.code}`;
        }
      }
      
      addDebugInfo(`ERROR: ${errorMessage}`);
      setIsLoading(false);
      setIsPlaying(false);
      setError(errorMessage);
    };

    const handleWaiting = () => {
      addDebugInfo('Waiting - Audio is buffering');
      setIsLoading(true);
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          addDebugInfo(`Buffered: ${bufferedPercent.toFixed(1)}%`);
        }
      }
    };

    const handleSuspend = () => {
      addDebugInfo('Suspend - Audio loading suspended');
    };

    const handleStalled = () => {
      addDebugInfo('Stalled - Audio loading stalled');
    };

    // Add all event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('stalled', handleStalled);

    // Test if the audio source is accessible
    fetch(audioUrl, { method: 'HEAD' })
      .then(response => {
        addDebugInfo(`File check - Status: ${response.status}, Type: ${response.headers.get('content-type')}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      })
      .catch(err => {
        addDebugInfo(`File check failed: ${err.message}`);
      });
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('stalled', handleStalled);
    };
  }, [audioUrl]);

  // Reset state when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    setIsReady(false);
    setDebugInfo([]);
  }, [audioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      addDebugInfo('ERROR: Audio element not found');
      return;
    }

    try {
      if (isPlaying) {
        addDebugInfo('Pausing audio');
        audio.pause();
        setIsPlaying(false);
      } else {
        addDebugInfo('Attempting to play audio');
        setIsLoading(true);
        
        // Check if audio is ready
        if (audio.readyState < 2) {
          addDebugInfo('Audio not ready, waiting for canplay event');
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 10000);

            const onCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve(void 0);
            };

            const onError = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('Audio load failed'));
            };

            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
          });
        }

        await audio.play();
        addDebugInfo('Audio playing successfully');
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown playback error';
      addDebugInfo(`Playback error: ${errorMessage}`);
      setError(`Unable to play audio: ${errorMessage}`);
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
    addDebugInfo(`Volume changed to: ${Math.round(newVolume * 100)}%`);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
        addDebugInfo('Audio unmuted');
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
        addDebugInfo('Audio muted');
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
      addDebugInfo(`Seeked to: ${formatTime(newTime)}`);
    }
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`${gradientColors} rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300`}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        aria-label={`Audio player for ${title} in ${language}`}
      />
      
      {/* Debug Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/30 transition-colors flex items-center space-x-1"
        >
          <Info size={12} />
          <span>Debug</span>
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-6 p-4 bg-black/30 backdrop-blur-sm rounded-lg max-h-40 overflow-y-auto">
          <h4 className="text-sm font-bold mb-2">Debug Information:</h4>
          <div className="text-xs space-y-1">
            <div>Audio URL: {audioUrl}</div>
            <div>Ready State: {audioRef.current?.readyState || 'N/A'}</div>
            <div>Network State: {audioRef.current?.networkState || 'N/A'}</div>
            <div>Current Time: {formatTime(currentTime)}</div>
            <div>Duration: {formatTime(totalDuration)}</div>
            <div>Is Ready: {isReady ? 'Yes' : 'No'}</div>
            <div>Is Loading: {isLoading ? 'Yes' : 'No'}</div>
          </div>
          <div className="mt-3 border-t border-white/20 pt-2">
            <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
              {debugInfo.slice(-5).map((info, index) => (
                <div key={index} className="text-white/80">{info}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <span className="text-sm font-bold uppercase tracking-wider">{language}</span>
        </div>
        <h3 className="text-2xl font-bold mb-2" title={title}>{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-300/30 rounded-lg flex items-center space-x-2">
          <AlertCircle className="text-white flex-shrink-0" size={16} />
          <p className="text-white text-sm">{error}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div 
          className="w-full h-3 bg-white/20 rounded-full cursor-pointer overflow-hidden relative"
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalDuration}
          aria-valuenow={currentTime}
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
          <span>{totalDuration > 0 ? formatTime(totalDuration) : duration}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <button
          className="text-white/70 hover:text-white transition-colors duration-200 disabled:opacity-50"
          disabled
          aria-label="Previous track"
        >
          <SkipBack size={24} />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading && !error}
          className="w-16 h-16 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-white/90 transition-all duration-200 transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={28} />
          ) : isPlaying ? (
            <Pause size={28} />
          ) : (
            <Play size={28} className="ml-1" />
          )}
        </button>

        <button
          className="text-white/70 hover:text-white transition-colors duration-200 disabled:opacity-50"
          disabled
          aria-label="Next track"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleMute} 
          className="text-white/70 hover:text-white transition-colors duration-200"
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
          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-white disabled:opacity-50"
          aria-label="Volume control"
        />
        <span className="text-xs text-white/70 w-8 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default AudioPlayerCard;