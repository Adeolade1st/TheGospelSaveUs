import React, { useState } from 'react';
import { Menu, X, Globe, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { languages } from '../data/languages';
import { translations } from '../data/translations';
import AuthModal from './auth/AuthModal';
import PermissionGate from './auth/PermissionGate';
import { PERMISSIONS } from '../utils/rbac';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const { canAccessAdminDashboard } = usePermissions();

  const t = translations[currentLanguage.code];

  const navItems = [
    { key: 'home', href: '#home', path: '/' },
    { key: 'about', href: '#about', path: '/' },
    { key: 'content', href: '#content', path: '/' },
    { key: 'gallery', href: '/gallery', path: '/gallery', label: 'Gallery' },
    { key: 'donate', href: '#donate', path: '/' },
    { key: 'contact', href: '#contact', path: '/' }
  ];

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.path === '/gallery') {
      window.location.href = '/gallery';
      return;
    }

    if (item.href === '#contact') {
      // Scroll to footer
      const footer = document.querySelector('footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Handle other navigation normally
      const element = document.querySelector(item.href);
      if (element) {
        const headerHeight = 64; // Account for fixed header
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="/logo tgs.png" 
               alt="God Will Provide Outreach Ministry" 
                  className="w-auto h-4 object-contain"
                  style={{ 
                    backgroundColor: 'transparent',
                    imageRendering: 'crisp-edges'
                  }}
                />
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                >
                  {item.label || t[item.key as keyof typeof t]}
                </button>
              ))}
            </nav>

            {/* Right Side Controls */}
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

              {/* User Authentication */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-amber-500 rounded-full flex items-center justify-center">
                      <User className="text-white" size={16} />
                    </div>
                    <span className="hidden sm:inline font-medium">
                      {user.user_metadata?.full_name || 'Account'}
                    </span>
                    <ChevronDown size={16} />
                  </button>

                  {isUserDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            window.location.href = '/settings';
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>
                        
                        {/* Admin Dashboard Link - Only show if user has admin permissions */}
                        <PermissionGate permission={PERMISSIONS.ADMIN_DASHBOARD_ACCESS}>
                          <button
                            onClick={() => {
                              window.location.href = '/admin';
                              setIsUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <Settings size={16} />
                            <span>Admin Dashboard</span>
                          </button>
                        </PermissionGate>
                        
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  {/* <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                  >
                    Sign In
                  </button> */}
                  {/* <button
                    onClick={() => handleAuthClick('register')}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Up
                  </button> */}
                </div>
              )}

              {/* Donate Button */}
              {/* <button
                onClick={() => handleNavClick({ key: 'donate', href: '#donate', path: '/' })}
                className="hidden sm:inline-flex bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-full font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
              >
                {t.donateNow}
              </button> */}

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
                  <button
                    key={item.key}
                    onClick={() => {
                      handleNavClick(item);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
                  >
                    {item.label || t[item.key as keyof typeof t]}
                  </button>
                ))}
                
                {!user && (
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => {
                        handleAuthClick('login');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('register');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-center bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-md font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200"
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {user && (
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => {
                        window.location.href = '/settings';
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
                    >
                      Profile Settings
                    </button>
                    
                    {/* Admin Dashboard Link for Mobile - Only show if user has admin permissions */}
                    <PermissionGate permission={PERMISSIONS.ADMIN_DASHBOARD_ACCESS}>
                      <button
                        onClick={() => {
                          window.location.href = '/admin';
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md font-medium transition-colors duration-200"
                      >
                        Admin Dashboard
                      </button>
                    </PermissionGate>
                  </div>
                )}
                
                {/* <button
                  onClick={() => {
                    handleNavClick({ key: 'donate', href: '#donate', path: '/' });
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-center bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-md font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 mt-4"
                >
                  {t.donateNow}
                </button> */}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;