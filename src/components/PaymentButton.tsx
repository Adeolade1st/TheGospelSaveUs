import React, { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
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
      setError(err instanceof Error ? err.message : 'Payment failed');
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
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;