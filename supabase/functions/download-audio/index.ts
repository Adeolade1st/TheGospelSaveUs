import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // Get the token from the URL
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Download token is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Validate the token
    const { data: validationData, error: validationError } = await supabase
      .rpc('validate_download_token', { token_uuid: token })
      .single()
    
    if (validationError || !validationData || !validationData.is_valid) {
      const errorMessage = validationData?.message || 'Invalid download token'
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        },
      )
    }

    // Get token details
    const { data: tokenData, error: tokenError } = await supabase
      .from('download_tokens')
      .select('*')
      .eq('id', token)
      .single()
    
    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve download token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // Increment download count
    const { data: incrementResult, error: incrementError } = await supabase
      .rpc('increment_download_count', { token_uuid: token })
    
    if (incrementError || !incrementResult) {
      return new Response(
        JSON.stringify({ error: 'Failed to update download count' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // Log the download
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    await supabase
      .from('download_logs')
      .insert({
        token_id: token,
        track_id: tokenData.track_id,
        email: tokenData.email,
        ip_address: clientIP,
        user_agent: userAgent
      })

    // Generate a signed URL for the audio file
    // In a real implementation, you would get the file from storage
    // Here we're just returning the track_id which is the file path
    
    // For security, we would normally generate a short-lived signed URL
    // But for this example, we'll just return the track info
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Download authorized',
        track_id: tokenData.track_id,
        downloads_remaining: validationData.downloads_remaining - 1,
        expires_at: tokenData.expires_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing download request:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to process download request' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})