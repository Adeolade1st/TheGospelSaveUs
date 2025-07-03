import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import PaymentButton from './PaymentButton';

const DonationSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

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

  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount >= 1) {
      // The PaymentButton will handle the actual payment processing
      // We just need to close the modal after the payment is initiated
      setShowCustomAmount(false);
      setCustomAmount('');
    }
  };

  const handleCustomAmountCancel = () => {
    setShowCustomAmount(false);
    setCustomAmount('');
  };

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
                <span>Support This Tier</span>
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
            <button
              onClick={() => setShowCustomAmount(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-full font-bold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
            >
              <span>Custom Amount</span>
            </button>
          </div>
        </div>

        {/* Custom Amount Modal */}
        {showCustomAmount && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
              {/* Close button */}
              <button
                onClick={handleCustomAmountCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Enter Custom Amount</h3>
              <div className="mb-6">
                <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    id="customAmount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                    autoFocus
                  />
                </div>
                {customAmount && parseFloat(customAmount) < 1 && (
                  <p className="mt-2 text-sm text-red-600">Minimum donation amount is $1.00</p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCustomAmountCancel}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                {parseFloat(customAmount) >= 1 ? (
                  <PaymentButton
                    amount={parseFloat(customAmount)}
                    description={`Custom donation of $${customAmount}`}
                    metadata={{
                      type: 'custom_donation',
                      amount: customAmount
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-lg hover:from-red-800 hover:to-red-900 transition-all duration-200 font-semibold"
                    onClick={handleCustomAmountSubmit}
                  >
                    <span>Donate ${customAmount}</span>
                  </PaymentButton>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-3 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold"
                  >
                    Enter Amount
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Jango Chart Section - Updated with proper image handling */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-16 jango-airplay-package hidden md:block">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Jango Airplay Packages</h3>
          
          {/* Updated image section with the attached chart */}
          <div className="bg-white rounded-2xl p-6 overflow-x-auto">
            <div className="min-w-[800px] flex items-center justify-center">
              <div className="w-full max-w-5xl">
                <img 
                  src="/src/assets/jango chart copy.png" 
                  alt="Jango Airplay Package Pricing Chart showing Free, Intro ($10), Gold ($30), Platinum ($100), and Multi-Platinum ($250) packages with detailed features and monthly plays"
                  className="w-full h-auto rounded-lg shadow-lg"
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    console.error('Failed to load Jango chart image');
                    // Fallback content if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'block';
                    }
                  }}
                />
                
                {/* Fallback content (hidden by default, shown if image fails) */}
                <div className="hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Jango Airplay Package Options</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left">
                    <div className="bg-gray-100 rounded-lg p-4 shadow-md">
                      <h5 className="font-bold text-lg text-gray-600 mb-3">Free</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• $0</li>
                        <li>• 10 monthly plays*</li>
                        <li>• 1 song upload</li>
                        <li>• 1 week data access</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-100 rounded-lg p-4 shadow-md">
                      <h5 className="font-bold text-lg text-purple-600 mb-3">Intro</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• $10</li>
                        <li>• 200 monthly plays</li>
                        <li>• 10 song uploads</li>
                        <li>• All-time data access</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-100 rounded-lg p-4 shadow-md">
                      <h5 className="font-bold text-lg text-yellow-600 mb-3">Gold</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• $30</li>
                        <li>• 600 monthly plays</li>
                        <li>• 100 bonus plays</li>
                        <li>• 20 song uploads</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-100 rounded-lg p-4 shadow-md border-2 border-blue-500">
                      <h5 className="font-bold text-lg text-blue-600 mb-3">Platinum</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• $100</li>
                        <li>• 2,000 monthly plays</li>
                        <li>• 500 bonus plays</li>
                        <li>• 30 song uploads</li>
                      </ul>
                    </div>
                    
                    <div className="bg-teal-100 rounded-lg p-4 shadow-md relative">
                      <div className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs px-2 py-1 rounded">Best Deal!</div>
                      <h5 className="font-bold text-lg text-teal-600 mb-3">Multi-Platinum</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• $250</li>
                        <li>• 5,000 monthly plays</li>
                        <li>• 1,250 bonus plays</li>
                        <li>• Unlimited uploads</li>
                        <li>• Concierge service</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      <strong>Note:</strong> These packages help us reach more listeners through Jango's radio platform. 
                      Your donation directly supports our airtime costs and helps spread God's word to a wider audience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-red-100 text-lg mb-4 leading-relaxed">
              Choose the package that best fits your support level and help us reach more souls through radio airplay package.
            </p>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">What Our Donors Say</h3>
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