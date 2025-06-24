import React, { useState } from 'react';
import { Loader2, CreditCard, Shield } from 'lucide-react';

interface StripeCheckoutProps {
  amount: number;
  title: string;
  description: string;
  mode?: 'payment' | 'subscription';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  title,
  description,
  mode = 'payment',
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      // In production, replace with actual Stripe checkout session creation
      const checkoutUrl = mode === 'subscription' 
        ? `https://buy.stripe.com/test_subscription_${amount}`
        : `https://buy.stripe.com/test_payment_${amount}`;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to Stripe checkout
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      
      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      onError?.('Failed to initiate checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-white" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="mb-6">
        <div className="text-center">
          <span className="text-4xl font-bold text-gray-900">
            ${amount}
            {mode === 'subscription' && <span className="text-lg text-gray-500">/month</span>}
          </span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard size={20} />
            <span>Secure Checkout</span>
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Shield size={16} />
        <span>Secured by Stripe</span>
      </div>
    </div>
  );
};

export default StripeCheckout;