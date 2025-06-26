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
        audioUrl: '/yoruba.mp3',
        duration: '15:32',
        language: 'yoruba',
        scriptureRef: 'Romans 1:16',
        theme: 'salvation',
        thumbnail: 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      },
      {
        id: 'yoruba-2',
        title: 'Walking in Divine Purpose',
        artist: 'Evangelist Birdie Jones',
        description: 'Discover God\'s unique plan for your life and step into your destiny',
        audioUrl: '/audio/yoruba-purpose.mp3',
        duration: '18:45',
        language: 'yoruba',
        scriptureRef: 'Jeremiah 29:11',
        theme: 'purpose',
        thumbnail: 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      },
      {
        id: 'yoruba-3',
        title: 'Healing for the Broken Heart',
        artist: 'Evangelist Birdie Jones',
        description: 'God\'s comfort and restoration for those experiencing pain and loss',
        audioUrl: '/audio/yoruba-healing.mp3',
        duration: '22:15',
        language: 'yoruba',
        scriptureRef: 'Psalm 34:18',
        theme: 'healing',
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
        audioUrl: '/audio/igbo-victory.mp3',
        duration: '16:20',
        language: 'igbo',
        scriptureRef: '2 Timothy 1:7',
        theme: 'victory',
        thumbnail: 'https://images.pexels.com/photos/8088501/pexels-photo-8088501.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      },
      {
        id: 'igbo-2',
        title: 'God\'s Unfailing Love',
        artist: 'Evangelist Birdie Jones',
        description: 'Understanding the depth and breadth of God\'s love for us',
        audioUrl: '/audio/igbo-love.mp3',
        duration: '19:30',
        language: 'igbo',
        scriptureRef: 'Romans 8:38-39',
        theme: 'love',
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
        audioUrl: '/audio/hausa-faith.mp3',
        duration: '17:45',
        language: 'hausa',
        scriptureRef: 'Matthew 17:20',
        theme: 'faith',
        thumbnail: 'https://images.pexels.com/photos/8088489/pexels-photo-8088489.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      },
      {
        id: 'hausa-2',
        title: 'Hope in Dark Times',
        artist: 'Evangelist Birdie Jones',
        description: 'Finding light and hope when facing life\'s greatest challenges',
        audioUrl: '/audio/hausa-hope.mp3',
        duration: '20:10',
        language: 'hausa',
        scriptureRef: 'Romans 15:13',
        theme: 'hope',
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
        audioUrl: '/audio/english-grace.mp3',
        duration: '21:30',
        language: 'english',
        scriptureRef: 'Ephesians 2:8-9',
        theme: 'grace',
        thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
      },
      {
        id: 'english-2',
        title: 'Living with Purpose',
        artist: 'Evangelist Birdie Jones',
        description: 'Discovering and fulfilling God\'s calling on your life',
        audioUrl: '/audio/english-purpose.mp3',
        duration: '18:15',
        language: 'english',
        scriptureRef: 'Ephesians 2:10',
        theme: 'purpose',
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