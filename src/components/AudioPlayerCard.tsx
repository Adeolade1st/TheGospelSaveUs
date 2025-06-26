import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2, AlertCircle, Info, RefreshCw, Upload, ExternalLink } from 'lucide-react';

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
  const [showDebug, setShowDebug] = useState(true); // Show debug by default
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-15), `[${timestamp}] ${message}`]);
    console.log(`Audio Debug: ${message}`);
  };

  // Enhanced file access check
  const checkFileAccess = async () => {
    try {
      addDebugInfo(`🔍 Checking file access for: ${audioUrl}`);
      
      // Method 1: HEAD request
      try {
        const headResponse = await fetch(audioUrl, { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (headResponse.ok) {
          const contentType = headResponse.headers.get('content-type');
          const contentLength = headResponse.headers.get('content-length');
          setFileType(contentType);
          setFileSize(contentLength ? parseInt(contentLength) : null);
          
          addDebugInfo(`✅ HEAD request successful - Type: ${contentType}, Size: ${contentLength} bytes`);
          
          if (contentLength === '0' || contentLength === null) {
            addDebugInfo(`⚠️ File appears to be empty (0 bytes)`);
            setFileExists(false);
            setError('Audio file is empty or corrupted. Please upload a valid audio file.');
            return false;
          }
          
          setFileExists(true);
          return true;
        } else {
          addDebugInfo(`❌ HEAD request failed - HTTP ${headResponse.status}: ${headResponse.statusText}`);
        }
      } catch (headError) {
        addDebugInfo(`❌ HEAD request error: ${headError instanceof Error ? headError.message : 'Unknown error'}`);
      }

      // Method 2: GET request with range
      try {
        addDebugInfo(`🔍 Trying GET request with range header...`);
        const rangeResponse = await fetch(audioUrl, {
          headers: { 'Range': 'bytes=0-1023' },
          cache: 'no-cache'
        });
        
        if (rangeResponse.ok || rangeResponse.status === 206) {
          const contentType = rangeResponse.headers.get('content-type');
          const contentRange = rangeResponse.headers.get('content-range');
          
          addDebugInfo(`✅ Range request successful - Type: ${contentType}, Range: ${contentRange}`);
          setFileExists(true);
          return true;
        } else {
          addDebugInfo(`❌ Range request failed - HTTP ${rangeResponse.status}`);
        }
      } catch (rangeError) {
        addDebugInfo(`❌ Range request error: ${rangeError instanceof Error ? rangeError.message : 'Unknown error'}`);
      }

      // Method 3: Simple GET request
      try {
        addDebugInfo(`🔍 Trying simple GET request...`);
        const getResponse = await fetch(audioUrl, { cache: 'no-cache' });
        
        if (getResponse.ok) {
          const blob = await getResponse.blob();
          setFileSize(blob.size);
          setFileType(blob.type);
          
          if (blob.size === 0) {
            addDebugInfo(`⚠️ File downloaded but is empty (0 bytes)`);
            setFileExists(false);
            setError('Audio file is empty. Please upload a valid audio file.');
            return false;
          }
          
          addDebugInfo(`✅ GET request successful - Size: ${blob.size} bytes, Type: ${blob.type}`);
          setFileExists(true);
          return true;
        } else {
          addDebugInfo(`❌ GET request failed - HTTP ${getResponse.status}`);
        }
      } catch (getError) {
        addDebugInfo(`❌ GET request error: ${getError instanceof Error ? getError.message : 'Unknown error'}`);
      }
      
      setFileExists(false);
      setError('Audio file not found or inaccessible. Please check the file path or upload a new file.');
      return false;
      
    } catch (error) {
      addDebugInfo(`❌ File check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFileExists(false);
      setError('Unable to access audio file. Please check your connection or upload a new file.');
      return false;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addDebugInfo(`📁 File selected: ${file.name} (${file.size} bytes, ${file.type})`);

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file (MP3, WAV, OGG, etc.)');
      return;
    }

    // Create object URL for the uploaded file
    const objectUrl = URL.createObjectURL(file);
    
    // Update audio source
    if (audioRef.current) {
      audioRef.current.src = objectUrl;
      audioRef.current.load();
    }

    setFileExists(true);
    setFileSize(file.size);
    setFileType(file.type);
    setError(null);
    setShowFileUpload(false);
    
    addDebugInfo(`✅ File uploaded successfully and set as audio source`);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    addDebugInfo(`🎵 Initializing audio with URL: ${audioUrl}`);

    // Check file accessibility first
    checkFileAccess();

    // Event handlers with detailed logging
    const handleLoadStart = () => {
      addDebugInfo('🔄 Load start - Beginning to load audio');
      setIsLoading(true);
      setError(null);
      setIsReady(false);
    };

    const handleLoadedMetadata = () => {
      addDebugInfo(`📊 Metadata loaded - Duration: ${audio.duration}s, Ready state: ${audio.readyState}`);
      setTotalDuration(audio.duration);
    };

    const handleCanPlay = () => {
      addDebugInfo('✅ Can play - Audio is ready to play');
      setIsLoading(false);
      setIsReady(true);
      setTotalDuration(audio.duration);
    };

    const handleCanPlayThrough = () => {
      addDebugInfo('🚀 Can play through - Audio can play without buffering');
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      addDebugInfo('🏁 Audio playback ended');
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
      
      addDebugInfo(`❌ ERROR: ${errorMessage}`);
      setIsLoading(false);
      setIsPlaying(false);
      setError(errorMessage);
    };

    const handleWaiting = () => {
      addDebugInfo('⏳ Waiting - Audio is buffering');
      setIsLoading(true);
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          addDebugInfo(`📶 Buffered: ${bufferedPercent.toFixed(1)}%`);
        }
      }
    };

    const handleSuspend = () => {
      addDebugInfo('⏸️ Suspend - Audio loading suspended (normal behavior)');
    };

    const handleStalled = () => {
      addDebugInfo('🚫 Stalled - Audio loading stalled (network issues)');
    };

    const handleAbort = () => {
      addDebugInfo('🛑 Abort - Audio loading aborted');
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
    audio.addEventListener('abort', handleAbort);
    
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
      audio.removeEventListener('abort', handleAbort);
    };
  }, [audioUrl]);

  // Reset state when audio URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    setIsReady(false);
    setDebugInfo([]);
    setFileExists(null);
    setFileSize(null);
    setFileType(null);
  }, [audioUrl]);

  const reloadAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      addDebugInfo('🔄 Manually reloading audio');
      setError(null);
      setIsReady(false);
      setIsLoading(true);
      audio.load();
      checkFileAccess();
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      addDebugInfo('❌ ERROR: Audio element not found');
      return;
    }

    try {
      if (isPlaying) {
        addDebugInfo('⏸️ Pausing audio');
        audio.pause();
        setIsPlaying(false);
      } else {
        addDebugInfo(`▶️ Attempting to play audio - Ready state: ${audio.readyState}`);
        setIsLoading(true);
        setError(null);
        
        // Force reload if audio isn't ready
        if (audio.readyState === 0) {
          addDebugInfo('🔄 Audio not loaded, forcing reload');
          audio.load();
        }
        
        // Wait for audio to be ready with timeout
        if (audio.readyState < 2) {
          addDebugInfo('⏳ Audio not ready, waiting for canplay event');
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              addDebugInfo('⏰ Audio load timeout reached');
              reject(new Error('Audio load timeout - file may be empty, corrupted, or inaccessible'));
            }, 8000); // Increased timeout

            const onCanPlay = () => {
              addDebugInfo('✅ Audio ready to play');
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve(void 0);
            };

            const onError = (e: Event) => {
              addDebugInfo('❌ Audio error during loading');
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('Audio load failed - file may be corrupted or in wrong format'));
            };

            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
          });
        }

        await audio.play();
        addDebugInfo('🎵 Audio playing successfully');
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown playback error';
      addDebugInfo(`❌ Playback error: ${errorMessage}`);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      addDebugInfo(`⏭️ Seeked to: ${formatTime(newTime)}`);
    }
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`${gradientColors} rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300`}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
        aria-label={`Audio player for ${title} in ${language}`}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Control Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={reloadAudio}
            className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/30 transition-colors flex items-center space-x-1"
            title="Reload audio file"
          >
            <RefreshCw size={12} />
            <span>Reload</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/30 transition-colors flex items-center space-x-1"
            title="Upload new audio file"
          >
            <Upload size={12} />
            <span>Upload</span>
          </button>
        </div>
        
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/30 transition-colors flex items-center space-x-1"
        >
          <Info size={12} />
          <span>{showDebug ? 'Hide' : 'Show'} Debug</span>
        </button>
      </div>

      {/* File Status Indicator */}
      <div className={`mb-4 p-3 rounded-lg text-sm ${
        fileExists === null 
          ? 'bg-blue-500/20 border border-blue-300/30' 
          : fileExists 
            ? 'bg-green-500/20 border border-green-300/30' 
            : 'bg-red-500/20 border border-red-300/30'
      }`}>
        <div className="flex items-center justify-between">
          <span>
            <strong>File Status:</strong> {
              fileExists === null ? '🔍 Checking...' : 
              fileExists ? '✅ Accessible' : '❌ Not Found/Empty'
            }
          </span>
          {fileExists === false && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-white/20 rounded px-2 py-1 hover:bg-white/30 transition-colors flex items-center space-x-1"
            >
              <Upload size={12} />
              <span>Upload File</span>
            </button>
          )}
        </div>
        {fileSize !== null && (
          <div className="mt-1 text-xs opacity-80">
            Size: {formatFileSize(fileSize)} | Type: {fileType || 'Unknown'}
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-6 p-4 bg-black/30 backdrop-blur-sm rounded-lg max-h-64 overflow-y-auto">
          <h4 className="text-sm font-bold mb-2 flex items-center space-x-2">
            <Info size={16} />
            <span>Debug Information</span>
          </h4>
          <div className="text-xs space-y-1 mb-3">
            <div><strong>Audio URL:</strong> {audioUrl}</div>
            <div><strong>File Exists:</strong> {fileExists === null ? 'Checking...' : fileExists ? 'Yes' : 'No'}</div>
            <div><strong>File Size:</strong> {fileSize ? formatFileSize(fileSize) : 'Unknown'}</div>
            <div><strong>File Type:</strong> {fileType || 'Unknown'}</div>
            <div><strong>Ready State:</strong> {audioRef.current?.readyState || 'N/A'} (0=NOTHING, 1=METADATA, 2=CURRENT_DATA, 3=FUTURE_DATA, 4=ENOUGH_DATA)</div>
            <div><strong>Network State:</strong> {audioRef.current?.networkState || 'N/A'} (0=EMPTY, 1=IDLE, 2=LOADING, 3=NO_SOURCE)</div>
            <div><strong>Current Time:</strong> {formatTime(currentTime)}</div>
            <div><strong>Duration:</strong> {formatTime(totalDuration)}</div>
            <div><strong>Is Ready:</strong> {isReady ? 'Yes' : 'No'}</div>
            <div><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
          </div>
          <div className="border-t border-white/20 pt-2">
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-white/80 font-mono">{info}</div>
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
        <div className="mb-4 p-3 bg-red-500/20 border border-red-300/30 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-white flex-shrink-0 mt-0.5" size={16} />
          <div className="flex-1">
            <p className="text-white text-sm">{error}</p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={reloadAudio}
                className="text-xs bg-white/20 rounded px-2 py-1 hover:bg-white/30 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-white/20 rounded px-2 py-1 hover:bg-white/30 transition-colors flex items-center space-x-1"
              >
                <Upload size={12} />
                <span>Upload New File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Audio Sources */}
      {!isReady && !isLoading && (
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-300/30 rounded-lg">
          <h4 className="text-sm font-bold mb-2">Alternative Options:</h4>
          <div className="space-y-2">
            <a
              href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs bg-white/20 rounded px-3 py-2 hover:bg-white/30 transition-colors"
            >
              <ExternalLink size={12} />
              <span>Listen on Jango Radio</span>
            </a>
          </div>
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