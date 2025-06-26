import { useState, useEffect, useCallback } from 'react';
import { AudioTrack, Playlist } from '../types/audio';
import {
  fetchAudioPlaylists,
  fetchPlaylistByLanguage,
  fetchContentByLanguage,
  fetchAllSpokenWordContent,
  searchSpokenWordContent,
  fetchContentStatistics
} from '../utils/supabaseAudioData';

interface UseSupabaseAudioState {
  playlists: Playlist[];
  allTracks: AudioTrack[];
  loading: boolean;
  error: string | null;
  statistics: {
    total: number;
    byLanguage: Record<string, number>;
    byTheme: Record<string, number>;
  } | null;
}

export const useSupabaseAudio = () => {
  const [state, setState] = useState<UseSupabaseAudioState>({
    playlists: [],
    allTracks: [],
    loading: true,
    error: null,
    statistics: null
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<UseSupabaseAudioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });

      const [playlists, allTracks, statistics] = await Promise.all([
        fetchAudioPlaylists(),
        fetchAllSpokenWordContent(),
        fetchContentStatistics()
      ]);

      updateState({
        playlists,
        allTracks,
        statistics,
        loading: false
      });
    } catch (error) {
      console.error('Error loading audio data:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load audio data',
        loading: false
      });
    }
  }, [updateState]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get playlist by language
  const getPlaylistByLanguage = useCallback(async (
    language: 'yoruba' | 'igbo' | 'hausa' | 'english'
  ): Promise<Playlist | null> => {
    try {
      return await fetchPlaylistByLanguage(language);
    } catch (error) {
      console.error(`Error fetching ${language} playlist:`, error);
      return null;
    }
  }, []);

  // Get tracks by language
  const getTracksByLanguage = useCallback(async (
    language: 'yoruba' | 'igbo' | 'hausa' | 'english'
  ): Promise<AudioTrack[]> => {
    try {
      return await fetchContentByLanguage(language);
    } catch (error) {
      console.error(`Error fetching ${language} tracks:`, error);
      return [];
    }
  }, []);

  // Search tracks
  const searchTracks = useCallback(async (
    query: string,
    language?: 'yoruba' | 'igbo' | 'hausa' | 'english'
  ): Promise<AudioTrack[]> => {
    try {
      return await searchSpokenWordContent(query, language);
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    getPlaylistByLanguage,
    getTracksByLanguage,
    searchTracks,
    refresh
  };
};

// Hook for specific language playlist
export const useLanguagePlaylist = (language: 'yoruba' | 'igbo' | 'hausa' | 'english') => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlaylist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPlaylistByLanguage(language);
      setPlaylist(data);
    } catch (err) {
      console.error(`Error loading ${language} playlist:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  return {
    playlist,
    loading,
    error,
    refresh: loadPlaylist
  };
};