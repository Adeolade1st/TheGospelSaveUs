import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

const AboutSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  return (
    <section id="ministry-section" className="py-15 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Reduced by 4px */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t.aboutTitle}
          </h2>
        </div>

        {/* Ministry Description */}
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-gray-700 leading-relaxed text-center">
            Evangelist Birdie Jones leads Pure Gold Gospel Singers in sharing the transformative power of the gospel through compelling spoken word recordings. Our message reaches international audiences through Jango.com's radio AirPlay Platform, strategically placing God's Word alongside secular music streams. Your generous donations directly support our airtime costs, enabling continuous broadcasting to seekers worldwide. As Proverbs 11:30 reminds us, "The fruit of the righteous is a tree of life, and the one who is wise saves lives." By partnering with us through your 'seed of love' donation, you become an integral part of our mission to spread hope, faith, and salvation to listeners across the globe. Together, we can ensure God's message continues to touch hearts and transform lives through this innovative digital ministry.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;