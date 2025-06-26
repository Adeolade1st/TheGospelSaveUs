import React, { useState, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Loader2, 
  AlertCircle,
  Upload,
  RefreshCw,
  Keyboard,
  List
} from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { AudioPlayerProps, AudioTrack } from '../types/audio';

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioFile,
  language = 'english',
  playlist = [],
  currentTrackIndex = 0,
  onTrackChange,
  onPlaylistComplete,
  autoPlay = false,
  showPlaylist = true,
  className = ''
}) => {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Get current track
  const currentTrack = playlist[currentTrackIndex];
  const effectiveAudioUrl = uploadedFile ? undefined : (audioUrl || currentTrack?.audioUrl);
  const effectiveAudioFile = uploadedFile || audioFile;

  // Audio player hook
  const { audioRef, state, controls } = useAudioPlayer({
    audioUrl: effectiveAudioUrl,
    audioFile: effectiveAudioFile,
    onTrackEnd: () => {
      if (playlist.length > 0 && currentTrackIndex < playlist.length - 1) {
        onTrackChange?.(currentTrackIndex + 1);
      } else {
        onPlaylistComplete?.();
      }
    },
    onError: (error) => {
      console.error('Audio player error:', error);
    },
    onReady: () => {
      if (autoPlay) {
        controls.play();
      }
    }
  });

  // Keyboard controls
  useKeyboardControls({
    onTogglePlay: controls.togglePlay,
    onSeekForward: () => controls.skipForward(10),
    onSeekBackward: () => controls.skipBackward(10),
    onVolumeUp: () => controls.setVolume(Math.min(1, state.volume + 0.1)),
    onVolumeDown: () => controls.setVolume(Math.max(0, state.volume - 0.1)),
    onToggleMute: controls.toggleMute
  });

  // Auto-play when track changes
  useEffect(() => {
    if (autoPlay && state.isReady) {
      controls.play();
    }
  }, [currentTrackIndex, state.isReady, autoPlay, controls]);

  // Format time helper
  const formatTime = useCallback((time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Progress bar click handler
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.isReady) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    const clickRatio = clickX / progressWidth;
    const newTime = clickRatio * state.duration;
    
    controls.seek(newTime);
  }, [state.isReady, state.duration, controls]);

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file');
      return;
    }

    setUploadedFile(file);
  }, []);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (playlist.length > 0 && currentTrackIndex > 0) {
      onTrackChange?.(currentTrackIndex - 1);
    }
  }, [playlist.length, currentTrackIndex, onTrackChange]);

  const handleNext = useCallback(() => {
    if (playlist.length > 0 && currentTrackIndex < playlist.length - 1) {
      onTrackChange?.(currentTrackIndex + 1);
    }
  }, [playlist.length, currentTrackIndex, onTrackChange]);

  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const bufferedPercentage = state.bufferedPercentage;

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        preload="metadata"
        aria-label={`Audio player${currentTrack ? ` for ${currentTrack.title}` : ''}`}
      />

      {/* Hidden file input */}
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
        id="audio-file-upload"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {currentTrack?.thumbnail && (
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-bold text-lg">
                {uploadedFile?.name || currentTrack?.title || 'Audio Player'}
              </h3>
              {currentTrack?.artist && (
                <p className="text-red-200 text-sm">{currentTrack.artist}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showPlaylist && playlist.length > 0 && (
              <button
                onClick={() => setShowPlaylistPanel(!showPlaylistPanel)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Toggle playlist"
              >
                <List size={20} />
              </button>
            )}
            
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              aria-label="Show keyboard shortcuts"
            >
              <Keyboard size={20} />
            </button>
            
            <label
              htmlFor="audio-file-upload"
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
              aria-label="Upload audio file"
            >
              <Upload size={20} />
            </label>
          </div>
        </div>

        {currentTrack?.description && (
          <p className="text-red-100 text-sm">{currentTrack.description}</p>
        )}

        {currentTrack?.scriptureRef && (
          <p className="text-red-200 text-xs mt-2 font-medium">
            Scripture: {currentTrack.scriptureRef}
          </p>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      {showKeyboardHelp && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div><kbd className="bg-blue-200 px-1 rounded">Space</kbd> Play/Pause</div>
            <div><kbd className="bg-blue-200 px-1 rounded">←/→</kbd> Seek ±10s</div>
            <div><kbd className="bg-blue-200 px-1 rounded">↑/↓</kbd> Volume ±10%</div>
            <div><kbd className="bg-blue-200 px-1 rounded">M</kbd> Mute/Unmute</div>
          </div>
        </div>
      )}

      {/* Playlist panel */}
      {showPlaylistPanel && playlist.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200 max-h-64 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Playlist</h4>
            <div className="space-y-2">
              {playlist.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => onTrackChange?.(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentTrackIndex
                      ? 'bg-red-100 border border-red-300'
                      : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {track.thumbnail && (
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        index === currentTrackIndex ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {track.title}
                      </p>
                      <p className={`text-sm truncate ${
                        index === currentTrackIndex ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {track.duration} • {track.theme}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {state.error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{state.error}</p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
                <label
                  htmlFor="audio-file-upload"
                  className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Upload size={12} />
                  <span>Upload File</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main player controls */}
      <div className="p-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div 
            className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={state.duration}
            aria-valuenow={state.currentTime}
            aria-label="Audio progress"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') controls.skipBackward(5);
              if (e.key === 'ArrowRight') controls.skipForward(5);
            }}
          >
            {/* Buffered progress */}
            <div 
              className="absolute top-0 left-0 h-full bg-gray-300 rounded-full transition-all duration-300"
              style={{ width: `${bufferedPercentage}%` }}
            />
            
            {/* Current progress */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Progress handle */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-red-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={handlePrevious}
            disabled={playlist.length === 0 || currentTrackIndex === 0}
            className="text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Previous track"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={controls.togglePlay}
            disabled={state.isLoading || !!state.error}
            className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={state.isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {state.isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : state.isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-1" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={playlist.length === 0 || currentTrackIndex === playlist.length - 1}
            className="text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Next track"
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={controls.toggleMute}
            className="text-gray-600 hover:text-red-600 transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label={state.isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {state.isMuted || state.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.isMuted ? 0 : state.volume}
            onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Volume control"
          />
          
          <span className="text-sm text-gray-500 w-10 text-right">
            {Math.round((state.isMuted ? 0 : state.volume) * 100)}%
          </span>
        </div>

        {/* Loading indicator */}
        {state.isLoading && !state.error && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm">Loading audio...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;