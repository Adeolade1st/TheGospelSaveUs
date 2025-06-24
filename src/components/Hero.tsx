import React from 'react';
import { Play, Heart, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

const Hero: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-amber-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.4%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
            <Heart className="text-amber-400" size={16} />
            <span className="text-white font-medium">Transforming Hearts Across Nigeria</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t.heroTitle}
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl md:text-3xl text-red-100 mb-6 font-medium">
            {t.heroSubtitle}
          </h2>

          {/* Description */}
          <p className="text-xl text-red-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t.heroDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button className="group flex items-center space-x-3 bg-white text-red-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <Play className="group-hover:scale-110 transition-transform duration-300" size={24} />
              <span>{t.listenNow}</span>
            </button>
            
            <a
              href="#about"
              className="flex items-center space-x-3 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-red-900 transition-all duration-300 transform hover:scale-105"
            >
              <Globe size={24} />
              <span>{t.learnMore}</span>
            </a>
          </div>

          {/* Language Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['Yorùbá', 'Igbo', 'Hausa', 'English'].map((lang) => (
              <div key={lang} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2">
                <span className="text-white font-semibold">{lang}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-400/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;