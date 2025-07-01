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

    const { trackId, email, purchaseId } = await req.json()

    if (!trackId || !email) {
      return new Response(
        JSON.stringify({ error: 'Track ID and email are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Verify purchase (in production, check against payment records)
    if (purchaseId) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('donations')
        .select('*')
        .eq('id', purchaseId)
        .eq('customer_email', email)
        .eq('status', 'completed')
        .single()

      if (purchaseError || !purchase) {
        return new Response(
          JSON.stringify({ error: 'Invalid purchase or purchase not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        )
      }
    }

    // Check if token already exists for this track and email
    const { data: existingToken } = await supabase
      .from('download_tokens')
      .select('*')
      .eq('track_id', trackId)
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (existingToken) {
      // Return existing token if still valid
      const expiresAt = new Date(existingToken.expires_at)
      if (new Date() < expiresAt) {
        return new Response(
          JSON.stringify(existingToken),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        // Deactivate expired token
        await supabase
          .from('download_tokens')
          .update({ is_active: false })
          .eq('id', existingToken.id)
      }
    }

    // Create new download token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { data: newToken, error: tokenError } = await supabase
      .from('download_tokens')
      .insert({
        track_id: trackId,
        email: email,
        expires_at: expiresAt.toISOString(),
        download_count: 0,
        max_downloads: 3, // Allow 3 downloads
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (tokenError) {
      throw new Error('Failed to create download token')
    }

    return new Response(
      JSON.stringify(newToken),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )

  } catch (error) {
    console.error('Generate download token error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})