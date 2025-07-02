import React, { useEffect } from 'react';
import { Music, Globe, ShoppingCart, ExternalLink } from 'lucide-react';
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
      sampleTitle: 'Eyin rere',
      audioUrl: '/Yoruba version of The Gospel.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=yoruba',
      artist: 'Janet Olaitan'
    },
    {
      language: 'Igbo',
      nativeName: 'Igbo',
      description: 'Language of the Southeast',
      duration: '4:12',
      gradient: 'from-amber-600 to-orange-700',
      sampleTitle: 'Ozi oma',
      audioUrl: '/Ibo version of The Gospel-1.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=igbo',
      artist: 'Minister Susan Collins'
    },
    {
      language: 'Hausa',
      nativeName: 'Hausa',
      description: 'Northern Nigeria\'s lingua franca',
      duration: '3:58',
      gradient: 'from-green-600 to-emerald-700',
      sampleTitle: 'Labari mai dadi',
      audioUrl: '/Hausa version of The Gospel.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=hausa',
      artist: 'Isaac O. Samuel'
    },
    {
      language: 'English',
      nativeName: 'English',
      description: 'International language',
      duration: '4:33',
      gradient: 'from-red-600 to-red-800',
      sampleTitle: 'Transformed by Grace',
      audioUrl: '/English.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers',
      artist: 'Evangelist Birdie Jones'
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
            The Spoken Word
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
                    <span><strong>English:</strong> Evangelist Birdie Jones</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Igbo:</strong> Minister Susan Collins</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Yoruba:</strong> Janet Olaitan</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Hausa:</strong> Isaac O. Samuel</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <span><strong>Ministry:</strong> Pure Gold Gospel Singers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action - Enhanced with Amazon Card */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Complete Audio Messages Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <Globe className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Complete Audio Messages Available
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg text-center">
                These are full-length audio messages optimized for streaming and download. 
                For our complete collection and continuous streaming, visit our Jango Radio page 
                where you can discover more transformative content.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Music size={20} />
                  <span>Explore Full Collection</span>
                </a>
                <a
                  href="/gallery"
                  className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Globe size={20} />
                  <span>Meet Our Artists</span>
                </a>
              </div>
            </div>

            {/* Amazon Purchase Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <ShoppingCart className="w-16 h-16 text-orange-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Purchase on Amazon
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg text-center">
                Own the complete collection of our transformative spoken word ministry. 
                Available for purchase and download on Amazon Music with high-quality audio 
                and instant access to all languages.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="https://music.amazon.com/search/Pure%20Gold%20Gospel%20Singers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <ShoppingCart size={20} />
                  <span>Shop on Amazon Music</span>
                </a>
                <a
                  href="https://www.amazon.com/s?k=Pure+Gold+Gospel+Singers&i=digital-music"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-3 border-2 border-orange-500 text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-200 transform hover:scale-105"
                >
                  <ExternalLink size={20} />
                  <span>Browse Digital Downloads</span>
                </a>
              </div>
              
              {/* Amazon Features */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-center">Amazon Benefits</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Instant digital download</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>High-quality MP3 format</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Cloud storage & offline access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Compatible with all devices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpokenWordSection;