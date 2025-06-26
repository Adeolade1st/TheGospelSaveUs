export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  audioUrl?: string;
  audioFile?: File;
  duration?: string;
  language: 'yoruba' | 'igbo' | 'hausa' | 'english';
  scriptureRef?: string;
  theme?: string;
  thumbnail?: string;
}

export interface Playlist {
  id: string;
  name: string;
  language: 'yoruba' | 'igbo' | 'hausa' | 'english';
  tracks: AudioTrack[];
  description?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  bufferedPercentage: number;
}

export interface AudioPlayerProps {
  audioUrl?: string;
  audioFile?: File;
  language?: 'yoruba' | 'igbo' | 'hausa' | 'english';
  playlist?: AudioTrack[];
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  onPlaylistComplete?: () => void;
  autoPlay?: boolean;
  showPlaylist?: boolean;
  className?: string;
}