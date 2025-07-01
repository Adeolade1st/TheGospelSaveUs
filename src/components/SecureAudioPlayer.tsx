import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Shield, 
  Clock,
  Music,
  Lock,
  CheckCircle,
  X
} from 'lucide-react';

interface SecureAudioPlayerProps {
  title: string;
  artist: string;
  audioUrl: string;
  duration: string;
  price: number;
  trackId: string;
  albumArt?: string;
  onPurchase?: (trackId: string) => void;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  title: string;
  artist: string;
  price: number;
  isProcessing: boolean;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  title,
  artist,
  price,
  isProcessing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Track</h3>
            <p className="text-gray-600">Get instant access to high-quality audio</p>
          </div>

          {/* Track Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-gray-600 text-sm">by {artist}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-2xl font-bold text-green-600">${price}</span>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Music size={14} />
                <span>High Quality MP3</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">Instant download after purchase</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">High-quality 320kbps MP3</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">Email backup download link</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm text-gray-700">DRM-free for personal use</span>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Shield size={12} />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Lock size={12} />
              <span>256-bit Encryption</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onPurchase}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Buy Now - ${price}</span>
                </>
              )}
            </button>
          </div>

          {/* Payment Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment processed by Stripe. No card details stored.
          </p>
        </div>
      </div>
    </div>
  );
};

const SecureAudioPlayer: React.FC<SecureAudioPlayerProps> = ({
  title,
  artist,
  audioUrl,
  duration,
  price,
  trackId,
  albumArt,
  onPurchase
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  // DRM Protection: Limit preview to 30 seconds
  const PREVIEW_LIMIT = 30; // seconds

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setTotalDuration(Math.min(audio.duration, PREVIEW_LIMIT));
    };

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      setCurrentTime(current);
      
      // DRM Protection: Stop at preview limit
      if (current >= PREVIEW_LIMIT && !isPurchased) {
        audio.pause();
        setIsPlaying(false);
        audio.currentTime = 0;
        setCurrentTime(0);
      }
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

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    // Prevent right-click context menu on audio element
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('contextmenu', handleContextMenu);

    // DRM Protection: Disable audio download
    audio.controlsList.add('nodownload');
    audio.crossOrigin = 'anonymous';

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isPurchased]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

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
    if (!audio) return;

    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const progressWidth = progressBar.offsetWidth;
    const clickRatio = clickX / progressWidth;
    const maxTime = isPurchased ? audio.duration : PREVIEW_LIMIT;
    const newTime = clickRatio * maxTime;
    
    if (isFinite(newTime) && newTime <= maxTime) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handlePurchase = async () => {
    setIsProcessingPurchase(true);
    
    try {
      // Simulate purchase process - integrate with your payment system
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsPurchased(true);
      setShowPurchaseModal(false);
      
      // Call parent purchase handler
      onPurchase?.(trackId);
      
      // Enable full track playback
      if (audioRef.current) {
        setTotalDuration(audioRef.current.duration);
      }
      
    } catch (error) {
      setError('Purchase failed. Please try again.');
    } finally {
      setIsProcessingPurchase(false);
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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Hidden audio element with DRM protection */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Player Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
        <div className="flex items-center space-x-4">
          {albumArt ? (
            <img 
              src={albumArt} 
              alt={`${title} album art`}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
              <Music className="text-gray-400" size={24} />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-gray-300">by {artist}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-400">
                {isPurchased ? 'Full Track' : 'Preview (30s)'}
              </span>
              {!isPurchased && (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Lock size={12} />
                  <span className="text-xs">Preview Mode</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">${price}</div>
            <div className="text-sm text-gray-400">High Quality</div>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <X className="text-red-500" size={16} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{isPurchased ? formatTime(totalDuration) : `${formatTime(PREVIEW_LIMIT)} preview`}</span>
          </div>
          <div 
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
            {!isPurchased && (
              <div 
                className="absolute top-0 h-full bg-red-500 opacity-30"
                style={{ 
                  left: `${(PREVIEW_LIMIT / (totalDuration || PREVIEW_LIMIT)) * 100}%`,
                  width: '2px'
                }}
              />
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayPause}
              disabled={isLoading || !!error}
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <Pause size={20} />
              ) : (
                <Play size={20} className="ml-0.5" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button onClick={toggleMute} className="text-gray-600 hover:text-gray-800">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isPurchased ? (
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Buy ${price}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={16} />
                <span className="font-semibold">Purchased</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview Warning */}
        {!isPurchased && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="text-yellow-600" size={16} />
              <span className="text-yellow-800 text-sm">
                Preview limited to 30 seconds. Purchase for full track access.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchase={handlePurchase}
        title={title}
        artist={artist}
        price={price}
        isProcessing={isProcessingPurchase}
      />
    </div>
  );
};

export default SecureAudioPlayer;