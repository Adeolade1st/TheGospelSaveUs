import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, AlertCircle, RefreshCw, Clock, Wifi, WifiOff, CheckCircle } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  description: string;
  className?: string;
  children: React.ReactNode;
  metadata?: Record<string, string>;
  onClick?: () => void;
  onSuccess?: (sessionId: string) => void;
  disabled?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  className = '',
  children,
  metadata = {},
  onClick,
  onSuccess,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'validating' | 'creating' | 'redirecting' | 'success' | 'error'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Check for returning from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session_id = urlParams.get('session_id');
    
    if (session_id) {
      setSessionId(session_id);
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess(session_id);
      }
    }
  }, [onSuccess]);

  const handlePayment = useCallback(async () => {
    if (isLoading || disabled) {
      console.log('🚫 Payment blocked - already loading or disabled');
      return;
    }

    // Generate unique request ID for tracking
    requestIdRef.current = crypto.randomUUID().substring(0, 8);
    const requestId = requestIdRef.current;

    console.log(`🚀 [${requestId}] Payment initiated:`, { 
      amount, 
      description: description.substring(0, 50),
      timestamp: new Date().toISOString()
    });

    // Reset state
    setIsLoading(true);
    setError(null);
    setPhase('validating');

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      // 1. Validate environment
      console.log(`🔍 [${requestId}] Validating environment...`);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }
      if (!supabaseKey) {
        throw new Error('VITE_SUPABASE_ANON_KEY not configured');
      }

      console.log(`✅ [${requestId}] Environment validated`);

      // 2. Validate inputs
      if (!amount || amount <= 0) {
        throw new Error(`Invalid amount: ${amount}`);
      }
      if (!description || description.trim().length === 0) {
        throw new Error('Description is required');
      }

      console.log(`✅ [${requestId}] Input validation passed`);

      setPhase('creating');

      // 3. Prepare request
      const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
      const requestData = {
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description,
        metadata: {
          ...metadata,
          requestId,
          clientTimestamp: new Date().toISOString(),
          userAgent: navigator.userAgent.substring(0, 100)
        }
      };

      console.log(`📡 [${requestId}] Making request to:`, functionUrl);
      console.log(`📦 [${requestId}] Request payload:`, {
        ...requestData,
        metadata: { ...requestData.metadata, userAgent: '[truncated]' }
      });

      // 4. Make API call with timeout
      const startTime = Date.now();
      const timeoutMs = 15000; // 15 second timeout

      const timeoutId = setTimeout(() => {
        console.warn(`⏰ [${requestId}] Request timeout after ${timeoutMs}ms`);
        abortControllerRef.current?.abort();
      }, timeoutMs);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'X-Request-ID': requestId,
        },
        body: JSON.stringify(requestData),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      console.log(`📨 [${requestId}] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(response.headers.entries())
      });

      // 5. Handle response
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.error(`❌ [${requestId}] Error response body:`, errorData);
          if (errorData) {
            const parsed = JSON.parse(errorData);
            errorMessage = parsed.error || errorMessage;
          }
        } catch (parseError) {
          console.warn(`⚠️ [${requestId}] Could not parse error response`);
        }
        throw new Error(errorMessage);
      }

      // 6. Parse session data
      const responseText = await response.text();
      console.log(`📄 [${requestId}] Raw response:`, responseText);

      if (!responseText.trim()) {
        throw new Error('Empty response from payment service');
      }

      let session;
      try {
        session = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ [${requestId}] JSON parse error:`, parseError);
        throw new Error('Invalid response format from payment service');
      }

      console.log(`✅ [${requestId}] Session parsed:`, {
        id: session.id,
        hasUrl: !!session.url,
        mode: session.mode,
        expiresAt: session.expiresAt
      });

      // 7. Validate session
      if (!session || !session.id) {
        console.error(`❌ [${requestId}] Invalid session - missing ID:`, session);
        throw new Error('Invalid session response - missing session ID');
      }

      if (!session.url) {
        console.error(`❌ [${requestId}] Invalid session - missing URL:`, session);
        throw new Error('Invalid session response - missing checkout URL');
      }

      // 8. Validate URL format
      try {
        new URL(session.url);
      } catch (urlError) {
        console.error(`❌ [${requestId}] Invalid URL format:`, session.url);
        throw new Error('Invalid checkout URL received');
      }

      setPhase('redirecting');
      console.log(`🔄 [${requestId}] Initiating redirect to:`, session.url);

      // 9. Add small delay to show redirecting state
      await new Promise(resolve => setTimeout(resolve, 500));

      // 10. Perform redirect
      console.log(`🌐 [${requestId}] Redirecting now...`);
      window.location.href = session.url;
      
      // 11. Mark as success (this may not execute due to redirect)
      setPhase('success');
      console.log(`✅ [${requestId}] Redirect initiated successfully`);
      
      // Store session ID for later verification
      setSessionId(session.id);
      
      onClick?.();

    } catch (error: any) {
      const errorTime = Date.now();
      console.error(`💥 [${requestId}] Payment error at ${new Date(errorTime).toISOString()}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      let userMessage = 'Payment failed. Please try again.';
      
      if (error.name === 'AbortError') {
        userMessage = 'Payment request timed out. Please check your connection and try again.';
        console.warn(`⏰ [${requestId}] Request was aborted (likely timeout)`);
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
        console.warn(`🌐 [${requestId}] Network-related error detected`);
      } else if (error.message.includes('not configured')) {
        userMessage = 'Payment service configuration error. Please contact support.';
        console.error(`⚙️ [${requestId}] Configuration error detected`);
      } else if (error.message.includes('Invalid')) {
        userMessage = error.message;
        console.warn(`⚠️ [${requestId}] Validation error`);
      }
      
      setError(userMessage);
      setPhase('error');
    } finally {
      setIsLoading(false);
      console.log(`🏁 [${requestId}] Payment process completed`);
    }
  }, [amount, description, metadata, onClick, isLoading, disabled, onSuccess]);

  const handleRetry = () => {
    console.log('🔄 Retrying payment...');
    setError(null);
    setPhase('idle');
    handlePayment();
  };

  const getButtonContent = () => {
    if (isLoading) {
      const messages = {
        validating: 'Validating...',
        creating: 'Creating payment...',
        redirecting: 'Redirecting to checkout...',
        success: 'Redirecting...'
      };
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>{messages[phase as keyof typeof messages] || 'Processing...'}</span>
        </>
      );
    }

    if (phase === 'success') {
      return (
        <>
          <CheckCircle size={20} />
          <span>Redirecting...</span>
        </>
      );
    }

    return children;
  };

  const getPhaseIndicator = () => {
    if (!isLoading && phase === 'idle') return null;

    const phases = [
      { key: 'validating', label: 'Validating', active: phase === 'validating' },
      { key: 'creating', label: 'Creating Session', active: phase === 'creating' },
      { key: 'redirecting', label: 'Redirecting', active: phase === 'redirecting' },
      { key: 'success', label: 'Success', active: phase === 'success' }
    ];

    return (
      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
        {phases.map((p, index) => (
          <React.Fragment key={p.key}>
            <div className={`flex items-center space-x-1 ${p.active ? 'text-blue-600 font-medium' : ''}`}>
              {p.active && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
              <span>{p.label}</span>
            </div>
            {index < phases.length - 1 && <span>→</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={isLoading || disabled}
        className={`${className} ${
          isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''
        } flex items-center justify-center space-x-2 transition-all duration-200 relative`}
        data-testid="payment-button"
        data-phase={phase}
        data-request-id={requestIdRef.current}
      >
        {getButtonContent()}
      </button>
      
      {/* Phase indicator */}
      {getPhaseIndicator()}
      
      {/* Error display */}
      {error && (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium mb-2">Payment Error</p>
              <p className="text-red-600 text-sm mb-3">{error}</p>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={() => setError(null)}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  <span>Dismiss</span>
                </button>
              </div>
              
              {requestIdRef.current && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-gray-500">
                    Request ID: {requestIdRef.current} | Check browser console for detailed logs
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentButton;