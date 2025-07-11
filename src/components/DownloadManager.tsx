import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, AlertCircle, Mail, RefreshCw, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DownloadManagerProps {
  trackId: string; // This is now the content ID (UUID)
  trackTitle: string;
  artist: string;
  email: string;
  sessionId: string;
  onDownloadComplete?: () => void;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({
  trackId,
  trackTitle,
  artist,
  email,
  sessionId,
  onDownloadComplete
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [maxDownloads, setMaxDownloads] = useState(3);
  const [emailSent, setEmailSent] = useState(false);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Get download token from the Edge Function
    const getDownloadToken = async () => {
      setIsVerifying(true);
      try {
        console.log(`Checking download token for session: ${sessionId}`);
        
        // Call the Edge Function to get the download token
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase configuration missing');
        }
        
        const functionUrl = `${supabaseUrl}/functions/v1/get-download-token`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          
          if (response.status === 404) {
            console.log('No download token found, creating one...');
            // Create a token using the create-download-token function
            const createTokenUrl = `${supabaseUrl}/functions/v1/create-download-token`;
            const createResponse = await fetch(createTokenUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sessionId,
                trackId,
                email
              })
            });
            
            if (!createResponse.ok) {
              throw new Error('Failed to create download token');
            }
            
            const tokenData = await createResponse.json();
            if (tokenData.success && tokenData.tokenId) {
              setDownloadToken(tokenData.tokenId);
              
              // Set expiry date (7 days from now)
              const expiry = new Date();
              expiry.setDate(expiry.getDate() + 7);
              setExpiryDate(expiry);
              setDownloadCount(0);
              setMaxDownloads(3);
            } else {
              throw new Error(tokenData.error || 'Failed to create download token');
            }
          } else {
            throw new Error(errorData.error || `HTTP error ${response.status}`);
          }
        } else {
          const data = await response.json();
          console.log('Download token found:', data);
          setDownloadToken(data.id);
          setExpiryDate(new Date(data.expiresAt));
          setDownloadCount(data.downloadCount);
          setMaxDownloads(data.maxDownloads);
        }
      } catch (err) {
        console.error('Error getting download token:', err);
        setError('Failed to verify your purchase. Please try again later.');
      } finally {
        setIsVerifying(false);
      }
    };
    
    if (sessionId) {
      getDownloadToken();
    } else {
      setIsVerifying(false);
      setError('No session ID provided. Unable to verify purchase.');
    }
  }, [sessionId, trackId, email]);

  const handleDownload = async () => {
    if (downloadCount >= maxDownloads) {
      setError('Download limit reached. Please check your email for the backup link.');
      return;
    }

    if (!downloadToken) {
      setError('Download token not found. Please contact support.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      // Call the download-audio function with the token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      // Progress to 20%
      setDownloadProgress(20);
      
      const functionUrl = `${supabaseUrl}/functions/v1/download-audio?token=${downloadToken}`;
      
      // Use fetch with blob response type to get the file directly
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      // Progress to 50%
      setDownloadProgress(50);
      
      if (!response.ok) {
        // Try to parse error message if possible
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        } else {
          throw new Error(`HTTP error ${response.status}`);
        }
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Progress to 80%
      setDownloadProgress(80);
      
      // Create a download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${artist} - ${trackTitle}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      
      // Update download count locally
      setDownloadCount(prev => prev + 1);
      
      // Complete progress
      setDownloadProgress(100);
      
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed. Please try again or use the email backup link.');
    } finally {
      setIsDownloading(false);
    }
  };

  const sendEmailBackup = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || !downloadToken) {
        throw new Error('Missing required configuration');
      }
      
      const functionUrl = `${supabaseUrl}/functions/v1/send-download-email`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          tokenId: downloadToken,
          trackTitle,
          artist
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      setEmailSent(true);
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send email. Please try again.');
    }
  };

  if (isVerifying) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <h3 className="text-lg font-semibold">Verifying Your Purchase</h3>
          <p className="text-gray-600 text-center">
            Please wait while we verify your payment and prepare your download...
          </p>
        </div>
      </div>
    );
  }

  if (error && !downloadToken) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold">Verification Failed</h3>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    );
  }

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
            {expiryDate ? expiryDate.toLocaleDateString() : '7 days from now'}
          </span>
        </div>
      </div>

      {/* Security Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-start space-x-2">
        <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
        <div>
          <p className="text-blue-800 text-sm font-medium">Secure Download</p>
          <p className="text-blue-700 text-xs">Your download is protected with 256-bit encryption</p>
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
        disabled={isDownloading || downloadCount >= maxDownloads || !downloadToken}
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
              disabled={!downloadToken}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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