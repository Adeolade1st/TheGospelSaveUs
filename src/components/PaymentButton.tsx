import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, AlertCircle, RefreshCw, Clock, Wifi, WifiOff, CheckCircle } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
  onClick?: () => void;
  disabled?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {},
  onClick,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'creating' | 'redirecting' | 'success' | 'error'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePayment = useCallback(async () => {
    if (isLoading || disabled) return;

    console.log('🚀 Payment button clicked:', { amount, description });

    // Reset state
    setIsLoading(true);
    setError(null);
    setPhase('creating');

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Validate environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Payment service not configured. Please contact support.');
      }

      // Validate inputs
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      console.log('✅ Environment validated, creating session...');

      const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
      
      const requestData = {
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📡 Making request to:', functionUrl);
      console.log('📦 Request data:', requestData);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(requestData),
        signal: abortControllerRef.current.signal,
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Payment service error: ${response.status}`);
      }

      const session = await response.json();
      console.log('✅ Session created:', session);

      if (!session.url) {
        throw new Error('Invalid session response');
      }

      setPhase('redirecting');
      console.log('🔄 Redirecting to:', session.url);

      // Redirect to Stripe
      window.location.href = session.url;
      
      setPhase('success');
      onClick?.();

    } catch (error: any) {
      console.error('💥 Payment error:', error);
      
      if (error.name === 'AbortError') {
        setError('Payment request was cancelled');
      } else if (error.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.message || 'Payment failed. Please try again.');
      }
      
      setPhase('error');
    } finally {
      setIsLoading(false);
    }
  }, [amount, description, metadata, onClick, isLoading, disabled]);

  const handleRetry = () => {
    setError(null);
    setPhase('idle');
    handlePayment();
  };

  const getButtonContent = () => {
    if (isLoading) {
      const messages = {
        creating: 'Creating payment...',
        redirecting: 'Redirecting...',
        success: 'Success!'
      };
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>{messages[phase as keyof typeof messages] || 'Processing...'}</span>
        </>
      );
    }

    return (
      <>
        <CreditCard size={20} />
        {children}
      </>
    );
  };

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={isLoading || disabled}
        className={`${className} ${
          isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''
        } flex items-center justify-center space-x-2 transition-all duration-200`}
      >
        {getButtonContent()}
      </button>
      
      {error && (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium mb-2">Payment Error</p>
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
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