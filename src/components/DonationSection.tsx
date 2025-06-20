import React from 'react';
import { Heart, Users, Globe, TrendingUp, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import { donationTiers } from '../data/mockData';

const DonationSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const impactStats = [
    { icon: Users, value: '50,000+', label: t.soulsReached },
    { icon: Globe, value: '127', label: t.contentCreated },
    { icon: TrendingUp, value: '4', label: t.languagesServed },
    { icon: Heart, value: '2,500+', label: t.monthlySupporters }
  ];

  return (
    <section id="donate" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-amber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.donationTitle}
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t.donationSubtitle}
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
              <stat.icon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-blue-200 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Donation Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {donationTiers.map((tier, index) => (
            <div key={index} className={`relative bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 ${index === 1 ? 'ring-4 ring-amber-400' : ''}`}>
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-amber-900 px-6 py-2 rounded-full font-bold text-sm">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  ${tier.amount}
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tier.title[currentLanguage.code]}
                </h3>
                <p className="text-gray-600">
                  {tier.description[currentLanguage.code]}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">{tier.impact[currentLanguage.code]}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Monthly ministry updates</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Early access to new content</span>
                </div>
                {index >= 1 && (
                  <div className="flex items-start space-x-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">Personal prayer support</span>
                  </div>
                )}
                {index === 2 && (
                  <div className="flex items-start space-x-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">Ministry partnership recognition</span>
                  </div>
                )}
              </div>

              <button className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
                index === 1 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              }`}>
                Support This Tier
              </button>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">What Our Supporters Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-blue-100 mb-4 italic">
                "Supporting this ministry has been one of the most fulfilling decisions of my life. Seeing lives transformed through God's word in our native languages is incredible."
              </p>
              <div className="text-white font-semibold">- Sister Mary O.</div>
              <div className="text-blue-200 text-sm">Lagos, Nigeria</div>
            </div>
            <div className="text-center">
              <p className="text-blue-100 mb-4 italic">
                "The monthly updates showing how many souls are reached gives me so much joy. My contribution is making a real difference in spreading God's love."
              </p>
              <div className="text-white font-semibold">- Brother John A.</div>
              <div className="text-blue-200 text-sm">Abuja, Nigeria</div>
            </div>
          </div>
        </div>

        {/* One-time Donation */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Prefer a One-time Gift?</h3>
          <p className="text-blue-200 mb-8">Every contribution helps us reach more souls with God's transforming word</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[25, 50, 100, 250, 500].map((amount) => (
              <button
                key={amount}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
              >
                ${amount}
              </button>
            ))}
            <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-full font-bold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105">
              Custom Amount
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;