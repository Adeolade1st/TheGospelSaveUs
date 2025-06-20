import React from 'react';
import { Target, Eye, Heart, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import { teamMembers } from '../data/mockData';

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mr-4">
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

        {/* Team Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">{t.teamTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h4>
                <p className="text-blue-600 font-semibold mb-4">{member.role[currentLanguage.code]}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio[currentLanguage.code]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Partnership */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">{t.contact}</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Mail className="mr-4 text-blue-300" size={24} />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-blue-200">info@godwouldprovide.org</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="mr-4 text-blue-300" size={24} />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-blue-200">+234 (0) 800 GOD WORD</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-4 text-blue-300" size={24} />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-blue-200">Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prayer Request Form */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <Heart className="mr-4 text-amber-600" size={24} />
              <h3 className="text-2xl font-bold text-gray-900">{t.prayerTitle}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t.prayerDescription}</p>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <textarea
                rows={4}
                placeholder="Your Prayer Request"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
              >
                {t.submitPrayer}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;