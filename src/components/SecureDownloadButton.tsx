import React, { useState, useRef } from 'react';
import { Download, Lock, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaymentButton from './PaymentButton';

interface SecureDownloadButtonProps {
  audioUrl: string;
  title: string;
  artist: string;
  price: number;
  language: string;
  className?: string;
}

const SecureDownloadButton: React.FC<SecureDownloadButtonProps> = ({
  audioUrl,
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
  }, [user, audioUrl]);

  const checkPurchaseStatus = async () => {
    try {
      // In a real implementation, you would check against your database
      // to see if the user has already purchased this audio
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('customer_email', user?.email)
        .eq('metadata->>title', title) // Fixed: Changed -> to ->> for JSONB text extraction
        .eq('status', 'completed')
        .limit(1);

      if (error) {
        console.error('Error checking purchase status:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('User has already purchased this audio');
        setHasPurchased(true);
        // In a real implementation, you would also retrieve the download token
        setDownloadToken('sample-token-' + crypto.randomUUID().substring(0, 8));
      }
    } catch (err) {
      console.error('Error checking purchase status:', err);
    }
  };

  const handlePaymentSuccess = async (sessionId: string) => {
    console.log(`🎉 Payment successful for ${title}. Session ID: ${sessionId}`);
    
    // In a real implementation, you would verify the payment server-side
    // and generate a secure download token
    
    setHasPurchased(true);
    setDownloadToken('purchase-token-' + crypto.randomUUID().substring(0, 8));
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
      // In a real implementation, you would validate the download token
      // and track the download against the user's quota
      
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      // Simulate download completion after 2 seconds
      setTimeout(() => {
        clearInterval(progressInterval);
        setDownloadProgress(100);
        
        // Create download link
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `${artist} - ${title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Log download
        logDownload();
        
        setDownloadStatus('success');
        
        // Reset after 3 seconds
        setTimeout(() => {
          setDownloadStatus('idle');
          setDownloadProgress(0);
          setIsDownloading(false);
        }, 3000);
      }, 2000);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed. Please try again.');
      setDownloadStatus('error');
      setIsDownloading(false);
    }
  };

  const logDownload = async () => {
    if (!user) return;
    
    try {
      // In a real implementation, you would log the download to your database
      const { error } = await supabase
        .from('download_logs')
        .insert({
          token_id: downloadToken,
          track_id: audioUrl, // This would be the actual track ID in a real implementation
          email: user.email,
          ip_address: 'client-ip', // This would be captured server-side
          user_agent: navigator.userAgent.substring(0, 255)
        });

      if (error) {
        console.error('Error logging download:', error);
      }
    } catch (err) {
      console.error('Error logging download:', err);
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