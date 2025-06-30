import React from 'react';
import { Music, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import AudioPlaceholder from './AudioPlaceholder';

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
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Yoruba.mp3',
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
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Igbo.mp3',
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
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa.mp3',
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
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers',
      artist: 'Evangelist Birdie Jones'
    }
  ];

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
                  <span><strong>Format:</strong> High-quality MP3</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Quality:</strong> Professional studio recording</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span><strong>Source:</strong> Secure cloud storage</span>
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

          {/* Call to Action - Enhanced */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <Globe className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Complete Audio Messages Available
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                These are full-length audio messages. For our complete collection and continuous streaming, visit our Jango Radio page where you can discover more transformative content.
              </p>
              <a
                href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Music size={20} />
                <span>Explore Full Collection</span>
              </a>
            </div>
          </div>
        </div>

        {/* Platform Cards Section - Enhanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Amazon Support Section */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-white" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 8.16 3.17 12.758 3.17 2.916 0 6.6-.68 9.73-2.205.185-.09.279-.058.279.09 0 .148-.279.337-.558.427-3.644 1.524-7.515 2.205-11.386 2.205-4.25 0-8.73-1.08-11.17-3.665zm-.837-2.205c.09-.18.27-.18.54-.045 4.597 2.655 10.312 3.665 15.367 3.665 3.096 0 6.6-.68 9.73-2.205.18-.09.27-.045.27.09 0 .18-.18.315-.45.405-3.644 1.524-7.515 2.205-11.386 2.205-5.055 0-10.77-1.08-13.97-4.115zm1.17-2.25c.18-.225.45-.18.81-.045 4.327 2.52 9.73 3.53 14.785 3.53 2.916 0 6.33-.68 9.19-2.07.18-.09.36-.045.36.135 0 .18-.18.315-.45.405-3.374 1.389-6.93 2.07-10.755 2.07-5.055 0-10.77-1.08-13.94-4.025z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">
              Premium Downloads on Amazon
            </h3>
            <p className="text-orange-100 text-center mb-8 leading-relaxed text-lg">
              Support our ministry by purchasing high-quality, DRM-free audio downloads for offline listening
            </p>
            <div className="text-center">
              <a
                href="https://amazon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full hover:bg-orange-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Shop on Amazon
              </a>
            </div>
          </div>

          {/* Jango Music Player Section */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Music className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">
              Stream on Jango Radio
            </h3>
            <p className="text-purple-100 text-center mb-8 leading-relaxed text-lg">
              Experience continuous streaming of Pure Gold Gospel Singers on Jango's innovative radio platform
            </p>
            <div className="text-center">
              <a
                href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Music className="w-5 h-5 mr-3" />
                Listen on Jango
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpokenWordSection;