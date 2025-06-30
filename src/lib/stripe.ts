import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('❌ Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
}

export const stripePromise = loadStripe(stripePublishableKey || '');

// Simple validation function
export const validateStripeConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY is missing');
  }

  if (!import.meta.env.VITE_SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL is missing');
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Test function to check if everything is working
export const testPaymentSetup = async () => {
  console.log('🧪 Testing payment setup...');
  
  const config = validateStripeConfiguration();
  console.log('Configuration:', config);
  
  if (!config.isValid) {
    console.error('❌ Configuration invalid:', config.errors);
    return false;
  }
  
  // Test Supabase function
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
    
    const response = await fetch(functionUrl, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      }
    });
    
    console.log('Function test response:', response.status);
    return response.status < 500;
  } catch (error) {
    console.error('❌ Function test failed:', error);
    return false;
  }
};