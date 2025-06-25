import React from 'react';
import { Play, Heart, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import AnimatedCounter from './AnimatedCounter';

const Hero: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const impactStats = [
    { icon: Heart, value: 1, label: t.soulsReached, suffix: ' m+' },
    { icon: Globe, value: 4, label: t.languagesServed },
    { icon: Heart, value: 2500, label: t.monthlyDonors, suffix: '+' }
  ];

  const handleLearnMoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const ministrySection = document.getElementById('ministry-section');
    if (ministrySection) {
      const headerHeight = 64; // Account for fixed header
      const targetPosition = ministrySection.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
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

            {/* Main Title - Reduced by 4px */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t.heroTitle}
            </h1>

            {/* Subtitle - Reduced by 4px */}
            <h2 className="text-xl md:text-2xl text-red-100 mb-6 font-medium">
              {t.heroSubtitle}
            </h2>

            {/* Description - Reduced by 4px */}
            <p className="text-lg text-red-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <a
                href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-white text-red-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <Play className="group-hover:scale-110 transition-transform duration-300" size={24} />
                <span>{t.listenNow}</span>
              </a>
              
              <a
                href="#ministry-section"
                onClick={handleLearnMoreClick}
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

      {/* Counter Section - Positioned between Hero and Ministry sections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl p-8 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-red-100">
                <stat.icon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix || ''} 
                    duration={2500 + (index * 500)}
                  />
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;