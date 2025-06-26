import { Playlist, AudioTrack } from '../types/audio';

export const audioPlaylists: Playlist[] = [
  {
    id: 'yoruba-playlist',
    name: 'Yorùbá Messages',
    language: 'yoruba',
    description: 'Transformative spoken word messages in Yoruba',
    tracks: [
      {
        id: 'yoruba-1',
        title: 'The Gospel Saves Us',
        artist: 'Evangelist Birdie Jones',
        description: 'A powerful message about salvation and God\'s transforming grace',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/yoruba.mp3',
        duration: '15:32',
        language: 'yoruba',
        scriptureRef: 'Romans 1:16',
        theme: 'salvation',
        thumbnail: 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      }
    ]
  },
  {
    id: 'igbo-playlist',
    name: 'Igbo Messages',
    language: 'igbo',
    description: 'Life-changing spoken word content in Igbo',
    tracks: [
      {
        id: 'igbo-1',
        title: 'Victory Over Fear',
        artist: 'Evangelist Birdie Jones',
        description: 'Breaking free from the chains of fear and anxiety through faith',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Ibo%20version%20of%20The%20Gospel-1.mp3',
        duration: '16:20',
        language: 'igbo',
        scriptureRef: '2 Timothy 1:7',
        theme: 'victory',
        thumbnail: 'https://images.pexels.com/photos/8088501/pexels-photo-8088501.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      }
    ]
  },
  {
    id: 'hausa-playlist',
    name: 'Hausa Messages',
    language: 'hausa',
    description: 'Inspiring spoken word ministry in Hausa',
    tracks: [
      {
        id: 'hausa-1',
        title: 'Faith That Moves Mountains',
        artist: 'Evangelist Birdie Jones',
        description: 'Building unshakeable faith that overcomes every obstacle',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa%20version%20of%20The%20Gospel.mp3',
        duration: '17:45',
        language: 'hausa',
        scriptureRef: 'Matthew 17:20',
        theme: 'faith',
        thumbnail: 'https://images.pexels.com/photos/8088489/pexels-photo-8088489.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      }
    ]
  },
  {
    id: 'english-playlist',
    name: 'English Messages',
    language: 'english',
    description: 'Powerful spoken word ministry in English',
    tracks: [
      {
        id: 'english-1',
        title: 'Transformed by Grace',
        artist: 'Evangelist Birdie Jones',
        description: 'The life-changing power of God\'s grace in our daily lives',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3',
        duration: '21:30',
        language: 'english',
        scriptureRef: 'Ephesians 2:8-9',
        theme: 'grace',
        thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      }
    ]
  }
];

export const getPlaylistByLanguage = (language: 'yoruba' | 'igbo' | 'hausa' | 'english'): Playlist | undefined => {
  return audioPlaylists.find(playlist => playlist.language === language);
};

export const getAllTracks = (): AudioTrack[] => {
  return audioPlaylists.flatMap(playlist => playlist.tracks);
};

export const getTrackById = (id: string): AudioTrack | undefined => {
  return getAllTracks().find(track => track.id === id);
};