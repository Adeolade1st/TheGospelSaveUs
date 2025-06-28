/**
 * Stripe Test Mode Verification Utility
 * This utility helps verify that Stripe is properly configured for test mode
 */

export interface StripeTestModeStatus {
  publishableKeyValid: boolean;
  publishableKeyTestMode: boolean;
  secretKeyTestMode: boolean | null;
  testCardSupported: boolean;
  dashboardTestMode: boolean | null;
  webhookTestMode: boolean | null;
  recommendations: string[];
}

export const verifyStripeTestMode = (): StripeTestModeStatus => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const recommendations: string[] = [];
  
  // Check publishable key
  const publishableKeyValid = !!publishableKey;
  const publishableKeyTestMode = publishableKey?.startsWith('pk_test_') || false;
  
  if (!publishableKeyValid) {
    recommendations.push('❌ VITE_STRIPE_PUBLISHABLE_KEY is missing from environment variables');
  } else if (!publishableKeyTestMode) {
    recommendations.push('⚠️ Publishable key appears to be LIVE mode (should start with pk_test_)');
  } else {
    recommendations.push('✅ Publishable key is correctly configured for test mode');
  }
  
  // Secret key check (we can't access it directly from frontend)
  const secretKeyTestMode = null; // Will be checked server-side
  recommendations.push('🔍 Secret key test mode status needs to be verified in Supabase Edge Functions');
  
  // Test card support check
  const testCardSupported = true; // Stripe always supports test cards in test mode
  
  // Dashboard and webhook checks (manual verification required)
  const dashboardTestMode = null;
  const webhookTestMode = null;
  
  recommendations.push('📋 Manual verification required:');
  recommendations.push('  • Check Stripe Dashboard shows "TEST" in top-right corner');
  recommendations.push('  • Verify webhook endpoints are configured for test mode');
  recommendations.push('  • Test with card number 4242 4242 4242 4242');
  
  return {
    publishableKeyValid,
    publishableKeyTestMode,
    secretKeyTestMode,
    testCardSupported,
    dashboardTestMode,
    webhookTestMode,
    recommendations
  };
};

export const getTestCardNumbers = () => {
  return {
    visa: '4242 4242 4242 4242',
    visaDebit: '4000 0566 5566 5556',
    mastercard: '5555 5555 5555 4444',
    amex: '3782 822463 10005',
    declined: '4000 0000 0000 0002',
    insufficientFunds: '4000 0000 0000 9995',
    expiredCard: '4000 0000 0000 0069'
  };
};