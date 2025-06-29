# Secure Payment Processing Edge Function

A production-ready serverless function for handling secure payment processing with comprehensive security features and multi-provider support.

## Features

### 🔒 Security & Compliance
- **PCI Compliance**: No sensitive card data stored or logged
- **Input Validation**: Comprehensive validation and sanitization
- **Rate Limiting**: Prevents abuse with configurable limits
- **Idempotency**: Prevents duplicate payments
- **CORS Protection**: Secure cross-origin configuration
- **Request Timeout**: Prevents hanging requests

### 💳 Payment Processors
- **Stripe**: Full integration with payment intents
- **PayPal**: Ready for integration (placeholder)
- **Square**: Ready for integration (placeholder)

### 🛡️ Security Features
- Client IP tracking and rate limiting
- Input sanitization and validation
- Secure error handling (no sensitive data exposure)
- Request timeout protection
- Idempotency key validation

## API Reference

### Endpoint
```
POST /functions/v1/process-payment
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <supabase_anon_key>
X-Idempotency-Key: <unique_key>
```

### Request Body
```json
{
  "amount": 2500,
  "currency": "USD",
  "payment_method": "card",
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "address": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "US"
    }
  },
  "metadata": {
    "order_id": "order_123",
    "source": "website"
  },
  "idempotency_key": "unique_key_12345678",
  "return_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel"
}
```

### Response Format
```json
{
  "success": true,
  "payment_id": "pi_1234567890",
  "client_secret": "pi_1234567890_secret_abc123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed: Amount must be a positive number",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Validation Rules

### Amount
- Must be a positive number
- Maximum limit: $10,000
- Automatically converted to cents for Stripe

### Currency
- Supported: USD, EUR, GBP, CAD, AUD
- Case insensitive

### Customer Information
- **Email**: Valid email format, max 254 characters
- **Name**: Minimum 2 characters
- **Phone**: Optional, international format validation
- **Address**: Optional but validated if provided

### Idempotency Key
- Minimum 16 characters
- Used to prevent duplicate payments
- Stored for successful payments only

## Rate Limiting

- **Window**: 60 seconds
- **Limit**: 10 requests per IP
- **Response**: 429 Too Many Requests

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `METHOD_NOT_ALLOWED` | Invalid HTTP method |
| `INVALID_FORMAT` | Invalid JSON payload |
| `TIMEOUT` | Request timeout (30s) |
| `STRIPE_ERROR` | Stripe processing error |
| `NOT_IMPLEMENTED` | Payment method not available |
| `INTERNAL_ERROR` | Server error |

## Environment Variables

```bash
# Required for Stripe integration
STRIPE_SECRET_KEY=sk_test_...

# Required for PayPal integration (when implemented)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Required for Square integration (when implemented)
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_APPLICATION_ID=your_square_app_id
```

## Security Best Practices

### 1. Environment Variables
- Never commit secrets to version control
- Use test keys for development
- Rotate keys regularly

### 2. Input Validation
- All inputs are sanitized and validated
- String length limits enforced
- Type checking for all fields

### 3. Error Handling
- No sensitive information in error messages
- Detailed logging for debugging
- Standardized error responses

### 4. Rate Limiting
- IP-based rate limiting
- Configurable limits
- Automatic cleanup of old entries

### 5. Idempotency
- Prevents duplicate payments
- Unique key validation
- Automatic cleanup of old keys

## Testing

### Test with cURL
```bash
curl -X POST https://your-project.supabase.co/functions/v1/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_anon_key" \
  -H "X-Idempotency-Key: test_key_123456789" \
  -d '{
    "amount": 2500,
    "currency": "USD",
    "payment_method": "card",
    "customer": {
      "email": "test@example.com",
      "name": "Test User"
    },
    "idempotency_key": "test_key_123456789"
  }'
```

### Test Cards (Stripe)
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

## Monitoring

### Logs
- All requests are logged with processing time
- Errors include stack traces for debugging
- No sensitive data in logs

### Metrics to Monitor
- Request volume and rate
- Error rates by type
- Processing time
- Rate limit hits
- Idempotency cache size

## Production Deployment

1. **Environment Setup**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```

2. **Deploy Function**
   ```bash
   supabase functions deploy process-payment
   ```

3. **Test Deployment**
   ```bash
   supabase functions invoke process-payment --data '{"test": true}'
   ```

4. **Monitor Logs**
   ```bash
   supabase functions logs process-payment
   ```

## Support

For issues or questions:
1. Check the logs: `supabase functions logs process-payment`
2. Verify environment variables are set
3. Test with the provided cURL examples
4. Check rate limiting if getting 429 errors