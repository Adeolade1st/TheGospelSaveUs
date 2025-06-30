import React, { useState, useRef, useEffect } from 'react';
import { Loader2, CreditCard, AlertCircle, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { createCheckoutSession, redirectToCheckout } from '../lib/stripe';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
  onClick?: () => void;
  maxRetries?: number;
  timeoutMs?: number;
}

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  isTimedOut: boolean;
  lastAttemptTime: number | null;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {},
  onClick,
  maxRetries = 3,
  timeoutMs = 30000 // 30 seconds
}) => {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    isTimedOut: false,
    lastAttemptTime: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const logPaymentAttempt = (action: string, details: any = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      amount,
      description,
      retryCount: state.retryCount,
      ...details
    };
    
    console.log('[PaymentButton]', logData);
    
    // Send to analytics service if available
    if (window.gtag) {
      window.gtag('event', 'payment_attempt', {
        event_category: 'payment',
        event_label: action,
        value: amount,
        custom_parameters: details
      });
    }
  };

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      isTimedOut: false,
      lastAttemptTime: null
    });
  };

  const updateState = (updates: Partial<PaymentState>) => {
    if (!isComponentMounted.current) return;
    setState(prev => ({ ...prev, ...updates }));
  };

  const validateEnvironment = (): { isValid: boolean; error?: string } => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      return {
        isValid: false,
        error: 'Payment service configuration error. Please contact support.'
      };
    }

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      return {
        isValid: false,
        error: 'Payment processor not configured. Please contact support.'
      };
    }

    return { isValid: true };
  };

  const validatePaymentData = (): { isValid: boolean; error?: string } => {
    if (!amount || amount <= 0) {
      return {
        isValid: false,
        error: 'Invalid payment amount. Please enter a valid amount.'
      };
    }

    if (amount < 1) {
      return {
        isValid: false,
        error: 'Minimum donation amount is $1.00.'
      };
    }

    if (amount > 999999) {
      return {
        isValid: false,
        error: 'Maximum donation amount is $999,999.00.'
      };
    }

    return { isValid: true };
  };

  const createTimeoutPromise = (ms: number): Promise<never> => {
    return new Promise((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, ms);
    });
  };

  const attemptPayment = async (): Promise<void> => {
    // Create new abort controller for this attempt
    abortControllerRef.current = new AbortController();
    
    const paymentPromise = createCheckoutSession({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      description,
      metadata: {
        ...metadata,
        ministry: 'God Will Provide Outreach Ministry',
        type: amount >= 100 ? 'monthly_donation' : 'one_time_donation',
        attempt: state.retryCount + 1,
        timestamp: new Date().toISOString()
      }
    });

    const timeoutPromise = createTimeoutPromise(timeoutMs);

    try {
      // Race between payment creation and timeout
      const session = await Promise.race([paymentPromise, timeoutPromise]);
      
      // Clear timeout if payment succeeds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      logPaymentAttempt('checkout_session_created', {
        sessionId: session.id,
        success: true
      });

      // Redirect to Stripe Checkout
      await redirectToCheckout(session.id);
      
      // If we reach here, redirect was successful
      logPaymentAttempt('redirect_successful', {
        sessionId: session.id
      });

    } catch (error) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (error instanceof Error) {
        if (error.message === 'TIMEOUT') {
          logPaymentAttempt('payment_timeout', {
            timeoutMs,
            attempt: state.retryCount + 1
          });
          throw new Error('Payment request timed out. Please try again.');
        }
        
        logPaymentAttempt('payment_error', {
          error: error.message,
          attempt: state.retryCount + 1
        });
        throw error;
      }
      
      throw new Error('An unexpected error occurred during payment processing.');
    }
  };

  const handlePayment = async () => {
    // Prevent multiple simultaneous clicks
    if (state.isLoading) {
      logPaymentAttempt('duplicate_click_prevented');
      return;
    }

    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      updateState({ error: envValidation.error });
      logPaymentAttempt('environment_validation_failed', { error: envValidation.error });
      return;
    }

    // Validate payment data
    const dataValidation = validatePaymentData();
    if (!dataValidation.isValid) {
      updateState({ error: dataValidation.error });
      logPaymentAttempt('data_validation_failed', { error: dataValidation.error });
      return;
    }

    updateState({
      isLoading: true,
      error: null,
      isTimedOut: false,
      lastAttemptTime: Date.now()
    });

    logPaymentAttempt('payment_initiated', {
      amount,
      description,
      retryCount: state.retryCount
    });

    try {
      await attemptPayment();
      
      // Call optional onClick handler if payment setup succeeds
      onClick?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      logPaymentAttempt('payment_failed', {
        error: errorMessage,
        retryCount: state.retryCount,
        willRetry: state.retryCount < maxRetries
      });

      if (state.retryCount < maxRetries) {
        // Automatic retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 5000);
        
        updateState({
          retryCount: state.retryCount + 1,
          error: `${errorMessage} Retrying in ${Math.ceil(retryDelay / 1000)} seconds...`
        });

        setTimeout(() => {
          if (isComponentMounted.current) {
            handlePayment();
          }
        }, retryDelay);
      } else {
        // Max retries reached
        updateState({
          isLoading: false,
          error: errorMessage,
          isTimedOut: errorMessage.includes('timed out')
        });
      }
    }
  };

  const handleRetry = () => {
    logPaymentAttempt('manual_retry_initiated');
    resetState();
    handlePayment();
  };

  const handleFallback = () => {
    logPaymentAttempt('fallback_initiated');
    
    // Fallback to direct Stripe checkout page or contact form
    const fallbackUrl = `https://donate.stripe.com/test_fallback?amount=${amount * 100}&description=${encodeURIComponent(description)}`;
    
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    
    updateState({
      error: 'Redirected to alternative payment method. Please complete your donation in the new window.'
    });
  };

  const getErrorIcon = () => {
    if (state.isTimedOut) return <Clock size={16} />;
    if (state.error?.includes('network') || state.error?.includes('connection')) return <WifiOff size={16} />;
    return <AlertCircle size={16} />;
  };

  const getButtonContent = () => {
    if (state.isLoading) {
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>
            {state.retryCount > 0 
              ? `Retrying... (${state.retryCount}/${maxRetries})`
              : 'Processing...'
            }
          </span>
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

  const isDisabled = state.isLoading;
  const hasError = !!state.error;
  const canRetry = hasError && !state.isLoading && state.retryCount < maxRetries;
  const needsFallback = hasError && state.retryCount >= maxRetries;

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={isDisabled}
        className={`${className} ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${hasError ? 'border-red-300' : ''} flex items-center justify-center space-x-2 transition-all duration-200 relative`}
        aria-label={`Make payment of $${amount}`}
        data-testid="payment-button"
      >
        {getButtonContent()}
        
        {/* Connection status indicator */}
        {state.isLoading && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>
      
      {/* Error Display */}
      {hasError && (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-red-500 mt-0.5">
              {getErrorIcon()}
            </div>
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium mb-2">
                Payment Error
              </p>
              <p className="text-red-600 text-sm mb-3">
                {state.error}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {canRetry && (
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw size={12} />
                    <span>Try Again</span>
                  </button>
                )}
                
                {needsFallback && (
                  <button
                    onClick={handleFallback}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    <Wifi size={12} />
                    <span>Alternative Payment</span>
                  </button>
                )}
                
                <button
                  onClick={resetState}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  <span>Dismiss</span>
                </button>
              </div>
              
              {/* Help Text */}
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-600">
                  {state.isTimedOut 
                    ? 'The payment request timed out. Please check your internet connection and try again.'
                    : 'If this problem persists, please contact support or try the alternative payment method.'
                  }
                </p>
                {state.lastAttemptTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last attempt: {new Date(state.lastAttemptTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Feedback */}
      {state.isLoading && state.retryCount === 0 && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            Securing your payment...
          </p>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentButton;