import React, { useState, useEffect } from 'react';
import { Music, Database, RefreshCw, Filter, Search } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { storageService } from '../lib/supabaseStorage';
import { AudioTrack } from '../types/audio';

interface DatabaseAudioPlayerProps {
  className?: string;
}

interface SpokenWordContent {
  id: string;
  title: string;
  artist: string;
  description: string;
  audio_url: string;
  language: 'yoruba' | 'igbo' | 'hausa' | 'english';
  duration: string;
  scripture_ref: string;
  theme: string;
  thumbnail: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const DatabaseAudioPlayer: React.FC<DatabaseAudioPlayerProps> = ({
  className = ''
}) => {
  const [content, setContent] = useState<SpokenWordContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<SpokenWordContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, selectedLanguage, searchTerm]);

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await storageService.getSpokenWordContent();
      setContent(data);
    } catch (error) {
      setError('Failed to load content from database');
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(item => item.language === selectedLanguage);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.artist.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.theme?.toLowerCase().includes(term) ||
        item.scripture_ref?.toLowerCase().includes(term)
      );
    }

    setFilteredContent(filtered);
    setCurrentTrackIndex(0); // Reset to first track when filtering
  };

  const convertToAudioTracks = (content: SpokenWordContent[]): AudioTrack[] => {
    return content.map(item => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      description: item.description,
      audioUrl: item.audio_url,
      duration: item.duration,
      language: item.language,
      scriptureRef: item.scripture_ref,
      theme: item.theme,
      thumbnail: item.thumbnail
    }));
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

  const getLanguageCounts = () => {
    const counts = content.reduce((acc, item) => {
      acc[item.language] = (acc[item.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  };

  const languageCounts = getLanguageCounts();
  const audioTracks = convertToAudioTracks(filteredContent);

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Database className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Database Audio Library</h3>
              <p className="text-red-200 text-sm">
                {content.length} total tracks • {filteredContent.length} filtered
              </p>
            </div>
          </div>
          
          <button
            onClick={loadContent}
            disabled={isLoading}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={16} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, artist, theme, or scripture..."
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Language Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLanguage('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedLanguage === 'all'
                  ? 'bg-white text-red-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All ({content.length})
            </button>
            
            {['yoruba', 'igbo', 'hausa', 'english'].map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-white text-red-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {getLanguageDisplayName(lang)} ({languageCounts[lang] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={loadContent}
              className="text-red-600 hover:text-red-800 text-xs mt-1"
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-gray-400 mr-2" size={24} />
            <span className="text-gray-600">Loading content from database...</span>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <Music className="mx-auto mb-4 text-gray-300" size={48} />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedLanguage !== 'all' ? 'No matching content found' : 'No content available'}
            </h4>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedLanguage !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload some audio files to get started'
              }
            </p>
            {(searchTerm || selectedLanguage !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLanguage('all');
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Current Track Info */}
            {audioTracks.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Now Playing: {audioTracks[currentTrackIndex]?.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Track {currentTrackIndex + 1} of {audioTracks.length} • 
                      {audioTracks[currentTrackIndex]?.artist} • 
                      {getLanguageDisplayName(audioTracks[currentTrackIndex]?.language)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {audioTracks[currentTrackIndex]?.theme && (
                        <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                          {audioTracks[currentTrackIndex].theme}
                        </span>
                      )}
                    </p>
                    {audioTracks[currentTrackIndex]?.scriptureRef && (
                      <p className="text-xs text-gray-500 mt-1">
                        {audioTracks[currentTrackIndex].scriptureRef}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Audio Player */}
            <AudioPlayer
              playlist={audioTracks}
              currentTrackIndex={currentTrackIndex}
              onTrackChange={setCurrentTrackIndex}
              showPlaylist={true}
              autoPlay={false}
              language={audioTracks[currentTrackIndex]?.language}
            />

            {/* Content Statistics */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{content.length}</div>
                <div className="text-sm text-gray-600">Total Tracks</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{Object.keys(languageCounts).length}</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(content.map(c => c.theme).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-600">Themes</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(content.map(c => c.artist)).size}
                </div>
                <div className="text-sm text-gray-600">Artists</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DatabaseAudioPlayer;