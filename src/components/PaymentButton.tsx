import React, { useState } from 'react';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { createCheckoutSession, redirectToCheckout } from '../lib/stripe';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {}
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Create checkout session
      const session = await createCheckoutSession({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description,
        metadata: {
          ...metadata,
          ministry: 'God Will Provide Outreach Ministry',
          type: amount >= 100 ? 'monthly_donation' : 'one_time_donation'
        }
      });

      // Redirect to Stripe Checkout
      await redirectToCheckout(session.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};

export default PaymentButton;