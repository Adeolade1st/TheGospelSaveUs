import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('❌ Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
  console.log('💡 Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file');
}

// Initialize Stripe with proper error handling
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (!stripePublishableKey) {
      console.error('❌ Cannot initialize Stripe: Missing publishable key');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(stripePublishableKey).catch((error) => {
      console.error('❌ Failed to load Stripe.js:', error);
      return null;
    });
  }
  
  return stripePromise;
};

// Legacy export for backward compatibility
export const stripePromise = getStripe();

// Enhanced validation function
export const validateStripeConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY is missing from environment variables');
  } else {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key.startsWith('pk_')) {
      errors.push('VITE_STRIPE_PUBLISHABLE_KEY has invalid format (should start with pk_)');
    }
  }

  if (!import.meta.env.VITE_SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL is missing from environment variables');
  } else {
    const url = import.meta.env.VITE_SUPABASE_URL;
    try {
      new URL(url);
    } catch {
      errors.push('VITE_SUPABASE_URL is not a valid URL');
    }
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing from environment variables');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced test function
export const testPaymentSetup = async () => {
  console.log('🧪 Testing payment setup...');
  
  const config = validateStripeConfiguration();
  console.log('Configuration validation:', config);
  
  if (!config.isValid) {
    console.error('❌ Configuration invalid:', config.errors);
    return false;
  }
  
  // Test Stripe loading
  try {
    const stripe = await getStripe();
    if (!stripe) {
      console.error('❌ Failed to load Stripe');
      return false;
    }
    console.log('✅ Stripe loaded successfully');
  } catch (error) {
    console.error('❌ Stripe loading failed:', error);
    return false;
  }
  
  // Test Supabase function connectivity
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
    
    console.log('🔗 Testing function URL:', functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Function OPTIONS response:', response.status, response.statusText);
    
    if (response.status < 500) {
      console.log('✅ Function is accessible');
      return true;
    } else {
      console.error('❌ Function returned server error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Function connectivity test failed:', error);
    return false;
  }
};

// Utility to check if we're in test mode
export const isTestMode = (): boolean => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return key ? key.startsWith('pk_test_') : false;
};

// Get test card numbers for testing
export const getTestCards = () => {
  return {
    visa: '4242 4242 4242 4242',
    visaDebit: '4000 0566 5566 5556',
    mastercard: '5555 5555 5555 4444',
    amex: '3782 822463 10005',
    declined: '4000 0000 0000 0002',
    insufficientFunds: '4000 0000 0000 9995'
  };
};