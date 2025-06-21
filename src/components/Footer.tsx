import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

const Footer: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  const quickLinks = [
    { key: 'home', href: '#home' },
    { key: 'content', href: '#content' },
    { key: 'about', href: '#about' },
    { key: 'donate', href: '#donate' },
    { key: 'prayerRequest', href: '#prayer' },
    { key: 'partnership', href: '#partnership' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{t.heroTitle}</h3>
                <p className="text-gray-400 text-sm">Transforming Hearts Through Spoken Word</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Reaching souls across Nigeria with God's transforming word through powerful spoken word ministry in Yoruba, Igbo, and Hausa languages.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.quickLinks}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {t[link.key as keyof typeof t] || link.key}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.connectWithUs}</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="mr-3 text-gray-400" size={18} />
                <span className="text-gray-300">info@godwouldprovide.org</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-3 text-gray-400" size={18} />
                <span className="text-gray-300">+234 (0) 800 GOD WORD</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-3 text-gray-400" size={18} />
                <span className="text-gray-300">Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 God Would Provide Ministry. {t.allRightsReserved}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;