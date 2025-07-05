import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Lock, ShoppingCart, AlertCircle, RefreshCw, Info, Loader2, Download } from 'lucide-react';
import { AudioValidator } from '../utils/audioValidation';
import SecureDownloadButton from './SecureDownloadButton';
import { StorageService } from '../utils/storageService';

interface MusicPlayerProps {
  title: string;
  artist: string;
  audioUrl: string; // This is now the storage path, not the direct URL
  duration: string;
  language: string;
  coverImage?: string;
  contentId?: string; // Added contentId prop
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  title,
  artist,
  audioUrl,
  duration,
  language,
  coverImage,
  contentId = '' // Default to empty string
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [publicUrl, setPublicUrl] = useState<string>('');

  useEffect(() => {
    // Get the public URL for streaming
    const getAudioUrl = async () => {
      console.log('MusicPlayer: Getting audio URL for:', audioUrl);
      // If it's already a full URL, use it directly
      if (audioUrl.startsWith('http')) {
        console.log('MusicPlayer: Using direct URL:', audioUrl);
        setPublicUrl(audioUrl);
        return;
      }
      
      // If it's a local path (starts with /), use it directly
      if (audioUrl.startsWith('/')) {
        console.log('MusicPlayer: Using local path:', audioUrl);
        setPublicUrl(audioUrl);
        return;
      }
      
      // Otherwise, get the public URL from Supabase Storage
      const url = StorageService.getPublicUrl(audioUrl);
      console.log('MusicPlayer: Generated Supabase URL:', url);
      setPublicUrl(url);
    };
    
    getAudioUrl();
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !publicUrl) return;

    const handleLoadStart = () => {
      console.log(`🎵 Music player loading: ${title}`);
      setIsLoading(true);
      setError(null);
      setIsReady(false);
    };

    const handleLoadedMetadata = () => {
      console.log(`📊 Music metadata loaded: ${title}`, {
        duration: audio.duration,
        readyState: audio.readyState
      });
      setTotalDuration(audio.duration);
    };

    const handleCanPlay = () => {
      console.log(`✅ Music ready to play: ${title}`);
      setIsLoading(false);
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      console.log(`🏁 Music playback ended: ${title}`);
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.error(`❌ Music player error for ${title}:`, {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState
      });
      
      setIsLoading(false);
      setIsPlaying(false);
      
      let errorMessage = 'Unable to load audio file';
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio file could not be decoded';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
          default:
            errorMessage = 'Unknown audio error occurred';
        }
      }
      setError(errorMessage);
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

    // Prevent direct downloads
    audio.controlsList.add('nodownload');

    // Set audio source if we have a public URL
    if (publicUrl) {
      audio.src = publicUrl;
      audio.load();
    }

    // Validate audio file
    if (publicUrl) {
      AudioValidator.validateAudioFile(publicUrl)
        .then(result => {
          setValidationResult(result);
          if (!result.isValid) {
            setError(result.errors[0] || 'Audio validation failed');
          }
        })
        .catch(err => {
          console.error('Audio validation failed:', err);
          setError('Failed to validate audio file');
        });
    }

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
  }, [publicUrl, title]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    // Mark user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      console.log(`👆 User interaction detected for music: ${title}`);
    }

    try {
      if (isPlaying) {
        console.log(`⏸️ Pausing music: ${title}`);
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log(`▶️ Playing music: ${title}`);
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error(`💥 Music playback error for ${title}:`, error);
      setError('Playback failed');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    console.log(`🔄 Retrying music load: ${title} (attempt ${retryCount + 1})`);
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);

    const audio = audioRef.current;
    if (audio) {
      audio.load();
      
      try {
        const result = await AudioValidator.validateAudioFile(publicUrl);
        setValidationResult(result);
        if (!result.isValid) {
          setError(result.errors[0] || 'Audio validation failed');
        }
      } catch (err) {
        setError('Failed to validate audio file');
      } finally {
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
    
    const newTime = clickRatio * totalDuration;
    
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

  const getTroubleshootingSteps = () => {
    if (!error) return [];
    
    return AudioValidator.getTroubleshootingSteps(error);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Header with Track Info */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
        <div className="flex items-center space-x-4">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={`${title} by ${artist}`}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
              <Play className="text-white ml-1" size={24} />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-white/80">{artist}</p>
            <div className="flex items-center space-x-2 mt-1 text-sm text-white/60">
              <span>{language}</span>
              <span>•</span>
              <span>{duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h5 className="font-semibold text-red-800 mb-2">Playback Error</h5>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                
                <div className="mb-3">
                  <p className="text-red-800 font-medium text-sm mb-2">Try these solutions:</p>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {getTroubleshootingSteps().map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleRetry}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Try Again</span>
                </button>
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
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer relative"
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
            {/* Progress bar */}
            <div 
              className="h-full bg-blue-600 transition-all duration-100 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePlayPause}
            disabled={isLoading || !!error}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
            <button
              onClick={toggleMute}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Full Audio Notice */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <Download className="text-green-600" size={16} />
            <p className="text-green-800 text-sm">
              Full audio available for streaming and download.
            </p>
          </div>
        </div>

        {/* Purchase Options */}
        <div className="space-y-3">
          {/* $1 Download Button with Stripe */}
          <SecureDownloadButton
            contentId={contentId || audioUrl} // Use contentId if available, fallback to audioUrl
            title={title}
            artist={artist}
            price={1}
            language={language}
            className="w-full"
          />

          {/* Download on Amazon Button */}
          <a
            href="https://amazon.com/music"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ShoppingCart size={16} />
            <span>Download on Amazon</span>
          </a>
        </div>

        {/* User interaction prompt */}
        {!hasUserInteracted && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="text-blue-600" size={16} />
              <p className="text-blue-800 text-sm">
                Click the play button to start audio playback
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;