import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { sessionId, trackId, email } = await req.json()

    if (!sessionId || !trackId || !email) {
      return new Response(
        JSON.stringify({ error: 'Session ID, track ID, and email are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if token already exists
    const { data: existingTokens, error: checkError } = await supabase
      .from('download_tokens')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing tokens:', checkError)
      return new Response(
        JSON.stringify({ error: 'Failed to check existing tokens' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // If token exists, return it
    if (existingTokens && existingTokens.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          tokenId: existingTokens[0].id,
          message: 'Existing token found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Create expiry date (7 days from now)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    // Create new token
    const { data: newToken, error: createError } = await supabase
      .from('download_tokens')
      .insert({
        stripe_session_id: sessionId,
        track_id: trackId,
        email: email,
        expires_at: expiryDate.toISOString(),
        max_downloads: 3,
        is_active: true
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating download token:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create download token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        tokenId: newToken.id,
        message: 'Download token created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Error in create-download-token function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})