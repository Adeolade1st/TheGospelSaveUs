import React, { useState, useRef } from 'react';
import { Download, Lock, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaymentButton from './PaymentButton';

interface SecureDownloadButtonProps {
  contentId: string; // Changed from audioUrl to contentId
  title: string;
  artist: string;
  price: number;
  language: string;
  className?: string;
}

const SecureDownloadButton: React.FC<SecureDownloadButtonProps> = ({
  contentId,
  title,
  artist,
  price,
  language,
  className = ''
}) => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const requestIdRef = useRef<string>(crypto.randomUUID().substring(0, 8));

  // Check if user has already purchased this audio
  React.useEffect(() => {
    if (user) {
      checkPurchaseStatus();
    }
  }, [user, contentId]);

  const checkPurchaseStatus = async () => {
    try {
      // Check for existing download tokens
      const { data, error } = await supabase
        .from('download_tokens')
        .select('*')
        .eq('email', user?.email)
        .eq('track_id', contentId) // Now using contentId
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Error checking purchase status:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('User has already purchased this audio');
        setHasPurchased(true);
        setDownloadToken(data[0].id);
      } else {
        // If no token found, check donations as fallback
        const { data: donationData, error: donationError } = await supabase
          .from('donations')
          .select('*')
          .eq('customer_email', user?.email)
          .eq('metadata->>contentId', contentId) // Using contentId in metadata
          .eq('status', 'completed')
          .limit(1);

        if (donationError) {
          console.error('Error checking donation status:', donationError);
          return;
        }

        if (donationData && donationData.length > 0) {
          console.log('User has purchased this audio via donation');
          setHasPurchased(true);
          // Create a download token if none exists
          await createDownloadToken(donationData[0].stripe_session_id);
        }
      }
    } catch (err) {
      console.error('Error checking purchase status:', err);
    }
  };

  const createDownloadToken = async (sessionId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      const functionUrl = `${supabaseUrl}/functions/v1/create-download-token`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          trackId: contentId,
          email: user?.email
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create download token');
      }
      
      const data = await response.json();
      if (data.success && data.tokenId) {
        setDownloadToken(data.tokenId);
      }
    } catch (err) {
      console.error('Error creating download token:', err);
    }
  };

  const handlePaymentSuccess = async (sessionId: string) => {
    console.log(`🎉 Payment successful for ${title}. Session ID: ${sessionId}`);
    
    setHasPurchased(true);
    
    // Create a download token
    await createDownloadToken(sessionId);
  };

  const handleSecureDownload = async () => {
    if (!hasPurchased || !downloadToken) {
      setError('You need to purchase this audio before downloading');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('processing');
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
      
      // Create download link with the blob
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${artist} - ${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      
      // Complete progress
      setDownloadProgress(100);
      setDownloadStatus('success');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setDownloadStatus('idle');
        setDownloadProgress(0);
        setIsDownloading(false);
      }, 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setError(err instanceof Error ? err.message : 'Download failed. Please try again.');
      setDownloadStatus('error');
      setIsDownloading(false);
    }
  };

  return (
    <div className="secure-download-container">
      {hasPurchased ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
            <div>
              <p className="text-green-800 text-sm font-medium">Purchase Verified</p>
              <p className="text-green-700 text-xs">You have access to download this audio</p>
            </div>
          </div>
          
          <button
            onClick={handleSecureDownload}
            disabled={isDownloading}
            className={`${className} w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none`}
          >
            {downloadStatus === 'processing' ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Downloading... {downloadProgress}%</span>
              </>
            ) : downloadStatus === 'success' ? (
              <>
                <CheckCircle size={16} />
                <span>Download Complete</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download MP3</span>
              </>
            )}
          </button>
          
          {/* Progress Bar */}
          {isDownloading && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
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
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
            <Lock className="text-blue-500 flex-shrink-0" size={16} />
            <div>
              <p className="text-blue-800 text-sm font-medium">Secure Download</p>
              <p className="text-blue-700 text-xs">Purchase to download this audio file</p>
            </div>
          </div>
          
          <PaymentButton
            amount={price}
            description={`Download "${title}" by ${artist}`}
            metadata={{
              type: 'audio_download',
              contentId, // Changed from audioUrl to contentId
              title,
              artist,
              language,
              requestId: requestIdRef.current
            }}
            className={`${className} w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2`}
            onSuccess={handlePaymentSuccess}
          >
            <CreditCard size={16} />
            <span>${price.toFixed(2)} - Purchase & Download</span>
          </PaymentButton>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {/* File Info */}
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <span>MP3 • High Quality • {artist}</span>
        </div>
      </div>
    </div>
  );
};

export default SecureDownloadButton;