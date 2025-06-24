import React, { useState } from 'react';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { languages } from '../data/languages';
import { translations } from '../data/translations';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  const t = translations[currentLanguage.code];

  const navItems = [
    { key: 'home', href: '#home' },
    { key: 'about', href: '#about' },
    { key: 'content', href: '#content' },
    { key: 'donate', href: '#donate' },
    { key: 'contact', href: '#contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">God Would Provide Outreach</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
              >
                {t[item.key as keyof typeof t]}
              </a>
            ))}
          </nav>

          {/* Language Selector & CTA */}
          <div className="flex items-center space-x-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
              >
                <Globe size={20} />
                <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
                <ChevronDown size={16} />
              </button>

              {isLanguageDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLanguageDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setCurrentLanguage(language);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-200 ${
                          currentLanguage.code === language.code ? 'bg-red-50 text-red-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{language.nativeName}</span>
                        <span className="text-sm text-gray-500 ml-2">({language.name})</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Donate Button */}
            <a
              href="#donate"
              className="hidden sm:inline-flex bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-full font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
            >
              {t.donateNow}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-red-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
                >
                  {t[item.key as keyof typeof t]}
                </a>
              ))}
              <a
                href="#donate"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-md font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 mt-4"
              >
                {t.donateNow}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;