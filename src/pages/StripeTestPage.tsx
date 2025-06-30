import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, RefreshCw, Play, Terminal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateStripeConfiguration } from '../lib/stripe';
import { debugPayment, testPaymentButton, checkSupabaseLogs } from '../utils/paymentDebug';

const StripeTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTest, setActiveTest] = useState<string>('');

  const runFullDiagnostics = async () => {
    setIsLoading(true);
    setActiveTest('diagnostics');
    console.clear();
    console.log('🚀 Starting comprehensive payment diagnostics...');
    
    // Run debug
    const debugResult = await debugPayment();
    
    // Test configuration
    const config = validateStripeConfiguration();
    
    // Test payment button
    const buttonTest = await testPaymentButton(25);
    
    setTestResults({
      config,
      debugResult,
      buttonTest,
      timestamp: new Date().toISOString()
    });
    
    setIsLoading(false);
    setActiveTest('');
  };

  const runQuickTest = async () => {
    setIsLoading(true);
    setActiveTest('quick');
    console.log('⚡ Running quick payment test...');
    
    const result = await testPaymentButton(10);
    console.log(result ? '✅ Quick test passed' : '❌ Quick test failed');
    
    setIsLoading(false);
    setActiveTest('');
  };

  const showLogInstructions = () => {
    setActiveTest('logs');
    checkSupabaseLogs();
    setTimeout(() => setActiveTest(''), 100);
  };

  useEffect(() => {
    // Auto-run diagnostics on page load
    runFullDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Payment System Diagnostics</h1>
                <p className="text-blue-100 text-sm">Comprehensive testing and debugging tools</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={runQuickTest}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <Zap className={isLoading && activeTest === 'quick' ? 'animate-spin' : ''} size={16} />
                  <span>Quick Test</span>
                </button>
                <button
                  onClick={runFullDiagnostics}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={isLoading && activeTest === 'diagnostics' ? 'animate-spin' : ''} size={16} />
                  <span>Full Diagnostics</span>
                </button>
                <button
                  onClick={showLogInstructions}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Terminal size={16} />
                  <span>Check Logs</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Results */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                <p className="text-gray-600">
                  {activeTest === 'quick' ? 'Running quick test...' : 'Running full diagnostics...'}
                </p>
                <p className="text-sm text-gray-500 mt-2">Check browser console for detailed logs</p>
              </div>
            ) : testResults ? (
              <>
                {/* Configuration Test */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {testResults.config.isValid ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <XCircle className="text-red-500" size={24} />
                    )}
                    <h3 className="text-lg font-semibold">Environment Configuration</h3>
                  </div>
                  
                  {testResults.config.isValid ? (
                    <p className="text-green-700">✅ All environment variables are configured correctly</p>
                  ) : (
                    <div>
                      <p className="text-red-700 mb-3">❌ Configuration issues detected:</p>
                      <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                        {testResults.config.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Payment Button Test */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    {testResults.buttonTest ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <XCircle className="text-red-500" size={24} />
                    )}
                    <h3 className="text-lg font-semibold">Payment Function Test</h3>
                  </div>
                  
                  {testResults.buttonTest ? (
                    <div>
                      <p className="text-green-700 mb-2">✅ Payment function is working correctly</p>
                      <p className="text-sm text-gray-600">Successfully created test checkout session</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-700 mb-2">❌ Payment function test failed</p>
                      <p className="text-sm text-gray-600">Check console logs and Supabase function status</p>
                    </div>
                  )}
                </div>

                {/* Environment Variables Display */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Environment Status</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'VITE_STRIPE_PUBLISHABLE_KEY', value: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY },
                      { key: 'VITE_SUPABASE_URL', value: import.meta.env.VITE_SUPABASE_URL },
                      { key: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env.VITE_SUPABASE_ANON_KEY }
                    ].map(({ key, value }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm">{key}:</span>
                        <div className="flex items-center space-x-2">
                          {value ? (
                            <>
                              <CheckCircle className="text-green-500" size={16} />
                              <span className="text-green-600 text-sm font-medium">SET</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500" size={16} />
                              <span className="text-red-600 text-sm font-medium">MISSING</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <p className="text-gray-600">Click "Full Diagnostics" to test the payment system</p>
              </div>
            )}
          </div>

          {/* Instructions and Tools */}
          <div className="space-y-6">
            {/* Live Test */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Play className="text-blue-600" size={20} />
                <span>Live Payment Test</span>
              </h3>
              <p className="text-gray-600 mb-4">Test the actual payment flow with a small amount:</p>
              <Link
                to="/#donate"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Go to Donation Section</span>
              </Link>
            </div>

            {/* Debugging Instructions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Debugging Steps</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium">Check Browser Console</p>
                    <p className="text-gray-600">Open DevTools (F12) and look for payment logs with request IDs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium">Test Payment Button</p>
                    <p className="text-gray-600">Click a payment button and watch console for detailed logs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium">Check Network Tab</p>
                    <p className="text-gray-600">Look for failed requests to create-checkout-session</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <p className="font-medium">Verify Supabase Functions</p>
                    <p className="text-gray-600">Run: supabase functions list</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Common Issues</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">Functions Not Deployed</p>
                  <p className="text-red-700">Run: supabase functions deploy create-checkout-session</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800">Environment Variables Missing</p>
                  <p className="text-yellow-700">Check your .env file and restart dev server</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">CORS Issues</p>
                  <p className="text-blue-700">Verify function CORS headers are properly configured</p>
                </div>
              </div>
            </div>

            {/* Test Results Summary */}
            {testResults && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Test Summary</h3>
                <div className="text-sm text-gray-600">
                  <p>Last run: {new Date(testResults.timestamp).toLocaleString()}</p>
                  <p className="mt-2">
                    Status: {testResults.config.isValid && testResults.buttonTest ? (
                      <span className="text-green-600 font-medium">✅ All systems operational</span>
                    ) : (
                      <span className="text-red-600 font-medium">❌ Issues detected</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;