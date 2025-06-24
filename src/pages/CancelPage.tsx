import React from 'react';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-white" size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Donation Cancelled
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your donation was cancelled. No charges were made to your account. 
            You can try again anytime to support our ministry.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/#donate')}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Return to Home</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Need help?</strong><br />
              If you experienced any issues, please contact us at Jones8874@bellsouth.net or call (404) 709-9620.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;