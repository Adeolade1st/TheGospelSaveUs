import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Heart, ArrowLeft, Home } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
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

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">What Your Donation Supports</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Creating new spoken word content in Yoruba, Igbo, and Hausa</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Broadcasting on Jango Radio to reach international audiences</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Spreading hope, healing, and purpose through God's word</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <Heart size={20} />
              <span className="font-medium">God bless you!</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Your donation supports our multilingual ministry reaching souls across Nigeria and beyond.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
              >
                <Home size={16} />
                <span>Return Home</span>
              </Link>
              
              <a
                href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-2 border-2 border-red-600 text-red-600 px-6 py-3 rounded-full font-semibold hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.594-.471-3.078-1.343-4.343a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.984 5.984 0 01-.757 2.829 1 1 0 11-1.415-1.414A3.987 3.987 0 0013 12a3.988 3.988 0 00-.172-1.171 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                <span>Listen Now</span>
              </a>
            </div>
          </div>

          {/* Ministry Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              God Will Provide Outreach Ministry
            </p>
            <p className="text-xs text-gray-400">
              Transforming hearts through powerful spoken word in multiple languages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;