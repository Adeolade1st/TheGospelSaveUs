import React from 'react';
import StripeTestModeChecker from '../components/StripeTestModeChecker';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const StripeTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <StripeTestModeChecker />

      {/* Additional Information */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Important Notes</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Test Mode:</strong> In test mode, no real money is processed. All transactions are simulated.
            </p>
            <p>
              <strong>Live Mode:</strong> In live mode, real money is processed. Only use live mode when ready for production.
            </p>
            <p>
              <strong>Switching Modes:</strong> You can toggle between test and live mode in your Stripe Dashboard.
            </p>
            <p>
              <strong>Environment Variables:</strong> Make sure your .env file contains test keys (pk_test_ and sk_test_) for development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;