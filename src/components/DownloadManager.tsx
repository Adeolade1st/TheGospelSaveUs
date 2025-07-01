import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, AlertCircle, Mail } from 'lucide-react';

interface DownloadManagerProps {
  trackId: string;
  trackTitle: string;
  artist: string;
  email: string;
  onDownloadComplete?: () => void;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({
  trackId,
  trackTitle,
  artist,
  email,
  onDownloadComplete
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [maxDownloads] = useState(3);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // In a real implementation, you would fetch the download token status
    // from your backend here
  }, [trackId, email]);

  const handleDownload = async () => {
    if (downloadCount >= maxDownloads) {
      setError('Download limit reached. Please check your email for the backup link.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      // Simulate download progress
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 200);

      // Simulate download completion after 4 seconds
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      clearInterval(interval);
      setDownloadProgress(100);
      
      // Create download link
      const link = document.createElement('a');
      link.href = `https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/${trackId}.mp3`;
      link.download = `${artist} - ${trackTitle}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update download count
      setDownloadCount(prev => prev + 1);
      
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (err) {
      setError('Download failed. Please try again or use the email backup link.');
    } finally {
      setIsDownloading(false);
    }
  };

  const sendEmailBackup = async () => {
    setEmailSent(true);
    // In a real implementation, you would call your backend to send an email
    // with the download link
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Download className="text-green-600" size={24} />
        <h3 className="text-lg font-semibold">Download Your Purchase</h3>
      </div>

      {/* Track Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900">{trackTitle}</h4>
        <p className="text-gray-600">by {artist}</p>
        <p className="text-sm text-gray-500 mt-1">High Quality MP3 • 320kbps</p>
      </div>

      {/* Download Status */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Downloads remaining:</span>
          <span className="font-semibold">{maxDownloads - downloadCount} of {maxDownloads}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Expires:</span>
          <span className="font-semibold">
            {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Download Progress */}
      {isDownloading && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Downloading...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading || downloadCount >= maxDownloads}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 mb-3"
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Downloading... {downloadProgress}%</span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Download Now</span>
          </>
        )}
      </button>

      {/* Email Backup */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="text-gray-400" size={16} />
            <span className="text-sm text-gray-600">Email backup</span>
          </div>
          
          {emailSent ? (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Sent</span>
            </div>
          ) : (
            <button
              onClick={sendEmailBackup}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Send to email
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Backup download link sent to {email}
        </p>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="text-blue-600" size={16} />
          <div className="text-sm text-blue-800">
            <p>Your download link expires in 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadManager;