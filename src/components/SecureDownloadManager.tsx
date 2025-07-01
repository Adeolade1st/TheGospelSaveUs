import React, { useState, useEffect } from 'react';
import { Download, Mail, CheckCircle, Clock, Shield, AlertCircle } from 'lucide-react';

interface DownloadToken {
  id: string;
  trackId: string;
  email: string;
  expiresAt: Date;
  downloadCount: number;
  maxDownloads: number;
  isActive: boolean;
}

interface SecureDownloadManagerProps {
  trackId: string;
  trackTitle: string;
  artistName: string;
  purchaseEmail: string;
  onDownloadComplete: () => void;
}

export const SecureDownloadManager: React.FC<SecureDownloadManagerProps> = ({
  trackId,
  trackTitle,
  artistName,
  purchaseEmail,
  onDownloadComplete
}) => {
  const [downloadToken, setDownloadToken] = useState<DownloadToken | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    generateDownloadToken();
  }, [trackId, purchaseEmail]);

  const generateDownloadToken = async () => {
    try {
      const response = await fetch('/api/generate-download-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId,
          email: purchaseEmail,
        }),
      });

      if (response.ok) {
        const token = await response.json();
        setDownloadToken(token);
      } else {
        throw new Error('Failed to generate download token');
      }
    } catch (error) {
      setError('Failed to prepare download. Please contact support.');
    }
  };

  const initiateSecureDownload = async () => {
    if (!downloadToken || !downloadToken.isActive) {
      setError('Download token is invalid or expired');
      return;
    }

    if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
      setError('Download limit exceeded. Please check your email for the backup link.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      // Create secure download URL with token
      const downloadUrl = `/api/secure-download/${downloadToken.id}`;
      
      // Fetch the file with progress tracking
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${downloadToken.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        received += value.length;
        
        if (total > 0) {
          const progress = (received / total) * 100;
          setDownloadProgress(Math.round(progress));
        }
      }

      // Combine chunks and create download
      const allChunks = new Uint8Array(received);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const blob = new Blob([allChunks], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${artistName} - ${trackTitle}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Update download count
      await updateDownloadCount(downloadToken.id);
      
      onDownloadComplete();
      
    } catch (error) {
      setError('Download failed. Please try again or use the email backup link.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const updateDownloadCount = async (tokenId: string) => {
    try {
      await fetch(`/api/update-download-count/${tokenId}`, {
        method: 'POST',
      });
      
      // Update local token state
      if (downloadToken) {
        setDownloadToken({
          ...downloadToken,
          downloadCount: downloadToken.downloadCount + 1,
        });
      }
    } catch (error) {
      console.error('Failed to update download count:', error);
    }
  };

  const sendEmailBackup = async () => {
    try {
      const response = await fetch('/api/send-download-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: purchaseEmail,
          trackTitle,
          artistName,
          downloadTokenId: downloadToken?.id,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      setError('Failed to send email backup. Please contact support.');
    }
  };

  const isTokenExpired = downloadToken && new Date() > downloadToken.expiresAt;
  const downloadsRemaining = downloadToken ? downloadToken.maxDownloads - downloadToken.downloadCount : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Download className="text-green-600" size={24} />
        <h3 className="text-lg font-semibold">Secure Download</h3>
      </div>

      {/* Track Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900">{trackTitle}</h4>
        <p className="text-gray-600">by {artistName}</p>
        <p className="text-sm text-gray-500 mt-1">High Quality MP3 • 320kbps</p>
      </div>

      {/* Download Status */}
      {downloadToken && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Downloads remaining:</span>
            <span className="font-semibold">{downloadsRemaining} of {downloadToken.maxDownloads}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Expires:</span>
            <span className={`font-semibold ${isTokenExpired ? 'text-red-600' : 'text-gray-900'}`}>
              {downloadToken.expiresAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

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
        onClick={initiateSecureDownload}
        disabled={
          isDownloading || 
          !downloadToken || 
          !downloadToken.isActive || 
          isTokenExpired || 
          downloadsRemaining <= 0
        }
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 mb-3"
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Downloading...</span>
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
          Backup download link sent to {purchaseEmail}
        </p>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Secure Download</p>
            <p>This download is protected and tracked for security. Links expire after 7 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureDownloadManager;