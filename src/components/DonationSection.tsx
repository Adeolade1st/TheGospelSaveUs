import React from 'react';
import { Check, Heart, Mail, Phone } from 'lucide-react';
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

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: 'godwillprovide@ministry.org',
      href: 'mailto:godwillprovide@ministry.org'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '(404) 709-9620',
      href: 'tel:+14047099620'
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

        {/* Donation Information */}
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

              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Contact us to support this tier
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information for Donations */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">How to Donate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white" size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Support Our Ministry</h4>
              <p className="text-red-100 mb-6 leading-relaxed">
                Your generous donations help us reach more souls with God's transforming word through our multilingual spoken word ministry.
              </p>
              <div className="space-y-3">
                {contactMethods.map((method, index) => (
                  <a
                    key={index}
                    href={method.href}
                    className="flex items-center justify-center space-x-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 text-white hover:bg-white/30 transition-all duration-200"
                  >
                    <method.icon size={20} />
                    <span>{method.value}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white" size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Mailing Address</h4>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="text-white font-medium mb-2">God Will Provide Outreach Ministry</p>
                <p className="text-red-100">P.O. Box 213</p>
                <p className="text-red-100">Fairburn, GA 30213</p>
              </div>
              <p className="text-red-100 mt-4 text-sm">
                Please include your contact information with mailed donations for acknowledgment.
              </p>
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
      </div>
    </section>
  );
};

export default DonationSection;