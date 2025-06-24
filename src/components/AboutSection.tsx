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
        </div>

        {/* Ministry Description */}
        <div className="max-w-4xl mx-auto mb-16">
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            Evangelist Birdie Jones leads Pure Gold Gospel Singers in sharing the transformative power of the gospel through compelling spoken word recordings. Our message reaches international audiences through Jango.com's radio AirPlay Platform, strategically placing God's Word alongside secular music streams. Your generous donations directly support our airtime costs, enabling continuous broadcasting to seekers worldwide. As Proverbs 11:30 reminds us, "The fruit of the righteous is a tree of life, and the one who is wise saves lives." By partnering with us through your 'seed of love' donation, you become an integral part of our mission to spread hope, faith, and salvation to listeners across the globe. Together, we can ensure God's message continues to touch hearts and transform lives through this innovative digital ministry.
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
            <p className="text-gray-700 leading-relaxed text-lg">
              To reach every heart in Nigeria and beyond with the transforming power of God's word through culturally relevant spoken word ministry in native languages. We make the gospel in spoken word available internationally using Radio Airplay Platform on Jango.com.
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