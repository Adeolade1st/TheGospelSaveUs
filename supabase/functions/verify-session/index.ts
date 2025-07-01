import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const sessionId = url.pathname.split('/').pop()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer']
    })

    // Check if this is an audio download purchase
    const isAudioDownload = session.metadata?.type === 'audio_download'
    
    // If it's an audio download, create a download token
    if (isAudioDownload && session.payment_status === 'paid') {
      // Check if we already have a download token for this session
      const { data: existingToken } = await supabase
        .from('download_tokens')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .limit(1)
        .single()
      
      if (!existingToken) {
        // Create a new download token
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 7) // 7 days from now
        
        const { error } = await supabase
          .from('download_tokens')
          .insert({
            stripe_session_id: sessionId,
            track_id: session.metadata?.audioUrl || '',
            email: session.customer_details?.email || '',
            expires_at: expiryDate.toISOString(),
            max_downloads: 3,
            is_active: true
          })
        
        if (error) {
          console.error('Error creating download token:', error)
        }
      }
    }

    // Return relevant session data
    const sessionData = {
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email,
      payment_status: session.payment_status,
      status: session.status,
      metadata: session.metadata,
      created: session.created,
      line_items: session.line_items?.data?.map(item => ({
        description: item.description,
        amount_total: item.amount_total,
        currency: item.currency,
        quantity: item.quantity
      }))
    }

    return new Response(
      JSON.stringify(sessionData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error verifying session:', error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return new Response(
        JSON.stringify({ error: 'Invalid session ID' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Failed to verify session' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})