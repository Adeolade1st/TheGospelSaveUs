import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Heart, ArrowLeft } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // Verify the session with your backend
      fetch(`/api/verify-session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSessionData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error verifying session:', err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
            Thank You for Your Donation!
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your generous contribution helps us reach more souls with God's transforming word. 
            You will receive a confirmation email shortly.
          </p>

          {sessionData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Donation Details</h3>
              <p className="text-sm text-gray-600">
                Amount: ${(sessionData.amount_total / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Session ID: {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <Heart size={20} />
              <span className="font-medium">God bless you!</span>
            </div>
            
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