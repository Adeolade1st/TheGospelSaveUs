# Stripe Functions Deployment Instructions

## Prerequisites

1. **Supabase CLI Installation**
   ```bash
   npm install -g @supabase/cli
   ```

2. **Supabase Account Setup**
   - Ensure you have a Supabase project created
   - Have your project reference ID ready

## Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open a browser window for authentication.

## Step 2: Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```

Replace `YOUR_PROJECT_REF_ID` with your actual Supabase project reference ID.

## Step 3: Set Environment Variables in Supabase

Set the required secrets for your Edge Functions:

```bash
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Set Stripe Webhook Secret (you'll get this after creating the webhook)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Set Supabase URL (usually auto-configured, but verify)
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co

# Set Supabase Service Role Key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Deploy Edge Functions

Deploy each function individually:

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function  
supabase functions deploy stripe-webhook

# Deploy verify-session function
supabase functions deploy verify-session
```

## Step 5: Verify Deployment

Check that your functions are deployed:

```bash
supabase functions list
```

You should see all three functions listed:
- create-checkout-session
- stripe-webhook
- verify-session

## Step 6: Configure Stripe Webhook

1. **Get Your Webhook URL**
   Your webhook URL will be:
   ```
   https://your-project-id.supabase.co/functions/v1/stripe-webhook
   ```

2. **Create Webhook in Stripe Dashboard**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Developers → Webhooks
   - Click "Add endpoint"
   - Enter your webhook URL
   - Select these events:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_succeeded`
     - `customer.subscription.deleted`

3. **Get Webhook Secret**
   - After creating the webhook, copy the "Signing secret"
   - Update your Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

## Step 7: Update Local Environment

Update your local `.env` file with the correct values:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 8: Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test payment flow**
   - Navigate to your website
   - Try making a test donation
   - Use test card: 4242 4242 4242 4242
   - Verify redirect to success page

3. **Check webhook delivery**
   - Go to Stripe Dashboard → Webhooks
   - Check the webhook delivery logs
   - Verify events are being received successfully

## Troubleshooting

### Common Issues

1. **Function deployment fails**
   - Check that you're logged in: `supabase status`
   - Verify project is linked: `supabase projects list`
   - Ensure you have proper permissions

2. **Webhook not receiving events**
   - Verify webhook URL is correct
   - Check webhook secret matches
   - Ensure webhook is in test mode if using test keys

3. **Environment variables not working**
   - List current secrets: `supabase secrets list`
   - Verify secrets are set correctly
   - Redeploy functions after updating secrets

### Checking Function Logs

View logs for debugging:

```bash
# View logs for specific function
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook
supabase functions logs verify-session

# View real-time logs
supabase functions logs --follow
```

## Security Checklist

- [ ] Using test keys for development
- [ ] Webhook secret is properly configured
- [ ] Environment variables are secure
- [ ] Functions are deployed successfully
- [ ] Test payments work correctly
- [ ] Webhook events are being processed

## Next Steps

After successful deployment:

1. **Test thoroughly** with various payment scenarios
2. **Monitor webhook delivery** in Stripe Dashboard
3. **Check database** for donation records
4. **Verify success page** displays correctly
5. **Test error scenarios** (declined cards, etc.)

## Production Deployment

When ready for production:

1. **Switch to live Stripe keys**
2. **Update webhook endpoint** to production URL
3. **Test with real payments** (small amounts)
4. **Monitor closely** for the first few transactions
5. **Set up monitoring** and alerts

---

**Important Notes:**
- Always test in development first
- Keep your Stripe keys secure
- Monitor webhook delivery regularly
- Have a rollback plan ready