// Payment Debug Utility
export const debugPayment = async () => {
  console.log('=== PAYMENT DEBUG START ===');
  
  // 1. Check environment variables
  console.log('Environment Variables:');
  console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  
  // 2. Test Supabase function endpoint
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
    console.log('Testing function URL:', functionUrl);
    
    try {
      const response = await fetch(functionUrl, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });
      console.log('Function OPTIONS response:', response.status, response.statusText);
    } catch (error) {
      console.error('Function test failed:', error);
    }
  }
  
  console.log('=== PAYMENT DEBUG END ===');
};