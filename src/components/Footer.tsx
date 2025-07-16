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
    { key: 'donate', href: '#donate' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src="/the_gospel_save_us_logo-removebg-preview.png" 
               //  alt="God Will Provide Outreach Ministry" 
                className="w-[1px] h-[1px] object-contain"
                style={{ 
                  backgroundColor: 'transparent',
                  imageRendering: 'crisp-edges'
                }}
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Reaching souls across Nigeria with God's transforming word through powerful spoken word ministering in Yoruba, Igbo, and Hausa languages.
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

          {/* Contact Info - Updated with white text color */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.connectWithUs}</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="mr-3 text-red-300" size={18} />
                <span className="text-white">thegospelsavesus100@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="mr-3 text-red-300" size={18} />
                <span className="text-white">(404) 709-9620</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="mr-3 text-red-300" size={18} />
                <div>
                  <p className="text-white text-sm font-medium">Mailing Address:</p>
                  <p className="text-white">P.O. Box 213, Fairburn, GA 30213</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 God Will Provide Outreach Ministry. {t.allRightsReserved}
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