import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle, Music, FileAudio } from 'lucide-react';
import { AudioDownloadService } from '../utils/audioDownload';

interface AudioDownloadButtonProps {
  audioUrl: string;
  title: string;
  artist: string;
  album?: string;
  language?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  showProgress?: boolean;
}

const AudioDownloadButton: React.FC<AudioDownloadButtonProps> = ({
  audioUrl,
  title,
  artist,
  album = 'God Will Provide Outreach Ministry',
  language,
  className = '',
  variant = 'primary',
  showProgress = true
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    setError(null);

    try {
      const metadata = {
        title,
        artist,
        album,
        year: new Date().getFullYear(),
        genre: 'Gospel/Spoken Word',
        language
      };

      if (showProgress) {
        await AudioDownloadService.downloadWithProgress(
          audioUrl,
          metadata,
          (progress) => setDownloadProgress(progress)
        );
      } else {
        await AudioDownloadService.downloadAudio(audioUrl, metadata);
      }

      setDownloadStatus('success');
      setTimeout(() => {
        setDownloadStatus('idle');
        setDownloadProgress(0);
      }, 3000);

    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
      setDownloadStatus('error');
      setTimeout(() => {
        setDownloadStatus('idle');
        setError(null);
      }, 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonContent = () => {
    switch (downloadStatus) {
      case 'downloading':
        return (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>Downloading...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle size={16} />
            <span>Downloaded!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={16} />
            <span>Failed</span>
          </>
        );
      default:
        return (
          <>
            <Download size={16} />
            <span>Download MP3</span>
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105`;
      case 'secondary':
        return `${baseStyles} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`;
      case 'minimal':
        return `${baseStyles} text-blue-600 hover:text-blue-700 hover:bg-blue-50`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="audio-download-container">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`${getButtonStyles()} ${className}`}
        title={`Download ${title} by ${artist}`}
        aria-label={`Download audio file: ${title} by ${artist}`}
      >
        {getButtonContent()}
      </button>

      {/* Progress Bar */}
      {showProgress && isDownloading && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Downloading...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <div className="flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* File Info */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <FileAudio size={12} />
          <span>MP3 • High Quality • {artist}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioDownloadButton;