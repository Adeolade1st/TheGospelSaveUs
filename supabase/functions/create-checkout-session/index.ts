import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-retry-count, x-request-id, x-health-check',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestMetadata {
  clientTimestamp?: string;
  userAgent?: string;
  retryCount?: string;
  requestId?: string;
  type?: string;
  title?: string;
  artist?: string;
  language?: string;
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

  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = Date.now();
  const isHealthCheck = req.headers.get('x-health-check') === 'true';

  // Handle health check requests
  if (isHealthCheck) {
    console.log(`[${requestId}] Health check request received`);
    return new Response(
      JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        requestId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  try {
    // Initialize Stripe with error handling
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error(`[${requestId}] Missing STRIPE_SECRET_KEY environment variable`);
      return new Response(
        JSON.stringify({ 
          error: 'Payment service configuration error',
          requestId 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      
    })

    // Parse and validate request body
    let requestData: CheckoutRequest;
    try {
      const bodyText = await req.text();
      if (!bodyText.trim()) {
        throw new Error('Empty request body');
      }
      requestData = JSON.parse(bodyText);
    } catch (error) {
      console.error(`[${requestId}] Invalid JSON in request body:`, error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          requestId 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const { amount, currency, description, metadata = {} } = requestData;

    // Enhanced validation with detailed logging
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.warn(`[${requestId}] Invalid amount: ${amount} (type: ${typeof amount})`);
      return new Response(
        JSON.stringify({ 
          error: 'Valid amount is required',
          requestId 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (amount < 100) { // Minimum $1.00
      console.warn(`[${requestId}] Amount below minimum: ${amount} cents`);
      return new Response(
        JSON.stringify({ 
          error: 'Minimum amount is $1.00',
          requestId 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      console.warn(`[${requestId}] Invalid description: ${description}`);
      return new Response(
        JSON.stringify({ 
          error: 'Description is required',
          requestId 
        }),
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
      type: metadata.type || 'donation',
      retryCount: metadata.retryCount || '0',
      userAgent: metadata.userAgent?.substring(0, 100) || 'unknown',
      clientTimestamp: metadata.clientTimestamp
    });

    // Determine if this is a subscription or one-time payment
    const isSubscription = metadata?.type === 'monthly_subscription';
    const isAudioDownload = metadata?.type === 'audio_download';

    // Get origin for redirect URLs with fallback
    const origin = req.headers.get('origin') || 
                   req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 
                   'http://localhost:5173';

    console.log(`[${requestId}] Using origin for redirects: ${origin}`);

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: isAudioDownload 
                ? `Download: ${metadata.title || 'Audio Track'}`
                : 'Ministry Donation - God Will Provide Outreach Ministry',
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
          ministry: 'God Will Provide Outreach Ministry',
          type: metadata.type || 'donation'
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
      const stripeStartTime = Date.now();
      session = await stripe.checkout.sessions.create(sessionConfig);
      const stripeResponseTime = Date.now() - stripeStartTime;
      
      console.log(`[${requestId}] Stripe API call completed in ${stripeResponseTime}ms`);
      
    } catch (stripeError: any) {
      const stripeResponseTime = Date.now() - startTime;
      
      console.error(`[${requestId}] Stripe API error after ${stripeResponseTime}ms:`, {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        statusCode: stripeError.statusCode,
        requestId: stripeError.requestId
      });

      // Handle specific Stripe errors with user-friendly messages
      if (stripeError.type === 'card_error') {
        return new Response(
          JSON.stringify({ 
            error: 'Payment method error. Please try a different card.',
            requestId 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
      } else if (stripeError.type === 'rate_limit_error') {
        return new Response(
          JSON.stringify({ 
            error: 'Too many requests. Please wait a moment and try again.',
            requestId 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429,
          },
        )
      } else if (stripeError.type === 'api_connection_error') {
        return new Response(
          JSON.stringify({ 
            error: 'Payment service temporarily unavailable. Please try again.',
            requestId 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503,
          },
        )
      } else if (stripeError.type === 'authentication_error') {
        return new Response(
          JSON.stringify({ 
            error: 'Payment service configuration error. Please contact support.',
            requestId 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          },
        )
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Payment processing error. Please try again.',
            requestId 
          }),
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
      processingTimeMs: processingTime,
      hasUrl: !!session.url,
      expiresAt: session.expires_at
    });

    // Validate session before returning
    if (!session.id || !session.url) {
      console.error(`[${requestId}] Invalid session created:`, {
        hasId: !!session.id,
        hasUrl: !!session.url
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid session created. Please try again.',
          requestId 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    return new Response(
      JSON.stringify({ 
        id: session.id, 
        url: session.url,
        mode: session.mode,
        requestId,
        expiresAt: session.expires_at
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
    
    console.error(`[${requestId}] Unexpected error after ${processingTime}ms:`, {
      error: error.message,
      stack: error.stack,
      name: error.name
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