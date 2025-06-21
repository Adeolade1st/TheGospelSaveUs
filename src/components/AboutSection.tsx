import React from 'react';
import { Target, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

const AboutSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.aboutTitle}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about our heart, vision, and the team God has assembled to reach souls across Nigeria
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center mr-4">
                <Target className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t.missionTitle}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {t.missionText}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mr-4">
                <Eye className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t.visionTitle}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {t.visionText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;