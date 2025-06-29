import React, { useState } from 'react';
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { paymentClient, PaymentRequest, PaymentResponse } from '../lib/paymentClient';

interface PaymentProcessorProps {
  amount: number;
  description: string;
  metadata?: Record<string, string>;
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: string) => void;
  className?: string;
  children: React.ReactNode;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  description,
  metadata = {},
  onSuccess,
  onError,
  className = '',
  children
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
  });

  const handlePaymentClick = () => {
    setError(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const paymentRequest: PaymentRequest = {
        amount,
        currency: 'USD',
        payment_method: 'card',
        customer: {
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone || undefined,
        },
        metadata: {
          description,
          ...metadata,
        },
        return_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/#donate`,
      };

      // Validate request
      const validation = paymentClient.validateRequest(paymentRequest);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Process payment
      const response = await paymentClient.processPayment(paymentRequest);

      if (response.success) {
        onSuccess?.(response);
        setShowForm(false);
        
        // If there's a redirect URL, redirect to it
        if (response.redirect_url) {
          window.location.href = response.redirect_url;
        }
      } else {
        throw new Error(response.error || 'Payment failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setError(null);
    setCustomerInfo({ email: '', name: '', phone: '' });
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleCancel}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Donation</h2>
              <p className="text-gray-600">
                {paymentClient.formatAmount(amount, 'USD')} - {description}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your full name"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your email address"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your phone number"
                  disabled={isProcessing}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>Donate Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure payment processing powered by industry-leading encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handlePaymentClick}
      disabled={isProcessing}
      className={`${className} flex items-center justify-center space-x-2`}
    >
      <CreditCard size={20} />
      {children}
    </button>
  );
};

export default PaymentProcessor;