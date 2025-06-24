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
      audioUrl: 'https://drive.google.com/uc?export=download&id=1iYwJ7HAJPTiP8TojyEdSPeP7RpkBZOha',
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