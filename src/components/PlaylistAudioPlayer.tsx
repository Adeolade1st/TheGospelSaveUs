import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import { audioPlaylists, getPlaylistByLanguage } from '../data/audioPlaylists';
import { AudioTrack } from '../types/audio';

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

  // Load user preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('audioPlayerLanguage') as 'yoruba' | 'igbo' | 'hausa' | 'english';
    if (savedLanguage && audioPlaylists.some(p => p.language === savedLanguage)) {
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

  const currentPlaylist = getPlaylistByLanguage(currentLanguage);
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

  return (
    <div className={className}>
      {/* Language selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Language</h3>
        <div className="flex flex-wrap gap-2">
          {audioPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleLanguageChange(playlist.language)}
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
          <p className="text-gray-500 mb-4">No tracks available for {getLanguageDisplayName(currentLanguage)}</p>
          <p className="text-sm text-gray-400">
            Upload your own audio files or check back later for new content.
          </p>
        </div>
      )}

      {/* Playlist statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {audioPlaylists.map((playlist) => (
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
    </div>
  );
};

export default PlaylistAudioPlayer;