import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

const DonationSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

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

  const testimonials = [
    {
      quote: "Supporting this ministry has been one of the most fulfilling decisions of my life. Seeing lives transformed through God's word in our native languages is incredible.",
      name: "Sister Mary O.",
      location: "Atlanta, Georgia"
    },
    {
      quote: "The monthly updates showing how many souls are reached gives me so much joy. My contribution is making a real difference in spreading God's love.",
      name: "Brother John A.",
      location: "Atlanta, Georgia"
    },
    {
      quote: "I love how this ministry reaches people in their heart language. The spoken word format is so powerful and accessible to everyone.",
      name: "Pastor David K.",
      location: "Houston, Texas"
    },
    {
      quote: "Being part of this mission to take the gospel worldwide through radio airplay is amazing. Every donation truly counts.",
      name: "Sister Grace M.",
      location: "Chicago, Illinois"
    },
    {
      quote: "The impact reports show real results. It's encouraging to see how God is using our small contributions for His glory.",
      name: "Brother Samuel T.",
      location: "Miami, Florida"
    }
  ];

  return (
    <section id="donate" className="py-20 bg-gradient-to-br from-red-900 via-red-800 to-amber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Reduced by 4px */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.donationTitle}
          </h2>
          <p className="text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
            {t.donationSubtitle}
          </p>
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
                <p className="text-gray-600 text-lg leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700 text-lg">{tier.impact}</span>
                </div>
              </div>

              <button className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800">
                Support This Tier
              </button>
            </div>
          ))}
        </div>

        {/* One-time Donation */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-white mb-4">Prefer a One-time Gift?</h3>
          <p className="text-red-200 mb-8 text-lg leading-relaxed">Every contribution helps us reach more souls with God's transforming word</p>
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

        {/* Jango Chart Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Jango Airplay Packages</h3>
          <div className="bg-white rounded-2xl p-6 overflow-x-auto">
            <img 
              src="/src/assets/jango chart.png" 
              alt="Jango Airplay Package Pricing Chart" 
              className="w-full h-auto max-w-none"
              style={{ minWidth: '800px' }}
            />
          </div>
          <div className="text-center mt-6">
            <p className="text-red-100 text-lg mb-4 leading-relaxed">
              Choose the package that best fits your support level and help us reach more souls through Jango's radio platform.
            </p>
            <a
              href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300"
            >
              Visit Jango Page
            </a>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">What Our Donors Say</h3>
          <div className="relative overflow-hidden max-w-full md:max-w-[632px] lg:max-w-[948px] mx-auto">
            <div className="flex flex-nowrap animate-scroll-carousel">
              {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-80 mx-2 p-6 bg-[#F8F9FA] rounded-lg shadow-md">
                  <p className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="text-gray-900 font-semibold">- {testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;