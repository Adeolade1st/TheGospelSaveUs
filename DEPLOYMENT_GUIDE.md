# Stripe Integration Deployment Guide

This guide will help you deploy the Stripe integration for the God Will Provide Outreach Ministry website.

## Prerequisites

1. **Supabase Account**: Ensure you have a Supabase project set up
2. **Stripe Account**: You need a Stripe account with API keys
3. **Supabase CLI**: Install the Supabase CLI for deploying Edge Functions

## Step 1: Environment Variables Setup

### 1.1 Create Local Environment File
1. Copy `.env.example` to `.env` in your project root
2. Fill in your actual values:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 1.2 Set Supabase Secrets
You need to set these secrets in Supabase for your Edge Functions:

```bash
# Using Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Or set them in the Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions
3. Add the secrets in the Environment Variables section

## Step 2: Deploy Edge Functions

### 2.1 Login to Supabase CLI
```bash
supabase login
```

### 2.2 Link Your Project
```bash
supabase link --project-ref your-project-id
```

### 2.3 Deploy All Functions
```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook

# Deploy verify-session function
supabase functions deploy verify-session
```

### 2.4 Verify Deployment
Check that your functions are deployed:
```bash
supabase functions list
```

You should see:
- create-checkout-session
- stripe-webhook
- verify-session

## Step 3: Configure Stripe Webhook

### 3.1 Get Your Webhook URL
Your webhook URL will be:
```
https://your-project-id.supabase.co/functions/v1/stripe-webhook
```

### 3.2 Create Webhook in Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers > Webhooks
3. Click "Add endpoint"
4. Enter your webhook URL: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`
5. Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
6. Click "Add endpoint"

### 3.3 Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the "Signing secret" (starts with `whsec_`)
3. Update your Supabase secrets:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

## Step 4: Test the Integration

### 4.1 Test Checkout Session Creation
1. Visit your website
2. Try to make a donation
3. You should be redirected to Stripe Checkout

### 4.2 Test Webhook
1. Complete a test payment in Stripe
2. Check your Supabase database `donations` table
3. Verify the donation record was created

### 4.3 Test Success Page
1. Complete a payment
2. You should be redirected to `/success?session_id=...`
3. The page should display payment details

## Step 5: Production Considerations

### 5.1 Switch to Live Mode
1. Replace test API keys with live API keys
2. Update webhook endpoint to use live mode
3. Test with real payments (small amounts)

### 5.2 Monitor Webhooks
1. Check Stripe Dashboard > Webhooks for delivery status
2. Monitor Supabase Edge Function logs
3. Set up alerts for failed webhooks

### 5.3 Database Monitoring
1. Monitor the `donations` table for new records
2. Set up alerts for failed payment processing
3. Regular backup of donation data

## Troubleshooting

### Common Issues

1. **"Missing Stripe publishable key" Error**
   - Ensure `VITE_STRIPE_PUBLISHABLE_KEY` is set in your `.env` file
   - Restart your development server

2. **"Failed to create checkout session" Error**
   - Check that `STRIPE_SECRET_KEY` is set in Supabase secrets
   - Verify the Edge Function is deployed correctly

3. **Webhook Not Receiving Events**
   - Verify webhook URL is correct
   - Check that webhook secret matches
   - Ensure webhook is in "live" mode if using live keys

4. **Session Verification Fails**
   - Check that `verify-session` function is deployed
   - Verify Stripe secret key is correct
   - Check function logs in Supabase dashboard

### Checking Logs
```bash
# View function logs
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook
supabase functions logs verify-session
```

## Security Notes

1. **Never commit secrets to version control**
2. **Use environment variables for all sensitive data**
3. **Regularly rotate API keys**
4. **Monitor webhook signatures**
5. **Validate all incoming data**

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check Stripe webhook delivery logs
3. Verify all environment variables are set correctly
4. Test with Stripe's test mode first