import React from 'react';
import { Users, Globe, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import AnimatedCounter from './AnimatedCounter';

const ImpactCounterSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const impactStats = [
    { icon: Users, value: 1, label: t.soulsReached, suffix: ' m+' },
    { icon: Globe, value: 4, label: t.languagesServed },
    { icon: Heart, value: 2500, label: t.monthlyDonors, suffix: '+' }
  ];

  return (
    <section className="py-15 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-red-600 rounded-2xl p-8 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-red-500">
              <stat.icon className="w-12 h-12 text-white mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">
                <AnimatedCounter 
                  end={stat.value} 
                  suffix={stat.suffix || ''} 
                  duration={2500 + (index * 500)}
                />
              </div>
              <div className="text-red-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactCounterSection;