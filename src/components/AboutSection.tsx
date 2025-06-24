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
            Learn about our heart, vision, and the team God has assembled to reach souls across Nigeria and beyond
          </p>
        </div>

        {/* Ministry Description */}
        <div className="max-w-4xl mx-auto mb-16">
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            Through Pure Gold Gospel Singers, Evangelist Jones shares the gospel through spoken word recordings, reaching international audiences via Jango.com's radio AirPlay Platform. Your generous donations support our airtime costs, enabling us to spread God's message alongside secular music streams. By partnering with us, you help ensure the gospel reaches listeners worldwide, fulfilling our mission to actively share God's Word (Proverbs 11:30). Support our outreach ministry with your 'seed of love' donation today.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center mr-4">
                <Target className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t.missionTitle}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              {t.missionText}
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              We make the gospel in spoken word available internationally using Radio Airplay Platform on Jango.com
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8 text-center">
            <div className="flex items-center justify-center mb-6">
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