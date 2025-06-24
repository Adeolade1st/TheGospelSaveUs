import React from 'react';
import { Heart, Users, Globe, TrendingUp, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import AnimatedCounter from './AnimatedCounter';

const DonationSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const impactStats = [
    { icon: Users, value: 1, label: t.soulsReached, suffix: ' m+' },
    { icon: TrendingUp, value: 4, label: t.languagesServed },
    { icon: Heart, value: 2500, label: t.monthlySupporters, suffix: '+' }
  ];

  const donationTiers = [
    {
      amount: 12,
      title: 'Intro',
      description: 'Help us create one new spoken word piece monthly',
      impact: 'Reaches approximately 200 souls monthly'
    },
    {
      amount: 100,
      title: 'Platinum',
      description: 'Sponsor content in all three native languages',
      impact: 'Reaches approximately 1800 souls monthly'
    },
    {
      amount: 250,
      title: 'Multi-Platinum',
      description: 'Full support for content creation and outreach',
      impact: 'Reaches approximately 5,000 souls monthly'
    }
  ];

  return (
    <section id="donate" className="py-20 bg-gradient-to-br from-red-900 via-red-800 to-amber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.donationTitle}
          </h2>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            {t.donationSubtitle}
          </p>
        </div>

        {/* Impact Stats with Animated Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300">
              <stat.icon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <AnimatedCounter 
                end={stat.value} 
                suffix={stat.suffix || ''} 
                duration={2500 + (index * 500)}
              />
              <div className="text-red-200 font-medium mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Donation Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {donationTiers.map((tier, index) => (
            <div key={index} className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  ${tier.amount}
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tier.title}
                </h3>
                <p className="text-gray-600">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">{tier.impact}</span>
                </div>
              </div>

              <button className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800">
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
              <p className="text-red-100 mb-4 italic">
                "Supporting this ministry has been one of the most fulfilling decisions of my life. Seeing lives transformed through God's word in our native languages is incredible."
              </p>
              <div className="text-white font-semibold">- Sister Mary O.</div>
              <div className="text-red-200 text-sm">Atlanta, Georgia</div>
            </div>
            <div className="text-center">
              <p className="text-red-100 mb-4 italic">
                "The monthly updates showing how many souls are reached gives me so much joy. My contribution is making a real difference in spreading God's love."
              </p>
              <div className="text-white font-semibold">- Brother John A.</div>
              <div className="text-red-200 text-sm">Atlanta, Georgia</div>
            </div>
          </div>
        </div>

        {/* One-time Donation */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Prefer a One-time Gift?</h3>
          <p className="text-red-200 mb-8">Every contribution helps us reach more souls with God's transforming word</p>
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