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
      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Contact Info */}
            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">{t.contact}</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="mr-4 text-red-300" size={24} />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-red-200">Jones8874@bellsouth.net</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-4 text-red-300" size={24} />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-red-200">404-709-9620</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-4 text-red-300" size={24} />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-red-200">Atlanta, Georgia</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-4 text-red-300" size={24} />
                  <div>
                    <p className="font-semibold">Mailing Address</p>
                    <p className="text-red-200">P.O. Box 213, Fairburn, GA 30213</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Mail className="text-red-200 mr-4" size={32} />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.newsletterTitle}
            </h2>
          </div>
          
          <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto">
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
                className="bg-white text-red-600 px-8 py-4 rounded-full font-bold hover:bg-red-50 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-6 text-red-100">
              Thank you for subscribing! You'll receive our latest updates soon.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Newsletter;