# Stripe Payment Edge Function

A secure Supabase Edge Function that implements Stripe payment processing with comprehensive validation, error handling, and logging.

## Features

- ✅ **Secure Payment Processing**: Uses Stripe's Payment Intent API
- ✅ **Request Validation**: Comprehensive input validation and sanitization
- ✅ **Error Handling**: Detailed error responses with proper HTTP status codes
- ✅ **Logging & Monitoring**: Automatic payment attempt logging
- ✅ **TypeScript Support**: Full type safety with TypeScript interfaces
- ✅ **CORS Support**: Cross-origin request handling
- ✅ **Security Best Practices**: Input sanitization, rate limiting considerations

## Environment Variables

Set these in your Supabase project settings:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## API Endpoint

```
POST https://your-project.supabase.co/functions/v1/create-payment
```

## Request Format

```typescript
{
  "amount": 2000,                    // Required: Amount in cents ($20.00)
  "currency": "usd",                 // Required: 3-letter currency code
  "payment_method": "pm_1234...",    // Optional: Stripe payment method ID
  "description": "Donation to ministry", // Optional: Payment description
  "customer_email": "user@example.com",  // Optional: Customer email
  "confirm": true,                   // Optional: Auto-confirm payment
  "return_url": "https://yoursite.com/success", // Optional: Return URL
  "metadata": {                      // Optional: Custom metadata
    "campaign": "monthly_donation",
    "tier": "supporter"
  }
}
```

## Response Format

### Success Response (200)
```typescript
{
  "success": true,
  "payment_intent": {
    "id": "pi_1234...",
    "status": "succeeded",
    "amount": 2000,
    "currency": "usd"
    // ... other Stripe PaymentIntent fields
  },
  "client_secret": "pi_1234..._secret_...",
  "requires_action": false
}
```

### Error Response (400/402/500)
```typescript
{
  "success": false,
  "error": "Validation failed",
  "validation_errors": [
    {
      "field": "amount",
      "message": "Amount must be at least $0.50 (50 cents)"
    }
  ]
}
```

## Usage Examples

### Basic Payment Intent Creation

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/create-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`
  },
  body: JSON.stringify({
    amount: 2000,        // $20.00
    currency: 'usd',
    description: 'Ministry donation'
  })
});

const result = await response.json();

if (result.success) {
  // Use client_secret with Stripe.js to complete payment
  const { client_secret } = result;
  // ... integrate with Stripe Elements
} else {
  console.error('Payment failed:', result.error);
}
```

### Payment with Customer Email

```javascript
const paymentData = {
  amount: 5000,
  currency: 'usd',
  customer_email: 'donor@example.com',
  description: 'Monthly ministry support',
  metadata: {
    type: 'monthly_donation',
    tier: 'supporter'
  }
};

const response = await fetch(endpoint, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(paymentData)
});
```

### Immediate Payment Confirmation

```javascript
const paymentData = {
  amount: 1000,
  currency: 'usd',
  payment_method: 'pm_1234567890',  // From Stripe Elements
  confirm: true,
  return_url: 'https://yoursite.com/payment-complete'
};

const response = await fetch(endpoint, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(paymentData)
});

const result = await response.json();

if (result.requires_action) {
  // Redirect user to authenticate payment
  window.location.href = result.redirect_url;
}
```

## Error Handling

The function returns specific error types:

- **400**: Validation errors, invalid JSON, malformed requests
- **402**: Card declined, insufficient funds
- **405**: Method not allowed (non-POST requests)
- **500**: Internal server errors
- **503**: Stripe API temporarily unavailable

## Security Features

1. **Input Validation**: All inputs are validated and sanitized
2. **Amount Limits**: Minimum $0.50, maximum $999,999.99
3. **Email Validation**: Proper email format checking
4. **URL Validation**: Return URL format validation
5. **Metadata Sanitization**: Safe handling of custom metadata
6. **Error Logging**: Comprehensive error tracking without exposing sensitive data

## Testing

### Test with curl

```bash
curl -X POST https://your-project.supabase.co/functions/v1/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "amount": 2000,
    "currency": "usd",
    "description": "Test payment"
  }'
```

### Test with Stripe Test Cards

Use Stripe's test card numbers:
- **Success**: `4242424242424242`
- **Declined**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`

## Monitoring

Payment attempts are logged to the `payment_logs` table:

```sql
SELECT * FROM payment_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Deployment

1. Deploy the function:
```bash
supabase functions deploy create-payment
```

2. Set environment variables in Supabase Dashboard:
   - Go to Settings > Edge Functions
   - Add your Stripe secret key and other variables

3. Test the deployment:
```bash
supabase functions invoke create-payment --data '{"amount":1000,"currency":"usd"}'
```

## Integration with Frontend

See the example React component integration in the project's `PaymentButton.tsx` for a complete implementation using this Edge Function.