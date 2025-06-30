import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
}

export const stripePromise = loadStripe(stripePublishableKey);

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
} = {}): Promise<{ id: string; url: string }> => {
  const { timeout = 25000, retryCount = 0 } = options;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new StripeConfigError('Missing Supabase URL. Please add VITE_SUPABASE_URL to your environment variables.');
    }

    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new StripeConfigError('Missing Supabase anonymous key. Please add VITE_SUPABASE_ANON_KEY to your environment variables.');
    }

    // Validate price data
    if (!priceData.amount || priceData.amount <= 0) {
      throw new StripeValidationError('Invalid amount: must be greater than 0');
    }

    if (priceData.amount > 99999999) { // $999,999.99 in cents
      throw new StripeValidationError('Amount too large: maximum is $999,999.99');
    }

    // Ensure the URL is properly formatted
    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const functionUrl = `${baseUrl}/functions/v1/create-checkout-session`;

    // Create abort controller for timeout handling
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Client-Info': 'god-will-provide-ministry/1.0.0',
          'X-Retry-Count': retryCount.toString(),
        },
        body: JSON.stringify({
          ...priceData,
          metadata: {
            ...priceData.metadata,
            clientTimestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            retryCount: retryCount.toString()
          }
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: Failed to create checkout session`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }

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
        throw new StripeValidationError('Invalid response from payment service: missing session ID');
      }

      return session;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new StripeNetworkError('Request timed out. Please check your internet connection and try again.');
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new StripeNetworkError('Network error. Please check your internet connection and try again.');
      }
      
      // Re-throw our custom errors as-is
      if (error instanceof StripeConfigError || 
          error instanceof StripeNetworkError || 
          error instanceof StripeValidationError) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new StripeNetworkError(
        'An unexpected error occurred while setting up payment. Please try again.',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (sessionId: string): Promise<void> => {
  try {
    if (!sessionId) {
      throw new StripeValidationError('Session ID is required for checkout redirect');
    }

    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new StripeConfigError('Stripe failed to load. Please refresh the page and try again.');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      
      // Handle specific Stripe errors
      if (error.type === 'invalid_request_error') {
        throw new StripeValidationError('Invalid payment session. Please try creating a new payment.');
      } else if (error.type === 'api_connection_error') {
        throw new StripeNetworkError('Unable to connect to payment service. Please check your internet connection.');
      } else {
        throw new StripeNetworkError(error.message || 'Failed to redirect to payment page. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
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
export const checkPaymentServiceHealth = async (): Promise<{ isHealthy: boolean; latency?: number; error?: string }> => {
  const startTime = Date.now();
  
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      return { isHealthy: false, error: 'Supabase URL not configured' };
    }

    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const healthUrl = `${baseUrl}/functions/v1/create-checkout-session`;

    // Make a lightweight request to check if the service is responding
    const response = await fetch(healthUrl, {
      method: 'OPTIONS',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const latency = Date.now() - startTime;

    return {
      isHealthy: response.status < 500,
      latency,
      error: response.status >= 500 ? `Service error: ${response.status}` : undefined
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      isHealthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};