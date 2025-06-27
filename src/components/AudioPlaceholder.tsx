import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlaceholderProps {
  language: string;
  nativeName: string;
  duration: string;
  description: string;
  gradient: string;
  sampleTitle: string;
  className?: string;
}

const AudioPlaceholder: React.FC<AudioPlaceholderProps> = ({
  language,
  nativeName,
  duration,
  description,
  gradient,
  sampleTitle,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // Simulate audio progress when playing
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${className}`}>
      {/* Header with Language Info */}
      <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-sm font-bold uppercase tracking-wider">{language}</span>
          </div>
          <div className="flex items-center space-x-1 text-white/80">
            <Volume2 size={16} />
            <span className="text-sm">{duration}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1">{nativeName}</h3>
        <p className="text-white/90 text-sm">{description}</p>
      </div>

      {/* Audio Content */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">{sampleTitle}</h4>
          <p className="text-sm text-gray-600">Sample audio content in {nativeName}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{formatTime(Math.floor(currentTime * 0.6))}</span>
            <span>{duration}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-100 ease-out`}
              style={{ width: `${currentTime}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePlayPause}
            className={`w-12 h-12 bg-gradient-to-r ${gradient} text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="ml-0.5" />
            )}
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Audio Sample
            </span>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
              Listen Full Version →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlaceholder;