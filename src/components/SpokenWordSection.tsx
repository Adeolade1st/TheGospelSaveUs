import React from 'react';
import { Music, Globe, Headphones } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import PlaylistAudioPlayer from './PlaylistAudioPlayer';
import AudioDebugger from './AudioDebugger';

const SpokenWordSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const languageCards = [
    {
      name: 'Yoruba',
      nativeName: 'Yorùbá',
      description: 'Language of the Southwest',
      image: 'https://images.pexels.com/photos/8088495/pexels-photo-8088495.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=yoruba',
      gradient: 'from-red-600 via-red-700 to-red-800',
      language: 'yoruba' as const
    },
    {
      name: 'Igbo',
      nativeName: 'Igbo',
      description: 'Language of the Southeast',
      image: 'https://images.pexels.com/photos/8088501/pexels-photo-8088501.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=igbo',
      gradient: 'from-amber-600 via-amber-700 to-orange-700',
      language: 'igbo' as const
    },
    {
      name: 'Hausa',
      nativeName: 'Hausa',
      description: 'Northern Nigeria\'s lingua franca',
      image: 'https://images.pexels.com/photos/8088489/pexels-photo-8088489.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=hausa',
      gradient: 'from-green-600 via-green-700 to-emerald-700',
      language: 'hausa' as const
    }
  ];

  // Test URLs for debugging
  const testUrls = [
    'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/yoruba.mp3',
    'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Ibo%20version%20of%20The%20Gospel-1.mp3',
    'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa%20version%20of%20The%20Gospel.mp3',
    'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3'
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

        {/* Audio Diagnostics Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full mb-4">
              <Music size={20} />
              <span className="font-semibold">Audio Diagnostics</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Testing Audio File Accessibility
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're testing your audio files to identify any playback issues. This helps us troubleshoot and ensure optimal performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testUrls.map((url, index) => (
              <AudioDebugger 
                key={index}
                audioUrl={url}
                className="max-w-full"
              />
            ))}
          </div>
        </div>

        {/* Featured Audio Player */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full mb-4">
              <Headphones size={20} />
              <span className="font-semibold">Featured Audio Player</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Listen to Our Complete Audio Library
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access our full collection of spoken word messages in Yorùbá, Igbo, Hausa, and English. 
              Switch between languages, browse playlists, and enjoy seamless playback.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <PlaylistAudioPlayer 
              language="yoruba"
              autoPlay={false}
            />
          </div>
        </div>

        {/* Language Cards Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Browse by Language
            </h3>
            <p className="text-gray-600">
              Explore our content organized by native languages
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {languageCards.map((language, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-br ${language.gradient} language-card`}
              >
                {/* Background Image */}
                <div className="relative h-64">
                  <picture>
                    <source 
                      srcSet={language.image.replace('jpeg', 'webp')} 
                      type="image/webp"
                    />
                    <img
                      src={language.image}
                      alt={`${language.name} cultural imagery - African person in prayer/meditation`}
                      className="w-full h-full object-cover opacity-30"
                      loading="lazy"
                      width="1920"
                      height="1080"
                    />
                  </picture>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 self-start">
                    <span className="text-sm font-bold uppercase tracking-wider">{language.name}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{language.nativeName}</h3>
                  <p className="text-white/80 text-sm mb-6">{language.description}</p>
                  
                  <div className="flex space-x-3">
                    <a
                      href={language.jangoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                    >
                      <Music size={14} />
                      <span>Jango Radio</span>
                    </a>
                    
                    <button
                      onClick={() => {
                        const audioPlayer = document.querySelector('[data-language-selector]');
                        if (audioPlayer) {
                          audioPlayer.scrollIntoView({ behavior: 'smooth' });
                          // Trigger language change in the audio player
                          const languageButton = document.querySelector(`[data-language="${language.language}"]`) as HTMLButtonElement;
                          if (languageButton) {
                            setTimeout(() => languageButton.click(), 500);
                          }
                        }
                      }}
                      className="inline-flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105 text-sm"
                    >
                      <Headphones size={14} />
                      <span>Listen Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Amazon Support Section */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-white" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 8.16 3.17 12.758 3.17 2.916 0 6.6-.68 9.73-2.205.185-.09.279-.058.279.09 0 .148-.279.337-.558.427-3.644 1.524-7.515 2.205-11.386 2.205-4.25 0-8.73-1.08-11.17-3.665zm-.837-2.205c.09-.18.27-.18.54-.045 4.597 2.655 10.312 3.665 15.367 3.665 3.096 0 6.6-.68 9.73-2.205.18-.09.27-.045.27.09 0 .18-.18.315-.45.405-3.644 1.524-7.515 2.205-11.386 2.205-5.055 0-10.77-1.08-13.97-4.115zm1.17-2.25c.18-.225.45-.18.81-.045 4.327 2.52 9.73 3.53 14.785 3.53 2.916 0 6.33-.68 9.19-2.07.18-.09.36-.045.36.135 0 .18-.18.315-.45.405-3.374 1.389-6.93 2.07-10.755 2.07-5.055 0-10.77-1.08-13.94-4.025z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">
              Buy Downloadable MP3 on Amazon
            </h3>
            <p className="text-orange-100 text-center mb-6 leading-relaxed">
              Support our ministry by purchasing high-quality audio downloads
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
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4">
              Listen on Jango Radio
            </h3>
            <p className="text-purple-100 text-center mb-6 leading-relaxed">
              Stream Pure Gold Gospel Singers on Jango's radio platform
            </p>
            <div className="text-center">
              <a
                href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Music className="w-5 h-5 mr-2" />
                Play on Jango
              </a>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <Globe className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Experience God's Word in Your Language
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Join thousands who have found hope, healing, and purpose through our multilingual spoken word ministry. 
              Each message is carefully crafted to speak directly to your heart in the language you understand best.
            </p>
            <button
              onClick={() => {
                const audioPlayer = document.querySelector('[data-language-selector]');
                if (audioPlayer) {
                  audioPlayer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Listening Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpokenWordSection;