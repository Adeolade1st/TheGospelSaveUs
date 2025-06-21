import React, { useState } from 'react';
import { Mail, Check, Phone, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

const Newsletter: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <>
      {/* Contact & Prayer Request Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Mail className="text-blue-200 mr-4" size={32} />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.newsletterTitle}
            </h2>
          </div>
          
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            {t.newsletterDescription}
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                className="flex-1 px-6 py-4 rounded-full border-2 border-transparent focus:border-white focus:outline-none text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={isSubscribed}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribed ? (
                  <span className="flex items-center">
                    <Check size={20} className="mr-2" />
                    Subscribed!
                  </span>
                ) : (
                  t.subscribe
                )}
              </button>
            </div>
          </form>

          {isSubscribed && (
            <div className="mt-6 text-blue-100">
              Thank you for subscribing! You'll receive our latest updates soon.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Newsletter;