import React, { useEffect } from 'react';
import { CheckCircle, Home, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-white" size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Donation!
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your generous contribution helps us reach more souls with God's transforming word. 
            You will receive a confirmation email shortly with your donation details.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Return to Home</span>
            </button>
            
            <div className="text-sm text-gray-500">
              <p className="flex items-center justify-center space-x-1">
                <Mail size={16} />
                <span>Check your email for receipt</span>
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>What happens next?</strong><br />
              Your donation will directly support our radio airplay costs, helping us reach more listeners with the gospel message through Jango.com's platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;