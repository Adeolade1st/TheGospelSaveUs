import React, { useEffect } from 'react';
import { Music, Globe, ShoppingCart, ExternalLink, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import AudioPlaceholder from './AudioPlaceholder';
import { initializeAudioCache, preloadAudio } from '../utils/audioCache';

const SpokenWordSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const audioSamples = [
    {
      language: 'Yoruba',
      nativeName: 'Yorùbá',
      description: 'Language of the Southwest',
      duration: '3:45',
      gradient: 'from-blue-600 to-indigo-700',
      sampleTitle: 'Ihin rere',
      audioUrl: 'yoruba-gospel.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=yoruba',
      artist: 'Evangelist Janet Olaitan',
      contentId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
    },
    {
      language: 'Igbo',
      nativeName: 'Igbo',
      description: 'Language of the Southeast',
      duration: '4:12',
      gradient: 'from-amber-600 to-orange-700',
      sampleTitle: 'Ozi oma',
      audioUrl: 'igbo-gospel.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=igbo',
      artist: 'Minister Susan Collins',
      contentId: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0'
    },
    {
      language: 'Hausa',
      nativeName: 'Hausa',
      description: 'Northern Nigeria\'s lingua franca',
      duration: '3:58',
      gradient: 'from-green-600 to-emerald-700',
      sampleTitle: 'Labari korai',
      audioUrl: 'hausa-gospel.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=hausa',
      artist: 'Dcn Isaac O. Samuel',
      contentId: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01'
    },
    {
      language: 'English',
      nativeName: 'English',
      description: 'International language',
      duration: '4:33',
      gradient: 'from-red-600 to-red-800',
      sampleTitle: 'Transformed by Grace',
      audioUrl: 'english-gospel.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers',
      artist: 'Evangelist Jones',
      contentId: 'd4e5f6a7-b8c9-0123-4567-890abcdef012'
    }
  ];

  useEffect(() => {
    // Initialize audio caching system
    initializeAudioCache({
      quality: 'high',
      enableCaching: true,
      preloadStrategy: 'metadata',
      maxCacheSize: 50 // 50MB cache limit
    });

    // Preload audio files for better performance
    const audioList = audioSamples.map(sample => ({
      url: sample.audioUrl,
      metadata: {
        title: sample.sampleTitle,
        artist: sample.artist,
        duration: sample.duration
      }
    }));

    preloadAudio(audioList);
  }, []);

  return (
    <section id="content" className="py-15 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            The Gospel in Spoken Word
          </h2>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience transformative spoken word content in your native language
          </p>
        </div>

        {/* Audio Samples Section - Enhanced Layout */}
        <div className="mb-16">
          <div className="text-center mb-12" id="browse-by-language">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Browse by Language
            </h3>
            <p className="text-gray-600 text-lg">
              Listen to audio samples in Nigerian languages and English
            </p>
          </div>
          
          {/* Enhanced Audio Grid with Consistent Alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {audioSamples.map((sample, index) => (
              <div 
                key={index} 
                className="w-full max-w-sm flex justify-center"
              >
                <AudioPlaceholder
                  language={sample.language}
                  nativeName={sample.nativeName}
                  duration={sample.duration}
                  description={sample.description}
                  gradient={sample.gradient}
                  sampleTitle={sample.sampleTitle}
                  audioUrl={sample.audioUrl}
                  artist={sample.artist}
                  contentId={sample.contentId}
                  className="w-full h-full flex flex-col"
                />
              </div>
            ))}
          </div>

          {/* Audio Information - Enhanced Styling */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Music className="text-white" size={24} />
              </div>
            </div>
            
            <h4 className="font-bold text-blue-900 mb-6 text-center text-xl">Audio File Information</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-blue-800">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Format:</strong> High-quality MP3 (128kbps+)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Quality:</strong> Professional studio recording</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Source:</strong> Secure cloud storage with caching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Languages:</strong> Yoruba, Igbo, Hausa, English</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="font-semibold text-blue-900 mb-3">Featured Artists:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>English:</strong> Evangelist Jones</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Igbo:</strong> Minister Susan Collins</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Yoruba:</strong> Deaconess Janet Olaitan</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Hausa:</strong> Dcn Isaac O. Samuel</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <span><strong>Ministry:</strong> Pure Gold Gospel Singers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Album Purchase Section */}
      </div>
    </section>
  );
};

export default SpokenWordSection;