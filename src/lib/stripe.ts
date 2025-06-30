import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
export const stripePromise = loadStripe(stripePublishableKey || '');

export const createCheckoutSession = async (priceData: {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; url: string }> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(priceData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  return await response.json();
};

export const redirectToCheckout = async (sessionId: string): Promise<void> => {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw new Error(error.message || 'Failed to redirect to checkout');
  }
};

export const validateStripeConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    errors.push('Stripe publishable key is not configured');
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