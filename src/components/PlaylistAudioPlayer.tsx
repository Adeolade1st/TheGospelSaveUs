import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { useSupabaseAudio } from '../hooks/useSupabaseAudio';
import { AudioTrack, Playlist } from '../types/audio';

interface PlaylistAudioPlayerProps {
  language?: 'yoruba' | 'igbo' | 'hausa' | 'english';
  autoPlay?: boolean;
  className?: string;
}

const PlaylistAudioPlayer: React.FC<PlaylistAudioPlayerProps> = ({
  language = 'yoruba',
  autoPlay = false,
  className = ''
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [userPreference, setUserPreference] = useState<string | null>(null);

  const { 
    playlists, 
    loading, 
    error, 
    statistics,
    getPlaylistByLanguage,
    refresh 
  } = useSupabaseAudio();

  // Load user preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('audioPlayerLanguage') as 'yoruba' | 'igbo' | 'hausa' | 'english';
    if (savedLanguage && ['yoruba', 'igbo', 'hausa', 'english'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      setUserPreference(savedLanguage);
    }
  }, []);

  // Save user preference
  useEffect(() => {
    if (userPreference) {
      localStorage.setItem('audioPlayerLanguage', userPreference);
    }
  }, [userPreference]);

  const currentPlaylist = playlists.find(p => p.language === currentLanguage);
  const tracks = currentPlaylist?.tracks || [];

  const handleLanguageChange = (newLanguage: 'yoruba' | 'igbo' | 'hausa' | 'english') => {
    setCurrentLanguage(newLanguage);
    setCurrentTrackIndex(0);
    setUserPreference(newLanguage);
  };

  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
  };

  const handlePlaylistComplete = () => {
    // Reset to first track when playlist completes
    setCurrentTrackIndex(0);
  };

  const getLanguageDisplayName = (lang: string) => {
    switch (lang) {
      case 'yoruba': return 'Yorùbá';
      case 'igbo': return 'Igbo';
      case 'hausa': return 'Hausa';
      case 'english': return 'English';
      default: return lang;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-8 text-center ${className}`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Loader2 className="animate-spin text-red-600" size={24} />
          <span className="text-gray-600">Loading audio content...</span>
        </div>
        <p className="text-sm text-gray-500">
          Fetching the latest spoken word messages from our database
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-8 text-center ${className}`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <AlertCircle className="text-red-500" size={24} />
          <span className="text-red-600 font-semibold">Failed to Load Content</span>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // No content state
  if (playlists.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl p-8 text-center ${className}`}>
        <p className="text-gray-500 mb-4">No audio content available at the moment</p>
        <p className="text-sm text-gray-400 mb-4">
          Please check back later or contact support if this issue persists.
        </p>
        <button
          onClick={refresh}
          className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>
    );
  }

  return (
    <div className={className} data-language-selector>
      {/* Language selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Language</h3>
        <div className="flex flex-wrap gap-2">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleLanguageChange(playlist.language)}
              data-language={playlist.language}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                currentLanguage === playlist.language
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getLanguageDisplayName(playlist.language)}
              <span className="ml-2 text-xs opacity-75">
                ({playlist.tracks.length} tracks)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current playlist info */}
      {currentPlaylist && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900">{currentPlaylist.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{currentPlaylist.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Track {currentTrackIndex + 1} of {tracks.length}
          </p>
        </div>
      )}

      {/* Audio player */}
      {tracks.length > 0 ? (
        <AudioPlayer
          playlist={tracks}
          currentTrackIndex={currentTrackIndex}
          onTrackChange={handleTrackChange}
          onPlaylistComplete={handlePlaylistComplete}
          autoPlay={autoPlay}
          showPlaylist={true}
          language={currentLanguage}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-500 mb-4">
            No tracks available for {getLanguageDisplayName(currentLanguage)}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Content may still be loading or there might be a temporary issue.
          </p>
          <button
            onClick={refresh}
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh Content</span>
          </button>
        </div>
      )}

      {/* Playlist statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={`p-4 rounded-lg text-center transition-all duration-200 ${
              currentLanguage === playlist.language
                ? 'bg-red-100 border-2 border-red-300'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <h5 className={`font-semibold ${
              currentLanguage === playlist.language ? 'text-red-900' : 'text-gray-900'
            }`}>
              {getLanguageDisplayName(playlist.language)}
            </h5>
            <p className={`text-sm ${
              currentLanguage === playlist.language ? 'text-red-700' : 'text-gray-600'
            }`}>
              {playlist.tracks.length} tracks
            </p>
          </div>
        ))}
      </div>

      {/* Database statistics */}
      {statistics && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Content Library Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-800">{statistics.total}</div>
              <div className="text-blue-600">Total Tracks</div>
            </div>
            {Object.entries(statistics.byLanguage).map(([lang, count]) => (
              <div key={lang} className="text-center">
                <div className="font-bold text-blue-800">{count}</div>
                <div className="text-blue-600">{getLanguageDisplayName(lang)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div className="mt-4 text-center">
        <button
          onClick={refresh}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
        >
          <RefreshCw size={14} />
          <span>Refresh Content</span>
        </button>
      </div>
    </div>
  );
};

export default PlaylistAudioPlayer;