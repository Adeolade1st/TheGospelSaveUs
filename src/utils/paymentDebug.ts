// Payment Debug Utility
export const debugPayment = async () => {
  console.log('=== PAYMENT SYSTEM DIAGNOSTICS ===');
  console.log('Timestamp:', new Date().toISOString());
  
  // 1. Environment Variables Check
  console.log('\n🔍 Environment Variables:');
  const envVars = {
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: SET (${key.includes('KEY') ? value.substring(0, 12) + '...' : value.substring(0, 30) + '...'})`);
    } else {
      console.log(`❌ ${key}: MISSING`);
    }
  });
  
  // 2. Stripe Key Validation
  console.log('\n🔑 Stripe Key Validation:');
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (stripeKey) {
    if (stripeKey.startsWith('pk_test_')) {
      console.log('✅ Stripe key is in TEST mode');
    } else if (stripeKey.startsWith('pk_live_')) {
      console.log('⚠️ Stripe key is in LIVE mode');
    } else {
      console.log('❌ Invalid Stripe key format');
    }
  }
  
  // 3. Supabase Function Connectivity Test
  console.log('\n🌐 Supabase Function Connectivity:');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;
    console.log('Testing URL:', functionUrl);
    
    try {
      const startTime = Date.now();
      
      // Test OPTIONS request (CORS preflight)
      const optionsResponse = await fetch(functionUrl, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const optionsTime = Date.now() - startTime;
      console.log(`📡 OPTIONS request: ${optionsResponse.status} (${optionsTime}ms)`);
      
      // Test with minimal payload
      const testStartTime = Date.now();
      const testResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'X-Debug': 'true'
        },
        body: JSON.stringify({
          amount: 100, // $1.00
          currency: 'usd',
          description: 'Debug test payment'
        })
      });
      
      const testTime = Date.now() - testStartTime;
      console.log(`📡 Test POST request: ${testResponse.status} (${testTime}ms)`);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ Function is responding correctly');
        console.log('Response preview:', {
          hasId: !!testData.id,
          hasUrl: !!testData.url,
          mode: testData.mode
        });
      } else {
        const errorText = await testResponse.text();
        console.log('❌ Function error response:', errorText);
      }
      
    } catch (error) {
      console.error('❌ Function connectivity test failed:', error);
    }
  } else {
    console.log('❌ Cannot test - missing Supabase configuration');
  }
  
  // 4. Browser Environment Check
  console.log('\n🌍 Browser Environment:');
  console.log('User Agent:', navigator.userAgent);
  console.log('Online:', navigator.onLine);
  console.log('Language:', navigator.language);
  console.log('Platform:', navigator.platform);
  
  // 5. Network Timing Check
  console.log('\n⏱️ Network Performance:');
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    console.log('Connection type:', connection?.effectiveType);
    console.log('Downlink:', connection?.downlink, 'Mbps');
    console.log('RTT:', connection?.rtt, 'ms');
  }
  
  // 6. Local Storage Check
  console.log('\n💾 Storage Check:');
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ Local storage available');
  } catch (error) {
    console.log('❌ Local storage not available:', error);
  }
  
  // 7. Console Instructions
  console.log('\n📋 Debugging Instructions:');
  console.log('1. Check the logs above for any ❌ errors');
  console.log('2. Try clicking a payment button and watch for new logs');
  console.log('3. Look for request IDs in the format [12345678]');
  console.log('4. Check Network tab in DevTools for failed requests');
  console.log('5. Verify Supabase Edge Functions are deployed');
  
  console.log('\n=== DIAGNOSTICS COMPLETE ===\n');
  
  return {
    environmentValid: Object.values(envVars).every(Boolean),
    timestamp: new Date().toISOString()
  };
};

// Quick test function for payment buttons
export const testPaymentButton = async (amount: number = 25) => {
  console.log(`🧪 Testing payment button with $${amount}...`);
  
  const testData = {
    amount: amount * 100,
    currency: 'usd',
    description: `Test payment of $${amount}`,
    metadata: {
      test: 'true',
      timestamp: new Date().toISOString()
    }
  };
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    return false;
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Test response status:', response.status);
    
    if (response.ok) {
      const session = await response.json();
      console.log('✅ Test successful - session created:', session.id);
      console.log('Checkout URL:', session.url);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Test failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
};

// Function to check Supabase Edge Function logs
export const checkSupabaseLogs = () => {
  console.log('\n📊 Supabase Edge Function Logs:');
  console.log('To check your Supabase Edge Function logs, run these commands:');
  console.log('');
  console.log('1. View recent logs:');
  console.log('   supabase functions logs create-checkout-session');
  console.log('');
  console.log('2. View real-time logs:');
  console.log('   supabase functions logs create-checkout-session --follow');
  console.log('');
  console.log('3. View logs for specific time period:');
  console.log('   supabase functions logs create-checkout-session --since="1 hour ago"');
  console.log('');
  console.log('4. Check if functions are deployed:');
  console.log('   supabase functions list');
  console.log('');
  console.log('Alternative: Check logs in Supabase Dashboard > Edge Functions');
};