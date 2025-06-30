import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-retry-count',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestMetadata {
  clientTimestamp?: string;
  userAgent?: string;
  retryCount?: string;
  [key: string]: any;
}

interface CheckoutRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: RequestMetadata;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Initialize Stripe with error handling
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error(`[${requestId}] Missing STRIPE_SECRET_KEY environment variable`);
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      timeout: 20000, // 20 second timeout
      maxNetworkRetries: 2,
    })

    // Parse and validate request body
    let requestData: CheckoutRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error(`[${requestId}] Invalid JSON in request body:`, error);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const { amount, currency, description, metadata = {} } = requestData;

    // Enhanced validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.warn(`[${requestId}] Invalid amount: ${amount}`);
      return new Response(
        JSON.stringify({ error: 'Valid amount is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (amount < 100) { // Minimum $1.00
      return new Response(
        JSON.stringify({ error: 'Minimum donation amount is $1.00' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (amount > 99999999) { // Maximum $999,999.99
      return new Response(
        JSON.stringify({ error: 'Maximum donation amount is $999,999.99' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Log request details
    console.log(`[${requestId}] Processing checkout session:`, {
      amount,
      currency: currency || 'usd',
      description: description.substring(0, 100),
      retryCount: metadata.retryCount || '0',
      userAgent: metadata.userAgent?.substring(0, 100) || 'unknown'
    });

    // Determine if this is a subscription or one-time payment
    const isSubscription = metadata?.type === 'monthly_subscription' || amount >= 10000 // $100 or more

    // Get origin for redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://localhost:5173';

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: 'Ministry Donation - God Will Provide Outreach Ministry',
              description: description,
              metadata: {
                ministry: 'God Will Provide Outreach Ministry',
                requestId,
                ...metadata
              }
            },
            unit_amount: amount,
            ...(isSubscription && {
              recurring: {
                interval: 'month'
              }
            })
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#donate`,
      metadata: {
        ministry: 'God Will Provide Outreach Ministry',
        requestId,
        serverTimestamp: new Date().toISOString(),
        ...metadata
      },
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true
      },
      // Enhanced session configuration
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      payment_intent_data: isSubscription ? undefined : {
        metadata: {
          requestId,
          ministry: 'God Will Provide Outreach Ministry'
        }
      }
    }

    // Only add customer_creation for payment mode (not subscription mode)
    if (!isSubscription) {
      sessionConfig.customer_creation = 'always'
    }

    // Create Stripe checkout session with timeout handling
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionConfig);
    } catch (stripeError: any) {
      console.error(`[${requestId}] Stripe API error:`, {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        statusCode: stripeError.statusCode
      });

      // Handle specific Stripe errors
      if (stripeError.type === 'card_error') {
        return new Response(
          JSON.stringify({ error: 'Payment method error. Please try a different card.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      } else if (stripeError.type === 'rate_limit_error') {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429,
          },
        )
      } else if (stripeError.type === 'api_connection_error') {
        return new Response(
          JSON.stringify({ error: 'Payment service temporarily unavailable. Please try again.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503,
          },
        )
      } else {
        return new Response(
          JSON.stringify({ error: 'Payment processing error. Please try again.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          },
        )
      }
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Checkout session created successfully:`, {
      sessionId: session.id,
      mode: session.mode,
      processingTimeMs: processingTime
    });

    return new Response(
      JSON.stringify({ 
        id: session.id, 
        url: session.url,
        mode: session.mode,
        requestId
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'X-Processing-Time': processingTime.toString()
        },
        status: 200,
      },
    )
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`[${requestId}] Unexpected error:`, {
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime
    });

    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.',
        requestId
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          'X-Processing-Time': processingTime.toString()
        },
        status: 500,
      },
    )
  }
})