import React, { useState } from 'react';
import { Search, Filter, Play, Clock, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import { mockSpokenWordContent } from '../data/mockData';
import AudioPlayer from './AudioPlayer';

const ContentSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('all');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('all');

  const themes = ['hope', 'healing', 'purpose', 'faith', 'love', 'victory'];
  const languageOptions = ['all', 'en', 'yo', 'ig', 'ha'];

  const filteredContent = mockSpokenWordContent.filter(content => {
    const matchesSearch = content.title[currentLanguage.code].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description[currentLanguage.code].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.scriptureRef.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = selectedLanguageFilter === 'all' || content.language === selectedLanguageFilter;
    const matchesTheme = selectedThemeFilter === 'all' || content.theme === selectedThemeFilter;

    return matchesSearch && matchesLanguage && matchesTheme;
  });

  return (
    <section id="content" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.latestContent}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience transformative spoken word content in your native language
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{t.filterBy}:</span>
              </div>
              
              <select
                value={selectedLanguageFilter}
                onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t.allLanguages}</option>
                <option value="en">English</option>
                <option value="yo">Yorùbá</option>
                <option value="ig">Igbo</option>
                <option value="ha">Hausa</option>
              </select>

              <select
                value={selectedThemeFilter}
                onChange={(e) => setSelectedThemeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Themes</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>
                    {t[theme as keyof typeof t] || theme}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audio Player Modal */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
              <button
                onClick={() => setSelectedContent(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
              {(() => {
                const content = mockSpokenWordContent.find(c => c.id === selectedContent);
                return content ? (
                  <AudioPlayer
                    audioUrl={content.audioUrl}
                    title={content.title[currentLanguage.code]}
                    duration={content.duration}
                  />
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContent.map((content) => (
            <div key={content.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative bg-gradient-to-br from-blue-600 to-amber-600 h-48 flex items-center justify-center">
                <button
                  onClick={() => setSelectedContent(content.id)}
                  className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                >
                  <Play className="text-blue-600 ml-1" size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {content.language.toUpperCase()}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock size={14} className="mr-1" />
                    {content.duration}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {content.title[currentLanguage.code]}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {content.description[currentLanguage.code]}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen size={14} className="mr-1" />
                    {content.scriptureRef}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(content.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No content found matching your criteria.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105">
            {t.viewAll}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;