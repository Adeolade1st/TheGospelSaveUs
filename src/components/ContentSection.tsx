import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import AudioPlayerCard from './AudioPlayerCard';

const ContentSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const audioContent = [
    {
      title: '',
      language: 'Yorùbá',
      description: '',
      audioUrl: 'https://drive.google.com/uc?export=download&id=16b1nRqvQFc5pdIFO8KNljI9agzVufa6N',
      duration: '15:32',
      gradientColors: 'bg-gradient-to-br from-red-600 via-red-700 to-red-800',
      textColor: 'text-white'
    },
    {
      title: '',
      language: 'Igbo',
      description: '',
      audioUrl: 'https://drive.google.com/uc?export=download&id=10j9KSXjS75LpXpnrM8yqYkeY3KGddg_f',
      duration: '18:45',
      gradientColors: 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700',
      textColor: 'text-white'
    },
    {
      title: '',
      language: 'Hausa',
      description: '',
      audioUrl: 'https://drive.google.com/uc?export=download&id=1UB_rUsfb4vVr4GnNNcN-4Wv5VNOSsNX6',
      duration: '12:20',
      gradientColors: 'bg-gradient-to-br from-green-600 via-green-700 to-emerald-700',
      textColor: 'text-white'
    }
  ];

  return (
    <section id="content" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Spoken Word
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience transformative spoken word content in your native language
          </p>
        </div>

        {/* Amazon Support Section */}
        <div className="text-center mb-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border-2 border-amber-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Support Our Ministry
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Support by purchasing the audio on Amazon
            </p>
            <a
              href="https://amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-full hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg 
                className="w-6 h-6 mr-3" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 8.16 3.17 12.758 3.17 2.916 0 6.6-.68 9.73-2.205.185-.09.279-.058.279.09 0 .148-.279.337-.558.427-3.644 1.524-7.515 2.205-11.386 2.205-4.25 0-8.73-1.08-11.17-3.665zm-.837-2.205c.09-.18.27-.18.54-.045 4.597 2.655 10.312 3.665 15.367 3.665 3.096 0 6.6-.68 9.73-2.205.18-.09.27-.045.27.09 0 .18-.18.315-.45.405-3.644 1.524-7.515 2.205-11.386 2.205-5.055 0-10.77-1.08-13.97-4.115zm1.17-2.25c.18-.225.45-.18.81-.045 4.327 2.52 9.73 3.53 14.785 3.53 2.916 0 6.33-.68 9.19-2.07.18-.09.36-.045.36.135 0 .18-.18.315-.45.405-3.374 1.389-6.93 2.07-10.755 2.07-5.055 0-10.77-1.08-13.94-4.025z"/>
              </svg>
              Shop on Amazon
            </a>
          </div>
        </div>

        {/* Audio Player Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {audioContent.map((content, index) => (
            <AudioPlayerCard
              key={index}
              title={content.title}
              language={content.language}
              description={content.description}
              audioUrl={content.audioUrl}
              duration={content.duration}
              gradientColors={content.gradientColors}
              textColor={content.textColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;