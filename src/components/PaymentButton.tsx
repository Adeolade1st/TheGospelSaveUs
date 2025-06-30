import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, AlertCircle, RefreshCw, Clock, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { createCheckoutSession, redirectToCheckout, validateStripeConfiguration } from '../lib/stripe';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
  onClick?: () => void;
  maxRetries?: number;
  timeoutMs?: number;
  disabled?: boolean;
}

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  isTimedOut: boolean;
  lastAttemptTime: number | null;
  phase: 'idle' | 'validating' | 'creating-session' | 'redirecting' | 'success' | 'error';
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {},
  onClick,
  maxRetries = 2,
  timeoutMs = 10000, // Reduced to 10 seconds for faster feedback
  disabled = false
}) => {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    isTimedOut: false,
    lastAttemptTime: null,
    phase: 'idle'
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const isComponentMounted = useRef(true);
  const lastClickTime = useRef<number>(0);

  useEffect(() => {
    isComponentMounted.current = true;
    
    // Validate Stripe configuration on component mount
    const configValidation = validateStripeConfiguration();
    if (!configValidation.isValid) {
      setState(prev => ({
        ...prev,
        error: 'Payment system configuration error. Please contact support.',
        phase: 'error'
      }));
    }

    return () => {
      isComponentMounted.current = false;
      cleanup();
    };
  }, []);

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

  const logPaymentEvent = useCallback((event: string, details: any = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      amount,
      description: description.substring(0, 50),
      retryCount: state.retryCount,
      phase: state.phase,
      sessionId: crypto.randomUUID().substring(0, 8),
      ...details
    };
    
    console.log('[PaymentButton]', logData);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'payment_button_action', {
        event_category: 'payment',
        event_label: event,
        value: amount,
        custom_parameters: details
      });
    }
  }, [amount, description, state.retryCount, state.phase]);

  const updateState = useCallback((updates: Partial<PaymentState>) => {
    if (!isComponentMounted.current) return;
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Log state changes for debugging
      if (updates.phase && updates.phase !== prev.phase) {
        logPaymentEvent('phase_change', {
          from: prev.phase,
          to: updates.phase,
          isLoading: newState.isLoading
        });
      }
      
      return newState;
    });
  }, [logPaymentEvent]);

  const resetState = useCallback(() => {
    cleanup();
    updateState({
      isLoading: false,
      error: null,
      retryCount: 0,
      isTimedOut: false,
      lastAttemptTime: null,
      phase: 'idle'
    });
  }, [cleanup, updateState]);

  const validatePaymentData = useCallback((): { isValid: boolean; error?: string } => {
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

    if (!description || description.trim().length === 0) {
      return {
        isValid: false,
        error: 'Payment description is required.'
      };
    }

    return { isValid: true };
  }, [amount, description]);

  const attemptPayment = useCallback(async (): Promise<void> => {
    // Create new abort controller for this attempt
    abortControllerRef.current = new AbortController();
    
    updateState({ phase: 'validating' });
    
    // Validate payment data
    const validation = validatePaymentData();
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    updateState({ phase: 'creating-session' });
    
    try {
      // Create checkout session with timeout
      const session = await createCheckoutSession({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description,
        metadata: {
          ...metadata,
          ministry: 'God Will Provide Outreach Ministry',
          type: amount >= 100 ? 'monthly_donation' : 'one_time_donation',
          attempt: (state.retryCount + 1).toString(),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent.substring(0, 100)
        }
      }, {
        timeout: timeoutMs - 2000, // Leave 2 seconds for redirect
        retryCount: state.retryCount
      });

      if (!session || !session.id || !session.url) {
        throw new Error('Invalid session response from payment service');
      }

      logPaymentEvent('session_created', {
        sessionId: session.id,
        mode: session.mode || 'payment'
      });

      updateState({ phase: 'redirecting' });

      // Small delay to show redirecting state
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to Stripe Checkout
      await redirectToCheckout(session.id);
      
      // If we reach here, redirect was successful
      updateState({ phase: 'success' });
      logPaymentEvent('redirect_success', { sessionId: session.id });

    } catch (error) {
      cleanup();
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('timed out')) {
          throw new Error('Payment request timed out. Please check your connection and try again.');
        }
        
        // Handle specific error types
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        if (error.message.includes('configuration')) {
          throw new Error('Payment system configuration error. Please contact support.');
        }
        
        throw error;
      }
      
      throw new Error('An unexpected error occurred during payment processing.');
    }
  }, [amount, description, metadata, state.retryCount, timeoutMs, validatePaymentData, cleanup, updateState, logPaymentEvent]);

  const handlePayment = useCallback(async () => {
    const now = Date.now();
    
    // Prevent rapid successive clicks (debounce)
    if (now - lastClickTime.current < 1000) {
      logPaymentEvent('rapid_click_prevented', { timeSinceLastClick: now - lastClickTime.current });
      return;
    }
    lastClickTime.current = now;

    // Prevent multiple simultaneous requests
    if (state.isLoading) {
      logPaymentEvent('concurrent_click_prevented', { currentPhase: state.phase });
      return;
    }

    // Check if button is disabled
    if (disabled) {
      logPaymentEvent('disabled_click_prevented');
      return;
    }

    updateState({
      isLoading: true,
      error: null,
      isTimedOut: false,
      lastAttemptTime: now,
      phase: 'validating'
    });

    logPaymentEvent('payment_initiated', {
      amount,
      description: description.substring(0, 50),
      retryCount: state.retryCount,
      userAgent: navigator.userAgent.substring(0, 100)
    });

    try {
      await attemptPayment();
      
      // Call optional onClick handler if payment setup succeeds
      onClick?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      logPaymentEvent('payment_failed', {
        error: errorMessage,
        retryCount: state.retryCount,
        willRetry: state.retryCount < maxRetries
      });

      if (state.retryCount < maxRetries && !errorMessage.includes('configuration')) {
        // Automatic retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 3000);
        
        updateState({
          retryCount: state.retryCount + 1,
          error: `${errorMessage} Retrying in ${Math.ceil(retryDelay / 1000)} seconds...`,
          phase: 'error'
        });

        setTimeout(() => {
          if (isComponentMounted.current && state.retryCount < maxRetries) {
            handlePayment();
          }
        }, retryDelay);
      } else {
        // Max retries reached or configuration error
        updateState({
          isLoading: false,
          error: errorMessage,
          isTimedOut: errorMessage.includes('timed out'),
          phase: 'error'
        });
      }
    }
  }, [state.isLoading, state.retryCount, disabled, amount, description, maxRetries, updateState, logPaymentEvent, attemptPayment, onClick]);

  const handleRetry = useCallback(() => {
    logPaymentEvent('manual_retry_initiated');
    resetState();
    setTimeout(() => handlePayment(), 100); // Small delay to ensure state is reset
  }, [logPaymentEvent, resetState, handlePayment]);

  const handleDismiss = useCallback(() => {
    logPaymentEvent('error_dismissed');
    resetState();
  }, [logPaymentEvent, resetState]);

  const getPhaseMessage = () => {
    switch (state.phase) {
      case 'validating':
        return 'Validating payment...';
      case 'creating-session':
        return 'Setting up secure payment...';
      case 'redirecting':
        return 'Redirecting to payment...';
      case 'success':
        return 'Redirecting...';
      default:
        return state.retryCount > 0 
          ? `Retrying... (${state.retryCount}/${maxRetries})`
          : 'Processing...';
    }
  };

  const getButtonContent = () => {
    if (state.isLoading) {
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>{getPhaseMessage()}</span>
        </>
      );
    }

    if (state.phase === 'success') {
      return (
        <>
          <CheckCircle size={20} />
          <span>Redirecting...</span>
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

  const getErrorIcon = () => {
    if (state.isTimedOut) return <Clock size={16} />;
    if (state.error?.includes('network') || state.error?.includes('connection')) return <WifiOff size={16} />;
    return <AlertCircle size={16} />;
  };

  const isDisabled = state.isLoading || disabled;
  const hasError = !!state.error && state.phase === 'error';
  const canRetry = hasError && !state.isLoading && state.retryCount < maxRetries;

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
        data-phase={state.phase}
        data-loading={state.isLoading}
      >
        {getButtonContent()}
        
        {/* Loading indicator */}
        {state.isLoading && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>
      
      {/* Progress indicator for loading states */}
      {state.isLoading && (
        <div className="mt-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Wifi className="animate-pulse" size={14} />
            <span>{getPhaseMessage()}</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ 
                width: state.phase === 'validating' ? '25%' : 
                       state.phase === 'creating-session' ? '60%' : 
                       state.phase === 'redirecting' ? '90%' : '100%'
              }}
            />
          </div>
        </div>
      )}
      
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
                
                <button
                  onClick={handleDismiss}
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
                    : 'If this problem persists, please contact support.'
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
    </div>
  );
};

export default PaymentButton;