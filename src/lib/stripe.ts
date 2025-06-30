import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('Missing Stripe publishable key. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
}

export const stripePromise = loadStripe(stripePublishableKey || '');

// Enhanced error types for better error handling
export class StripeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StripeConfigError';
  }
}

export class StripeNetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'StripeNetworkError';
  }
}

export class StripeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StripeValidationError';
  }
}

export const createCheckoutSession = async (priceData: {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}, options: {
  timeout?: number;
  retryCount?: number;
} = {}): Promise<{ id: string; url: string; mode?: string }> => {
  const { timeout = 12000, retryCount = 0 } = options; // Reduced timeout to 12 seconds
  const requestId = crypto.randomUUID().substring(0, 8);

  try {
    // Validate configuration first
    const configValidation = validateStripeConfiguration();
    if (!configValidation.isValid) {
      throw new StripeConfigError(configValidation.errors[0] || 'Stripe configuration error');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Validate price data
    if (!priceData.amount || priceData.amount <= 0) {
      throw new StripeValidationError('Invalid amount: must be greater than 0');
    }

    if (priceData.amount > 99999999) { // $999,999.99 in cents
      throw new StripeValidationError('Amount too large: maximum is $999,999.99');
    }

    if (!priceData.description || priceData.description.trim().length === 0) {
      throw new StripeValidationError('Description is required');
    }

    // Ensure the URL is properly formatted
    const baseUrl = supabaseUrl!.endsWith('/') ? supabaseUrl!.slice(0, -1) : supabaseUrl;
    const functionUrl = `${baseUrl}/functions/v1/create-checkout-session`;

    console.log(`[Stripe:${requestId}] Creating checkout session:`, {
      amount: priceData.amount,
      description: priceData.description.substring(0, 50),
      retryCount,
      timeout
    });

    // Create abort controller for timeout handling
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[Stripe:${requestId}] Request timeout after ${timeout}ms`);
      abortController.abort();
    }, timeout);

    try {
      const startTime = Date.now();
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'X-Client-Info': 'god-will-provide-ministry/1.0.0',
          'X-Retry-Count': retryCount.toString(),
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          ...priceData,
          metadata: {
            ...priceData.metadata,
            clientTimestamp: new Date().toISOString(),
            requestId,
            retryCount: retryCount.toString()
          }
        }),
        signal: abortController.signal,
      });

      const responseTime = Date.now() - startTime;
      clearTimeout(timeoutId);

      console.log(`[Stripe:${requestId}] Response received:`, {
        status: response.status,
        responseTime: `${responseTime}ms`,
        ok: response.ok
      });

      // Handle different HTTP status codes
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create checkout session`;
        let errorData: any = {};
        
        try {
          errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }

        console.error(`[Stripe:${requestId}] API Error:`, {
          status: response.status,
          error: errorMessage,
          errorData
        });

        // Categorize errors for better handling
        if (response.status >= 500) {
          throw new StripeNetworkError(`Server error: ${errorMessage}`);
        } else if (response.status === 429) {
          throw new StripeNetworkError('Too many requests. Please wait a moment and try again.');
        } else if (response.status >= 400) {
          throw new StripeValidationError(errorMessage);
        } else {
          throw new Error(errorMessage);
        }
      }

      const session = await response.json();
      
      // Validate response structure
      if (!session || !session.id) {
        console.error(`[Stripe:${requestId}] Invalid response:`, session);
        throw new StripeValidationError('Invalid response from payment service: missing session ID');
      }

      console.log(`[Stripe:${requestId}] Session created successfully:`, {
        sessionId: session.id,
        mode: session.mode,
        hasUrl: !!session.url
      });

      return session;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`[Stripe:${requestId}] Request aborted (timeout)`);
        throw new StripeNetworkError('Request timed out. Please check your internet connection and try again.');
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`[Stripe:${requestId}] Network error:`, error);
        throw new StripeNetworkError('Network error. Please check your internet connection and try again.');
      }
      
      // Re-throw our custom errors as-is
      if (error instanceof StripeConfigError || 
          error instanceof StripeNetworkError || 
          error instanceof StripeValidationError) {
        throw error;
      }
      
      // Wrap unknown errors
      console.error(`[Stripe:${requestId}] Unexpected error:`, error);
      throw new StripeNetworkError(
        'An unexpected error occurred while setting up payment. Please try again.',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  } catch (error) {
    console.error(`[Stripe:${requestId}] Error creating checkout session:`, error);
    throw error;
  }
};

export const redirectToCheckout = async (sessionId: string): Promise<void> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  
  try {
    console.log(`[Stripe:${requestId}] Redirecting to checkout:`, { sessionId });

    if (!sessionId) {
      throw new StripeValidationError('Session ID is required for checkout redirect');
    }

    const stripe = await stripePromise;
    
    if (!stripe) {
      console.error(`[Stripe:${requestId}] Stripe failed to load`);
      throw new StripeConfigError('Stripe failed to load. Please refresh the page and try again.');
    }

    const startTime = Date.now();
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    const redirectTime = Date.now() - startTime;
    
    if (error) {
      console.error(`[Stripe:${requestId}] Redirect error:`, {
        type: error.type,
        message: error.message,
        redirectTime: `${redirectTime}ms`
      });
      
      // Handle specific Stripe errors
      if (error.type === 'invalid_request_error') {
        throw new StripeValidationError('Invalid payment session. Please try creating a new payment.');
      } else if (error.type === 'api_connection_error') {
        throw new StripeNetworkError('Unable to connect to payment service. Please check your internet connection.');
      } else {
        throw new StripeNetworkError(error.message || 'Failed to redirect to payment page. Please try again.');
      }
    }

    console.log(`[Stripe:${requestId}] Redirect initiated successfully in ${redirectTime}ms`);
  } catch (error) {
    console.error(`[Stripe:${requestId}] Error redirecting to checkout:`, error);
    throw error;
  }
};

// Utility function to check if Stripe is properly configured
export const validateStripeConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    errors.push('Stripe publishable key is not configured');
  } else if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('Invalid Stripe publishable key format');
  }

  if (!import.meta.env.VITE_SUPABASE_URL) {
    errors.push('Supabase URL is not configured');
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    errors.push('Supabase anonymous key is not configured');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Health check function for payment service
export const checkPaymentServiceHealth = async (): Promise<{ 
  isHealthy: boolean; 
  latency?: number; 
  error?: string;
  details?: any;
}> => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);
  
  try {
    console.log(`[Stripe:${requestId}] Checking payment service health`);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      return { isHealthy: false, error: 'Supabase URL not configured' };
    }

    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const healthUrl = `${baseUrl}/functions/v1/create-checkout-session`;

    // Make a lightweight request to check if the service is responding
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(healthUrl, {
      method: 'OPTIONS',
      signal: controller.signal,
      headers: {
        'X-Health-Check': 'true',
        'X-Request-ID': requestId
      }
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    const result = {
      isHealthy: response.status < 500,
      latency,
      error: response.status >= 500 ? `Service error: ${response.status}` : undefined,
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }
    };

    console.log(`[Stripe:${requestId}] Health check completed:`, result);
    return result;

  } catch (error) {
    const latency = Date.now() - startTime;
    const result = {
      isHealthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { error: error instanceof Error ? error.stack : String(error) }
    };

    console.error(`[Stripe:${requestId}] Health check failed:`, result);
    return result;
  }
};