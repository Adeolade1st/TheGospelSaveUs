import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment functionality will be limited.');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const createPaymentIntent = async (paymentData: {
  amount: number;
  currency: string;
  description: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('Missing Supabase URL. Please add VITE_SUPABASE_URL to your environment variables.');
    }

    const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
    const functionUrl = `${baseUrl}/functions/v1/create-payment`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount: paymentData.amount * 100, // Convert to cents
        currency: paymentData.currency,
        description: paymentData.description,
        customer_email: paymentData.customer_email,
        metadata: paymentData.metadata
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to create payment intent`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create payment intent');
    }

    return result;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};