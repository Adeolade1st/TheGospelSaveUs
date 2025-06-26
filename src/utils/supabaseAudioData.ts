import { supabase, SpokenWordContent } from '../lib/supabase';
import { AudioTrack, Playlist } from '../types/audio';

/**
 * Utility functions for fetching audio data from Supabase
 */

// Transform Supabase data to AudioTrack format
const transformToAudioTrack = (content: SpokenWordContent): AudioTrack => ({
  id: content.id,
  title: content.title,
  artist: content.artist,
  description: content.description || undefined,
  audioUrl: content.audio_url,
  duration: content.duration,
  language: content.language,
  scriptureRef: content.scripture_ref || undefined,
  theme: content.theme || undefined,
  thumbnail: content.thumbnail || undefined
});

// Fetch all active spoken word content
export const fetchAllSpokenWordContent = async (): Promise<AudioTrack[]> => {
  try {
    const { data, error } = await supabase
      .from('spoken_word_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching spoken word content:', error);
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    return data?.map(transformToAudioTrack) || [];
  } catch (error) {
    console.error('Error in fetchAllSpokenWordContent:', error);
    throw error;
  }
};

// Fetch content by language
export const fetchContentByLanguage = async (
  language: 'yoruba' | 'igbo' | 'hausa' | 'english'
): Promise<AudioTrack[]> => {
  try {
    const { data, error } = await supabase
      .from('spoken_word_content')
      .select('*')
      .eq('language', language)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${language} content:`, error);
      throw new Error(`Failed to fetch ${language} content: ${error.message}`);
    }

    return data?.map(transformToAudioTrack) || [];
  } catch (error) {
    console.error(`Error in fetchContentByLanguage for ${language}:`, error);
    throw error;
  }
};

// Fetch content by theme
export const fetchContentByTheme = async (theme: string): Promise<AudioTrack[]> => {
  try {
    const { data, error } = await supabase
      .from('spoken_word_content')
      .select('*')
      .eq('theme', theme)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching content by theme ${theme}:`, error);
      throw new Error(`Failed to fetch content by theme: ${error.message}`);
    }

    return data?.map(transformToAudioTrack) || [];
  } catch (error) {
    console.error(`Error in fetchContentByTheme for ${theme}:`, error);
    throw error;
  }
};

