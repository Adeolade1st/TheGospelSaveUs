/*
  # Secure Stripe Payment Edge Function
  
  This function creates a secure payment endpoint using Stripe's API with:
  - Request validation and sanitization
  - Stripe Payment Intent creation
  - Comprehensive error handling
  - Security best practices
  - Proper logging and monitoring
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// TypeScript interfaces for type safety
interface PaymentRequest {
  amount: number
  currency: string
  payment_method?: string
  description?: string
  customer_email?: string
  metadata?: Record<string, string>
  confirm?: boolean
  return_url?: string
}

interface PaymentResponse {
  success: boolean
  payment_intent?: Stripe.PaymentIntent
  client_secret?: string
  error?: string
  requires_action?: boolean
  redirect_url?: string
}

interface ValidationError {
  field: string
  message: string
}

// Initialize Stripe with secret key
const getStripeInstance = (): Stripe => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  
  if (!stripeSecretKey.startsWith('sk_')) {
    throw new Error('Invalid Stripe secret key format')
  }
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })
}

// Initialize Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are not set')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Request validation function
const validatePaymentRequest = (data: any): { isValid: boolean; errors: ValidationError[]; sanitized?: PaymentRequest } => {
  const errors: ValidationError[] = []
  
  // Validate amount
  if (!data.amount || typeof data.amount !== 'number') {
    errors.push({ field: 'amount', message: 'Amount is required and must be a number' })
  } else if (data.amount < 50) { // Minimum $0.50
    errors.push({ field: 'amount', message: 'Amount must be at least $0.50 (50 cents)' })
  } else if (data.amount > 99999999) { // Maximum $999,999.99
    errors.push({ field: 'amount', message: 'Amount exceeds maximum limit' })
  }
  
  // Validate currency
  if (!data.currency || typeof data.currency !== 'string') {
    errors.push({ field: 'currency', message: 'Currency is required and must be a string' })
  } else if (!/^[A-Z]{3}$/.test(data.currency.toUpperCase())) {
    errors.push({ field: 'currency', message: 'Currency must be a valid 3-letter ISO code' })
  }
  
  // Validate email if provided
  if (data.customer_email && typeof data.customer_email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.customer_email)) {
      errors.push({ field: 'customer_email', message: 'Invalid email format' })
    }
  }
  
  // Validate description length
  if (data.description && typeof data.description === 'string' && data.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be less than 1000 characters' })
  }
  
  // Validate return_url if provided
  if (data.return_url && typeof data.return_url === 'string') {
    try {
      new URL(data.return_url)
    } catch {
      errors.push({ field: 'return_url', message: 'Invalid return URL format' })
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors }
  }
  
  // Sanitize and return clean data
  const sanitized: PaymentRequest = {
    amount: Math.round(data.amount), // Ensure integer
    currency: data.currency.toLowerCase(),
    payment_method: data.payment_method?.toString().trim(),
    description: data.description?.toString().trim().substring(0, 1000),
    customer_email: data.customer_email?.toString().trim().toLowerCase(),
    metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : {},
    confirm: Boolean(data.confirm),
    return_url: data.return_url?.toString().trim()
  }
  
  return { isValid: true, errors: [], sanitized }
}

// Log payment attempt for monitoring
const logPaymentAttempt = async (supabase: any, data: PaymentRequest, success: boolean, error?: string) => {
  try {
    await supabase
      .from('payment_logs')
      .insert({
        amount: data.amount,
        currency: data.currency,
        customer_email: data.customer_email,
        success,
        error_message: error,
        created_at: new Date().toISOString()
      })
  } catch (logError) {
    console.error('Failed to log payment attempt:', logError)
  }
}

// Create Stripe Payment Intent
const createPaymentIntent = async (stripe: Stripe, data: PaymentRequest): Promise<Stripe.PaymentIntent> => {
  const paymentIntentData: Stripe.PaymentIntentCreateParams = {
    amount: data.amount,
    currency: data.currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      ...data.metadata,
      created_via: 'supabase_edge_function',
      timestamp: new Date().toISOString()
    }
  }
  
  // Add description if provided
  if (data.description) {
    paymentIntentData.description = data.description
  }
  
  // Add customer email if provided
  if (data.customer_email) {
    paymentIntentData.receipt_email = data.customer_email
  }
  
  // Add payment method if provided
  if (data.payment_method) {
    paymentIntentData.payment_method = data.payment_method
    if (data.confirm) {
      paymentIntentData.confirm = true
      if (data.return_url) {
        paymentIntentData.return_url = data.return_url
      }
    }
  }
  
  return await stripe.paymentIntents.create(paymentIntentData)
}

// Main request handler
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
  
  try {
    // Parse request body
    let requestData: any
    try {
      requestData = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Validate request data
    const validation = validatePaymentRequest(requestData)
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Validation failed',
          validation_errors: validation.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const paymentData = validation.sanitized!
    
    // Initialize services
    const stripe = getStripeInstance()
    const supabase = getSupabaseClient()
    
    // Create payment intent
    console.log(`Creating payment intent for amount: ${paymentData.amount} ${paymentData.currency}`)
    
    const paymentIntent = await createPaymentIntent(stripe, paymentData)
    
    // Log successful payment attempt
    await logPaymentAttempt(supabase, paymentData, true)
    
    // Prepare response
    const response: PaymentResponse = {
      success: true,
      payment_intent: paymentIntent,
      client_secret: paymentIntent.client_secret || undefined,
      requires_action: paymentIntent.status === 'requires_action',
    }
    
    // Add redirect URL if payment requires action
    if (paymentIntent.status === 'requires_action' && paymentIntent.next_action?.redirect_to_url) {
      response.redirect_url = paymentIntent.next_action.redirect_to_url.url
    }
    
    console.log(`Payment intent created successfully: ${paymentIntent.id}`)
    
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Payment processing error:', error)
    
    // Log failed payment attempt
    try {
      const supabase = getSupabaseClient()
      await logPaymentAttempt(supabase, requestData, false, error.message)
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Card was declined',
          decline_code: error.decline_code,
          message: error.message
        }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request parameters',
          message: error.message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (error.type === 'StripeAPIError') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment service temporarily unavailable',
          message: 'Please try again later'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Generic error response
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your payment'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})