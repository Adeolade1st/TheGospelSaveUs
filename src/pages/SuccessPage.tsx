import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Heart, ArrowLeft, Loader2, AlertCircle, Download } from 'lucide-react';
import DownloadManager from '../components/DownloadManager';

interface SessionData {
  id: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  payment_status: string;
  status: string;
  metadata: Record<string, string>;
  created: number;
  line_items?: Array<{
    description: string;
    amount_total: number;
    currency: string;
    quantity: number;
  }>;
}

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadManager, setShowDownloadManager] = useState(false);

  useEffect(() => {
    if (sessionId) {
      verifySession(sessionId);
    } else {
      setError('No session ID provided');
      setIsLoading(false);
    }
  }, [sessionId]);

  const verifySession = async (sessionId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
      const functionUrl = `${baseUrl}/functions/v1/verify-session/${sessionId}`;

      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to verify session (${response.status})`);
      }

      const data = await response.json();
      setSessionData(data);
      
      // Check if this is an audio download purchase
      if (data.metadata?.type === 'audio_download') {
        setShowDownloadManager(true);
      }
    } catch (err) {
      console.error('Error verifying session:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify payment session');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={48} />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Verification Failed
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error}
            </p>

            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeft size={16} />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Purchase!
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {showDownloadManager 
              ? 'Your purchase was successful. You can now download your audio file.'
              : 'Your generous contribution helps us reach more souls with God\'s transforming word. You will receive a confirmation email shortly.'}
          </p>

          {sessionData && !showDownloadManager && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Payment Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(sessionData.amount_total, sessionData.currency)}
                  </span>
                </div>
                
                {sessionData.customer_email && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900 text-sm">
                      {sessionData.customer_email}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sessionData.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sessionData.payment_status === 'paid' ? 'Completed' : 'Processing'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {formatDate(sessionData.created)}
                  </span>
                </div>

                {sessionData.metadata?.type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900 text-sm capitalize">
                      {sessionData.metadata.type.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Transaction ID: {sessionData.id}
                </p>
              </div>
            </div>
          )}

          {showDownloadManager && sessionData ? (
            <div className="mb-6">
              <DownloadManager
                trackId={sessionData.metadata?.audioUrl || ''}
                trackTitle={sessionData.metadata?.title || 'Audio Track'}
                artist={sessionData.metadata?.artist || 'Artist'}
                email={sessionData.customer_email || ''}
                sessionId={sessionData.id}
                onDownloadComplete={() => {
                  console.log('Download completed');
                }}
              />
            </div>
          ) : null}

          <div className="space-y-4">
            {!showDownloadManager && (
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <Heart size={20} />
                <span className="font-medium">God bless you!</span>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-4">
              {showDownloadManager 
                ? 'Thank you for supporting our ministry. Enjoy your audio content.'
                : 'Your donation supports our multilingual ministry reaching souls across Nigeria and beyond.'}
            </p>
            
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft size={16} />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;