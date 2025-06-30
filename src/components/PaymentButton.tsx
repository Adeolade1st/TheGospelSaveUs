import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { createCheckoutSession, redirectToCheckout } from '../lib/stripe';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
  onClick?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {},
  onClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handlePayment = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    cleanup();

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Set timeout for 15 seconds
    timeoutRef.current = setTimeout(() => {
      cleanup();
      setIsLoading(false);
      setError('Request timed out. Please try again.');
    }, 15000);

    try {
      const session = await createCheckoutSession({
        amount: amount * 100,
        currency: 'usd',
        description,
        metadata
      });

      if (!session?.id || !session?.url) {
        throw new Error('Invalid session response');
      }

      clearTimeout(timeoutRef.current);
      await redirectToCheckout(session.id);
      onClick?.();
      
    } catch (err) {
      cleanup();
      setIsLoading(false);
      
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Payment processing failed. Please try again.');
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    handlePayment();
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center space-x-2`}
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
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 inline-flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
              >
                <RefreshCw size={12} />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentButton;