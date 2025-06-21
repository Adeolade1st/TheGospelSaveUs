import React, { useState } from 'react';
import { Play, Clock, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import { mockSpokenWordContent } from '../data/mockData';
import AudioPlayer from './AudioPlayer';

const ContentSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

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
          {mockSpokenWordContent.map((content) => (
            <div key={content.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative bg-gradient-to-br from-red-600 to-amber-600 h-48 flex items-center justify-center">
                <button
                  onClick={() => setSelectedContent(content.id)}
                  className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                >
                  <Play className="text-red-600 ml-1" size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105">
            {t.viewAll}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;