import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateStripeConfiguration, testPaymentSetup } from '../lib/stripe';
import { debugPayment } from '../utils/paymentDebug';

const StripeTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    console.log('🧪 Running comprehensive payment tests...');
    
    // Run debug
    await debugPayment();
    
    // Test configuration
    const config = validateStripeConfiguration();
    
    // Test payment setup
    const setupTest = await testPaymentSetup();
    
    setTestResults({
      config,
      setupTest,
      timestamp: new Date().toISOString()
    });
    
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">Payment System Diagnostics</h1>
              <button
                onClick={runTests}
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
                <span>Run Tests</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                <p className="text-gray-600">Running diagnostics...</p>
              </div>
            ) : testResults ? (
              <div className="space-y-6">
                {/* Configuration Test */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    {testResults.config.isValid ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-red-500" size={20} />
                    )}
                    <h3 className="font-semibold">Environment Configuration</h3>
                  </div>
                  
                  {testResults.config.isValid ? (
                    <p className="text-green-700">✅ All environment variables are configured</p>
                  ) : (
                    <div>
                      <p className="text-red-700 mb-2">❌ Missing environment variables:</p>
                      <ul className="list-disc list-inside text-red-600 text-sm">
                        {testResults.config.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Function Test */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    {testResults.setupTest ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-red-500" size={20} />
                    )}
                    <h3 className="font-semibold">Supabase Function Test</h3>
                  </div>
                  
                  {testResults.setupTest ? (
                    <p className="text-green-700">✅ Payment function is responding</p>
                  ) : (
                    <p className="text-red-700">❌ Payment function is not responding</p>
                  )}
                </div>

                {/* Environment Variables Display */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Environment Variables</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>VITE_STRIPE_PUBLISHABLE_KEY:</span>
                      <span className={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'text-green-600' : 'text-red-600'}>
                        {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>VITE_SUPABASE_URL:</span>
                      <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                        {import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>VITE_SUPABASE_ANON_KEY:</span>
                      <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                        {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                  <div className="text-blue-800 text-sm space-y-1">
                    <p>1. Check browser console for detailed logs</p>
                    <p>2. Verify Supabase Edge Functions are deployed</p>
                    <p>3. Test payment button on main page</p>
                    <p>4. Check Supabase function logs if issues persist</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Click "Run Tests" to diagnose payment system</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;