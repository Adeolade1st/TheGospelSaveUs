import React from 'react';
import { Check, Heart, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import PaymentButton from './PaymentButton';

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

  const oneTimeDonations = [25, 50, 100, 250, 500];

  const testimonials = [
    {
      quote: "A blessing to my heart and soul. God has blessed and this is the beginning that never ends.",
      name: "Bishop Henry White",
      location: "Sept 17, 2024"
    },
    {
      quote: "A blessing to my heart and soul. Thank in His Name.",
      name: "",
      location: "Aug 10, 2024"
    },
    {
      quote: "GOD IS GREAT... THANK YOU FOR PRAISING HIM!!!!!!!!",
      name: "",
      location: "July 17, 2022"
    },
    {
      quote: "Your music is pure delight. I like it.",
      name: "",
      location: "Dec 14, 2014"
    },
    {
      quote: "love this message!!!!!!!!!",
      name: "",
      location: "Feb 20, 2020"
    }
  ];

  return (
    <section id="donate" className="py-15 bg-gradient-to-br from-red-900 via-red-800 to-amber-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.donationTitle}
          </h2>
          <p className="text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
            {t.donationSubtitle}
          </p>
        </div>

        {/* Contact Information for Donations */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">How to Donate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white" size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Email Us</h4>
              <p className="text-red-100 mb-4">Contact us directly for donation information</p>
              <a
                href="mailto:godwillprovide@ministry.org"
                className="inline-flex items-center space-x-2 bg-white text-red-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <Mail size={16} />
                <span>godwillprovide@ministry.org</span>
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="text-white" size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Call Us</h4>
              <p className="text-red-100 mb-4">Speak with us about supporting our ministry</p>
              <a
                href="tel:+14047099620"
                className="inline-flex items-center space-x-2 bg-white text-red-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <Phone size={16} />
                <span>(404) 709-9620</span>
              </a>
            </div>
          </div>
        </div>

        {/* Donation Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {donationTiers.map((tier, index) => (
            <div key={index} className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  ${tier.amount}
                  <span className="text-lg text-gray-600 font-normal">/month</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tier.title}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700 text-lg">{tier.impact}</span>
                </div>
              </div>

              <PaymentButton
                amount={tier.amount}
                description={`Monthly donation - ${tier.title} tier`}
                metadata={{
                  tier: tier.title,
                  type: 'monthly_subscription'
                }}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900"
              >
                <span>Contact for This Tier</span>
              </PaymentButton>
            </div>
          ))}
        </div>

        {/* One-time Donation */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-white mb-4">Prefer a One-time Gift?</h3>
          <p className="text-red-200 mb-8 text-lg leading-relaxed">Every contribution helps us reach more souls with God's transforming word</p>
          <div className="flex flex-wrap justify-center gap-4">
            {oneTimeDonations.map((amount) => (
              <PaymentButton
                key={amount}
                amount={amount}
                description={`One-time donation of $${amount}`}
                metadata={{
                  type: 'one_time_donation',
                  amount: amount.toString()
                }}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
              >
                <span>${amount}</span>
              </PaymentButton>
            ))}
            <PaymentButton
              amount={0}
              description="Custom donation amount"
              metadata={{
                type: 'custom_donation'
              }}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-full font-bold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
            >
              <span>Custom Amount</span>
            </PaymentButton>
          </div>
        </div>

        {/* Mailing Address */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-6">Send Donations By Mail</h3>
          <div className="text-center">
            <div className="bg-white/20 rounded-lg p-6 inline-block">
              <h4 className="text-lg font-bold text-white mb-2">God Will Provide Outreach Ministry</h4>
              <p className="text-red-100">P.O. Box 213</p>
              <p className="text-red-100">Fairburn, GA 30213</p>
            </div>
          </div>
        </div>

        {/* Jango Chart Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-16 jango-airplay-package">
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
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-600 font-semibold rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-300"
            >
              Visit Jango Page
            </a>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">What Our Supporters Say</h3>
          <div className="relative overflow-hidden max-w-full md:max-w-[632px] lg:max-w-[948px] mx-auto">
            <div className="flex flex-nowrap animate-scroll-carousel-optimized">
              {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-80 mx-2 p-6 bg-[#F8F9FA] rounded-lg shadow-md testimonial-card">
                  <p className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  {testimonial.name && (
                    <div className="text-gray-900 font-semibold">- {testimonial.name}</div>
                  )}
                  <div className="text-gray-600 text-sm">{testimonial.location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <Heart className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Partner With Us Today
            </h3>
            <p className="text-red-100 mb-6 leading-relaxed">
              Your support enables us to continue spreading God's transforming word across Nigeria and beyond. 
              Contact us today to learn more about partnership opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:godwillprovide@ministry.org"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Email Us
              </a>
              <a
                href="tel:+14047099620"
                className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;