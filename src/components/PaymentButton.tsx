import React, { useState } from 'react';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { createPaymentIntent } from '../lib/stripe';
import StripePaymentModal from './StripePaymentModal';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
  customerEmail?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {},
  customerEmail
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate environment variables
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error('Supabase URL is not configured. Please check your environment variables.');
      }

      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Stripe publishable key is not configured. Please check your environment variables.');
      }

      // Create payment intent
      const result = await createPaymentIntent({
        amount,
        currency: 'usd',
        description,
        customer_email: customerEmail,
        metadata: {
          ...metadata,
          ministry: 'God Will Provide Outreach Ministry',
          timestamp: new Date().toISOString()
        }
      });

      if (result.client_secret) {
        setClientSecret(result.client_secret);
        setIsModalOpen(true);
      } else {
        throw new Error('No client secret received from payment service');
      }

      if (result.requires_action && result.redirect_url) {
        // Redirect for 3D Secure authentication
        window.location.href = result.redirect_url;
        return;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setIsModalOpen(false);
    // Redirect to success page after a short delay
    setTimeout(() => {
      window.location.href = '/payment-success';
    }, 1000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientSecret(null);
  };

  if (paymentSuccess) {
    return (
      <div className={`${className} flex items-center justify-center space-x-2 bg-green-100 text-green-800 border border-green-300`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Payment Successful!</span>
      </div>
    );
  }

  return (
    <>
      <div>
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`${className} ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          } flex items-center justify-center space-x-2`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard size={20} />
              {children}
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stripe Payment Modal */}
      {isModalOpen && clientSecret && (
        <StripePaymentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          clientSecret={clientSecret}
          amount={amount}
          description={description}
          customerEmail={customerEmail}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </>
  );
};

export default PaymentButton;