// Fetch a single track by ID
export const fetchTrackById = async (id: string): Promise<AudioTrack | null> => {
  try {
    const { data, error } = await supabase
      .from('spoken_word_content')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching track ${id}:`, error);
      throw new Error(`Failed to fetch track: ${error.message}`);
    }

    return data ? transformToAudioTrack(data) : null;
  } catch (error) {
    console.error(`Error in fetchTrackById for ${id}:`, error);
    throw error;
  }
};

// Generate playlists from database content
export const fetchAudioPlaylists = async (): Promise<Playlist[]> => {
  try {
    const allContent = await fetchAllSpokenWordContent();
    
    // Group content by language
    const contentByLanguage = allContent.reduce((acc, track) => {
      if (!acc[track.language]) {
        acc[track.language] = [];
      }
      acc[track.language].push(track);
      return acc;
    }, {} as Record<string, AudioTrack[]>);

    // Create playlists
    const playlists: Playlist[] = [];
    
    const languageInfo = {
      yoruba: { name: 'Yorùbá Messages', description: 'Transformative spoken word messages in Yoruba' },
      igbo: { name: 'Igbo Messages', description: 'Life-changing spoken word content in Igbo' },
      hausa: { name: 'Hausa Messages', description: 'Inspiring spoken word ministry in Hausa' },
      english: { name: 'English Messages', description: 'Powerful spoken word ministry in English' }
    };

    Object.entries(contentByLanguage).forEach(([language, tracks]) => {
      const lang = language as 'yoruba' | 'igbo' | 'hausa' | 'english';
      const info = languageInfo[lang];
      
      if (info && tracks.length > 0) {
        playlists.push({
          id: `${language}-playlist`,
          name: info.name,
          language: lang,
          description: info.description,
          tracks: tracks
        });
      }
    });

    return playlists;
  } catch (error) {
    console.error('Error in fetchAudioPlaylists:', error);
    throw error;
  }
};

// Get playlist by language
export const fetchPlaylistByLanguage = async (
  language: 'yoruba' | 'igbo' | 'hausa' | 'english'
): Promise<Playlist | null> => {
  try {
    const tracks = await fetchContentByLanguage(language);
    
    if (tracks.length === 0) {
      return null;
    }

    const languageInfo = {
      yoruba: { name: 'Yorùbá Messages', description: 'Transformative spoken word messages in Yoruba' },
      igbo: { name: 'Igbo Messages', description: 'Life-changing spoken word content in Igbo' },
      hausa: { name: 'Hausa Messages', description: 'Inspiring spoken word ministry in Hausa' },
      english: { name: 'English Messages', description: 'Powerful spoken word ministry in English' }
    };

    const info = languageInfo[language];

    return {
      id: `${language}-playlist`,
      name: info.name,
      language,
      description: info.description,
      tracks
    };
  } catch (error) {
    console.error(`Error in fetchPlaylistByLanguage for ${language}:`, error);
    throw error;
  }
};

// Search content
export const searchSpokenWordContent = async (
  query: string,
  language?: 'yoruba' | 'igbo' | 'hausa' | 'english'
): Promise<AudioTrack[]> => {
  try {
    let queryBuilder = supabase
      .from('spoken_word_content')
      .select('*')
      .eq('is_active', true);

    // Add language filter if specified
    if (language) {
      queryBuilder = queryBuilder.eq('language', language);
    }

    // Add text search
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,theme.ilike.%${query}%,scripture_ref.ilike.%${query}%`
    );

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching content:', error);
      throw new Error(`Search failed: ${error.message}`);
    }

    return data?.map(transformToAudioTrack) || [];
  } catch (error) {
    console.error('Error in searchSpokenWordContent:', error);
    throw error;
  }
};

// Get content statistics
export const fetchContentStatistics = async () => {
  try {
    const { data, error } = await supabase
      .from('spoken_word_content')
      .select('language, theme')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching statistics:', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      byLanguage: {} as Record<string, number>,
      byTheme: {} as Record<string, number>
    };

    data?.forEach(item => {
      // Count by language
      stats.byLanguage[item.language] = (stats.byLanguage[item.language] || 0) + 1;
      
      // Count by theme
      if (item.theme) {
        stats.byTheme[item.theme] = (stats.byTheme[item.theme] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error in fetchContentStatistics:', error);
    throw error;
  }
};

// Add new content (for authenticated users)
export const addSpokenWordContent = async (
  content: Omit<SpokenWordContent, 'id' | 'created_at' | 'updated_at'>
): Promise<AudioTrack> => {
  try {
    const { data, error } = await supabase
      .from('spoken_word_content')
      .insert({
        ...content,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding content:', error);
      throw new Error(`Failed to add content: ${error.message}`);
    }

    return transformToAudioTrack(data);
  } catch (error) {
    console.error('Error in addSpokenWordContent:', error);
    throw error;
  }
};

// Update content (for authenticated users)
export const updateSpokenWordContent = async (
  id: string,
  updates: Partial<Omit<SpokenWordContent, 'id' | 'created_at'>>
): Promise<AudioTrack> => {
  try {
    const { data, error } = await supabase
      .from('spoken_word_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      throw new Error(`Failed to update content: ${error.message}`);
    }

    return transformToAudioTrack(data);
  } catch (error) {
    console.error('Error in updateSpokenWordContent:', error);
    throw error;
  }
};

// Delete content (soft delete by setting is_active to false)
export const deleteSpokenWordContent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('spoken_word_content')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      throw new Error(`Failed to delete content: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteSpokenWordContent:', error);
    throw error;
  }
};