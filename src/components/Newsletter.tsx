import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';
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
  );
};

export default Newsletter;