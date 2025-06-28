import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, CreditCard } from 'lucide-react';
import { verifyStripeTestMode, getTestCardNumbers } from '../utils/stripeTestVerification';

const StripeTestModeChecker: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const testStatus = verifyStripeTestMode();
  const testCards = getTestCardNumbers();

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="text-green-500" size={20} />;
    if (status === false) return <XCircle className="text-red-500" size={20} />;
    return <AlertTriangle className="text-yellow-500" size={20} />;
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === true) return 'border-green-200 bg-green-50';
    if (status === false) return 'border-red-200 bg-red-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="text-white" size={24} />
              <h2 className="text-xl font-bold text-white">Stripe Test Mode Verification</h2>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-100 hover:text-white transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand Details'}
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-2 ${getStatusColor(testStatus.publishableKeyTestMode)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(testStatus.publishableKeyTestMode)}
                <div>
                  <h3 className="font-semibold">Publishable Key</h3>
                  <p className="text-sm text-gray-600">
                    {testStatus.publishableKeyTestMode ? 'Test Mode ✓' : 'Live Mode ⚠️'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${getStatusColor(testStatus.secretKeyTestMode)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(testStatus.secretKeyTestMode)}
                <div>
                  <h3 className="font-semibold">Secret Key</h3>
                  <p className="text-sm text-gray-600">Requires manual verification</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Configuration */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Info size={16} />
              <span>Current Configuration</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Publishable Key:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">
                  {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 
                    `${import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 
                    'Not configured'
                  }
                </code>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  testStatus.publishableKeyTestMode ? 
                    'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                }`}>
                  {testStatus.publishableKeyTestMode ? 'TEST' : 'LIVE'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="font-semibold">Verification Checklist:</h3>
            <div className="space-y-2">
              {testStatus.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-gray-400 mt-1">•</span>
                  <span className={
                    rec.includes('✅') ? 'text-green-700' :
                    rec.includes('❌') ? 'text-red-700' :
                    rec.includes('⚠️') ? 'text-yellow-700' :
                    'text-gray-700'
                  }>
                    {rec}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Cards Section */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Test Card Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testCards).map(([type, number]) => (
                  <div key={type} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                      <code className="text-sm bg-white px-2 py-1 rounded">{number}</code>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Use any future expiry date (e.g., 12/34) and any 3-digit CVC for testing.
              </p>
            </div>
          )}

          {/* Manual Verification Steps */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Manual Verification Steps</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">1. Check Stripe Dashboard</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Visit <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline">dashboard.stripe.com</a></li>
                    <li>• Look for "TEST" indicator in the top-right corner</li>
                    <li>• Verify you're viewing test data, not live transactions</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">2. Test Payment Flow</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Try making a donation with test card 4242 4242 4242 4242</li>
                    <li>• Use expiry 12/34 and CVC 123</li>
                    <li>• Payment should succeed and redirect to success page</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">3. Verify Webhook Configuration</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Go to Developers → Webhooks in Stripe Dashboard</li>
                    <li>• Ensure webhook URL points to your test environment</li>
                    <li>• Check that webhook secret starts with "whsec_"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeTestModeChecker;