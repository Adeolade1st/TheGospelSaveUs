import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle, Loader2, RefreshCw, Info } from 'lucide-react';

interface AudioPlaceholderProps {
  language: string;
  nativeName: string;
  duration: string;
  description: string;
  gradient: string;
  sampleTitle: string;
  audioUrl: string;
  artist: string;
  className?: string;
}

interface AudioError {
  code: number;
  message: string;
  userMessage: string;
  troubleshooting: string[];
}

const AudioPlaceholder: React.FC<AudioPlaceholderProps> = ({
  language,
  nativeName,
  duration,
  description,
  gradient,
  sampleTitle,
  audioUrl,
  artist,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AudioError | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fileValidation, setFileValidation] = useState<{
    exists: boolean;
    isMP3: boolean;
    size?: number;
    validated: boolean;
  }>({ exists: false, isMP3: false, validated: false });

  // Audio error codes and messages
  const getAudioError = (error: MediaError | Error | null, audioUrl: string): AudioError => {
    if (error instanceof MediaError) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          return {
            code: error.code,
            message: 'Audio loading was aborted',
            userMessage: 'Audio loading was interrupted',
            troubleshooting: [
              'Check your internet connection',
              'Try refreshing the page',
              'Ensure your browser supports MP3 playback'
            ]
          };
        case MediaError.MEDIA_ERR_NETWORK:
          return {
            code: error.code,
            message: 'Network error while loading audio',
            userMessage: 'Network connection problem',
            troubleshooting: [
              'Check your internet connection',
              'Try again in a few moments',
              'Contact support if the problem persists'
            ]
          };
        case MediaError.MEDIA_ERR_DECODE:
          return {
            code: error.code,
            message: 'Audio file could not be decoded',
            userMessage: 'Audio file format error',
            troubleshooting: [
              'The audio file may be corrupted',
              'Try downloading the file instead',
              'Contact support for assistance'
            ]
          };
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          return {
            code: error.code,
            message: 'Audio format not supported',
            userMessage: 'Audio format not supported by your browser',
            troubleshooting: [
              'Try using a different browser (Chrome, Firefox, Safari)',
              'Update your browser to the latest version',
              'Download the MP3 file to play locally'
            ]
          };
        default:
          return {
            code: error.code,
            message: 'Unknown media error',
            userMessage: 'Unknown audio playback error',
            troubleshooting: [
              'Try refreshing the page',
              'Check your browser settings',
              'Contact support if the issue continues'
            ]
          };
      }
    }

    // Handle other types of errors
    if (error?.message.includes('404') || error?.message.includes('Not Found')) {
      return {
        code: 404,
        message: 'Audio file not found',
        userMessage: 'Audio file not found',
        troubleshooting: [
          'The audio file may have been moved or deleted',
          'Try refreshing the page',
          'Contact support to report this issue'
        ]
      };
    }

    if (error?.message.includes('403') || error?.message.includes('Forbidden')) {
      return {
        code: 403,
        message: 'Access denied to audio file',
        userMessage: 'Access denied to audio file',
        troubleshooting: [
          'You may not have permission to access this file',
          'Try logging in again',
          'Contact support for assistance'
        ]
      };
    }

    return {
      code: 0,
      message: error?.message || 'Unknown error',
      userMessage: 'Unable to load audio file',
      troubleshooting: [
        'Check your internet connection',
        'Try refreshing the page',
        'Contact support if the problem persists'
      ]
    };
  };

  // Validate audio file
  const validateAudioFile = async (url: string) => {
    try {
      console.log(`🔍 Validating audio file: ${url}`);
      
      // Check if URL is valid MP3
      const isMP3 = url.toLowerCase().includes('.mp3') || url.includes('audio/mpeg');
      
      // Perform HEAD request to check if file exists
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      const exists = response.ok;
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log(`📊 File validation results:`, {
        exists,
        status: response.status,
        contentType,
        size: contentLength ? parseInt(contentLength) : undefined,
        isMP3: isMP3 || contentType?.includes('audio')
      });

      setFileValidation({
        exists,
        isMP3: isMP3 || contentType?.includes('audio') || false,
        size: contentLength ? parseInt(contentLength) : undefined,
        validated: true
      });

      if (!exists) {
        throw new Error(`File not found (${response.status})`);
      }

      if (!isMP3 && !contentType?.includes('audio')) {
        throw new Error('File is not a valid audio format');
      }

      return true;
    } catch (error) {
      console.error(`❌ File validation failed:`, error);
      setFileValidation({
        exists: false,
        isMP3: false,
        validated: true
      });
      throw error;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      console.log(`🎵 Audio loading started: ${sampleTitle}`);
      setIsLoading(true);
      setError(null);
      setIsReady(false);
    };

    const handleLoadedMetadata = () => {
      console.log(`📊 Audio metadata loaded: ${sampleTitle}`, {
        duration: audio.duration,
        readyState: audio.readyState
      });
      setTotalDuration(audio.duration);
    };

    const handleCanPlay = () => {
      console.log(`✅ Audio can play: ${sampleTitle}`);
      setIsLoading(false);
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      console.log(`🏁 Audio playback ended: ${sampleTitle}`);
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error(`❌ Audio error for ${sampleTitle}:`, {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
      
      setIsLoading(false);
      setIsPlaying(false);
      setIsReady(false);
      
      const audioError = getAudioError(audio.error, audioUrl);
      setError(audioError);
    };

    const handleWaiting = () => {
      console.log(`⏳ Audio buffering: ${sampleTitle}`);
      setIsLoading(true);
    };

    const handleCanPlayThrough = () => {
      console.log(`🚀 Audio ready for uninterrupted playback: ${sampleTitle}`);
      setIsLoading(false);
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          console.log(`📊 Audio buffered: ${bufferedPercent.toFixed(1)}%`);
        }
      }
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
    audio.addEventListener('progress', handleProgress);

    // Validate file on mount
    validateAudioFile(audioUrl).catch(error => {
      const audioError = getAudioError(error, audioUrl);
      setError(audioError);
    });

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('progress', handleProgress);
    };
  }, [audioUrl, sampleTitle]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      console.log(`👆 User interaction detected for: ${sampleTitle}`);
    }

    try {
      if (isPlaying) {
        console.log(`⏸️ Pausing audio: ${sampleTitle}`);
        audio.pause();
        setIsPlaying(false);
      } else {
        // Validate file before playing if not already validated
        if (!fileValidation.validated) {
          setIsLoading(true);
          await validateAudioFile(audioUrl);
        }

        if (!fileValidation.exists || !fileValidation.isMP3) {
          throw new Error('Audio file validation failed');
        }

        console.log(`▶️ Playing audio: ${sampleTitle}`);
        setIsLoading(true);
        setError(null);
        
        // Reset audio if it ended
        if (audio.ended) {
          audio.currentTime = 0;
        }

        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
        console.log(`✅ Audio playback started successfully: ${sampleTitle}`);
      }
    } catch (error: any) {
      console.error(`💥 Playback error for ${sampleTitle}:`, error);
      setIsLoading(false);
      setIsPlaying(false);
      
      const audioError = getAudioError(error, audioUrl);
      setError(audioError);
    }
  };

  const handleRetry = async () => {
    console.log(`🔄 Retrying audio load: ${sampleTitle} (attempt ${retryCount + 1})`);
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    setIsReady(false);
    setFileValidation({ exists: false, isMP3: false, validated: false });

    const audio = audioRef.current;
    if (audio) {
      // Force reload the audio
      audio.load();
      
      try {
        await validateAudioFile(audioUrl);
      } catch (error) {
        const audioError = getAudioError(error as Error, audioUrl);
        setError(audioError);
        setIsLoading(false);
      }
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

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 audio-placeholder ${className}`}>
      {/* Hidden audio element with enhanced attributes */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
        aria-label={`Audio player for ${sampleTitle} in ${nativeName} by ${artist}`}
        onError={(e) => console.error('Audio element error:', e)}
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
          <h4 className="font-semibold text-gray-900 mb-1">{sampleTitle}</h4>
          <p className="text-sm text-gray-600 mb-1">by {artist}</p>
          <p className="text-xs text-gray-500">Audio content in {nativeName}</p>
        </div>

        {/* File Validation Status */}
        {fileValidation.validated && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Info className="text-blue-600" size={16} />
              <div className="flex-1">
                <p className="text-blue-800 font-medium">File Status:</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-blue-700">
                  <span className={fileValidation.exists ? 'text-green-600' : 'text-red-600'}>
                    {fileValidation.exists ? '✓ File exists' : '✗ File not found'}
                  </span>
                  <span className={fileValidation.isMP3 ? 'text-green-600' : 'text-red-600'}>
                    {fileValidation.isMP3 ? '✓ Valid audio format' : '✗ Invalid format'}
                  </span>
                  {fileValidation.size && (
                    <span className="text-blue-600">
                      Size: {(fileValidation.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h5 className="font-semibold text-red-800 mb-2">Audio Playback Error</h5>
                <p className="text-red-700 text-sm mb-3">{error.userMessage}</p>
                
                <div className="mb-3">
                  <p className="text-red-800 font-medium text-sm mb-2">Troubleshooting Steps:</p>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {error.troubleshooting.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw size={12} />
                    <span>Try Again</span>
                  </button>
                  
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    <span>Dismiss</span>
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-red-200">
                  <details className="text-xs text-red-600">
                    <summary className="cursor-pointer hover:text-red-800">Technical Details</summary>
                    <div className="mt-2 space-y-1">
                      <p>Error Code: {error.code}</p>
                      <p>Browser: {getBrowserInfo()}</p>
                      <p>Retry Count: {retryCount}</p>
                      <p>Audio URL: {audioUrl}</p>
                    </div>
                  </details>
                </div>
              </div>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePlayPause();
              }
            }}
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
            disabled={isLoading || !!error || (!fileValidation.validated || !fileValidation.exists)}
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
        <div className="flex items-center space-x-3 mb-4">
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
            id={`volume-${language}`}
            name={`volume-${language}`}
          />
          
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Status indicators */}
        {isLoading && !error && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm">Loading audio...</span>
          </div>
        )}

        {!hasUserInteracted && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="text-yellow-600" size={16} />
              <p className="text-yellow-800 text-sm">
                Click play to start audio playback
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlaceholder;