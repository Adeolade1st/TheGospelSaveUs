# Supabase Edge Functions Deployment Verification Guide

## 🔍 **Step 1: Check if Supabase CLI is Installed**

```bash
# Check if Supabase CLI is installed
supabase --version

# If not installed, install it:
npm install -g @supabase/cli
```

## 🔗 **Step 2: Verify Project Connection**

```bash
# Check current status
supabase status

# If not linked, link your project
supabase link --project-ref YOUR_PROJECT_REF_ID

# Login if needed
supabase login
```

## 📋 **Step 3: List Current Functions**

```bash
# List all deployed functions
supabase functions list

# Expected output should show:
# - create-checkout-session
# - stripe-webhook  
# - verify-session
```

## 🚀 **Step 4: Deploy/Redeploy Functions**

```bash
# Deploy all functions (run these one by one)
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy verify-session

# Check deployment status after each
supabase functions list
```

## 🔐 **Step 5: Verify Environment Variables**

```bash
# List current secrets
supabase secrets list

# Set required secrets if missing:
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 **Step 6: Test Function Endpoints**

### Test create-checkout-session function:
```bash
curl -X POST "https://your-project-id.supabase.co/functions/v1/create-checkout-session" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "usd", 
    "description": "Test donation"
  }'
```

### Test verify-session function:
```bash
curl "https://your-project-id.supabase.co/functions/v1/verify-session/test_session_id" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 📊 **Step 7: Check Function Logs**

```bash
# View logs for each function
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook  
supabase functions logs verify-session

# View real-time logs
supabase functions logs --follow
```

## 🔍 **Step 8: Verify Function URLs**

Your function URLs should be:
- `https://your-project-id.supabase.co/functions/v1/create-checkout-session`
- `https://your-project-id.supabase.co/functions/v1/stripe-webhook`
- `https://your-project-id.supabase.co/functions/v1/verify-session`

## ⚠️ **Common Issues & Solutions**

### Issue 1: Functions not listed
```bash
# Solution: Deploy them
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy verify-session
```

### Issue 2: "Function not found" errors
```bash
# Check if project is linked
supabase status

# Re-link if needed
supabase link --project-ref YOUR_PROJECT_REF_ID
```

### Issue 3: Environment variables missing
```bash
# Set all required secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_URL=https://...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

### Issue 4: Permission errors
```bash
# Make sure you're logged in
supabase login

# Check your role in the project
supabase projects list
```

## ✅ **Verification Checklist**

- [ ] Supabase CLI installed and logged in
- [ ] Project linked correctly
- [ ] All 3 functions show in `supabase functions list`
- [ ] All environment variables set in `supabase secrets list`
- [ ] Function URLs respond (not 404)
- [ ] Function logs show recent activity
- [ ] Test API calls return expected responses

## 🎯 **Quick Deployment Script**

```bash
#!/bin/bash
echo "🚀 Deploying Supabase Edge Functions..."

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy verify-session

# Verify deployment
echo "📋 Checking deployment..."
supabase functions list

echo "🔐 Checking secrets..."
supabase secrets list

echo "✅ Deployment verification complete!"
```

## 🔧 **If Functions Still Not Working**

1. **Check Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to Edge Functions section
   - Verify functions are listed there

2. **Redeploy with Verbose Output**
   ```bash
   supabase functions deploy create-checkout-session --debug
   ```

3. **Check Network Connectivity**
   ```bash
   ping your-project-id.supabase.co
   ```

4. **Verify Project Settings**
   - Ensure your project is not paused
   - Check billing status
   - Verify API keys are active