import React from 'react';
import { Music, Globe, Heart, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import AnimatedCounter from './AnimatedCounter';

const ContentSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const impactStats = [
    { icon: Users, value: 1, label: t.soulsReached, suffix: ' m+' },
    { icon: TrendingUp, value: 4, label: t.languagesServed },
    { icon: Heart, value: 2500, label: t.monthlyDonors, suffix: '+' }
  ];

  const languageCards = [
    {
      name: 'Hausa',
      nativeName: 'Hausa',
      description: 'Northern Nigeria\'s lingua franca',
      image: 'https://images.pexels.com/photos/3807755/pexels-photo-3807755.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=hausa',
      gradient: 'from-green-600 to-emerald-700'
    },
    {
      name: 'Igbo',
      nativeName: 'Igbo',
      description: 'Language of the Southeast',
      image: 'https://images.pexels.com/photos/3807758/pexels-photo-3807758.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=igbo',
      gradient: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'Yoruba',
      nativeName: 'Yorùbá',
      description: 'Language of the Southwest',
      image: 'https://images.pexels.com/photos/3807760/pexels-photo-3807760.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      jangoUrl: 'https://www.jango.com/music/Pure+Gold+Gospel+Singers?l=yoruba',
      gradient: 'from-amber-600 to-orange-700'
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
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience transformative spoken word content in your native language
          </p>
        </div>

        {/* Counter Section - Moved above Support Our Ministry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg transform hover:scale-105 transition-all duration-300 border border-gray-100">
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

        {/* Language Cards Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {languageCards.map((language, index) => (
              <a
                key={index}
                href={language.jangoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-3xl shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {/* Background Image */}
                <div className="relative h-64">
                  <img
                    src={language.image}
                    alt={`${language.name} cultural imagery`}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${language.gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                </div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold mb-2">{language.nativeName}</h3>
                    <p className="text-white/90 text-lg mb-3">{language.description}</p>
                    <div className="flex items-center space-x-2 text-white/80 group-hover:text-white transition-colors duration-300">
                      <Globe size={16} />
                      <span className="text-sm font-medium">Listen on Jango</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Music className="text-white" size={16} />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Amazon Support Section */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border-2 border-amber-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Support Our Ministry
            </h3>
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
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

        {/* Jango Music Player Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border-2 border-purple-300">
            <h3 className="text-2xl font-bold text-white mb-4">
              Listen on Jango Radio
            </h3>
            <p className="text-xl text-purple-100 mb-6 leading-relaxed">
              Stream Pure Gold Gospel Singers on Jango's radio platform
            </p>
            <a
              href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-700 font-bold text-lg rounded-full hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Music className="w-6 h-6 mr-3" />
              Play on Jango
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;