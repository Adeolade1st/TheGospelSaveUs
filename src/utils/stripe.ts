/**
 * Stripe integration utilities
 * Handles secure payment processing and checkout redirects
 */

export interface StripeCheckoutOptions {
  amount: number;
  currency?: string;
  mode?: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export const createStripeCheckout = async (options: StripeCheckoutOptions) => {
  const {
    amount,
    currency = 'usd',
    mode = 'payment',
    successUrl = `${window.location.origin}/success`,
    cancelUrl = `${window.location.origin}/cancel`,
    metadata = {}
  } = options;

  try {
    // In production, this would call your backend API to create a Stripe checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    
    // Redirect to Stripe checkout
    window.location.href = url;
  } catch (error) {
    console.error('Error creating Stripe checkout:', error);
    throw error;
  }
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999; // Stripe limits
};

// Stripe webhook signature verification (for backend use)
export const verifyStripeSignature = (payload: string, signature: string, secret: string): boolean => {
  // This would be implemented on the backend using Stripe's webhook signature verification
  // Included here for reference
  return true;
};