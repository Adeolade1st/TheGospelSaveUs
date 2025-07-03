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

    // Get the audio file path from spoken_word_content
    const { data: contentData, error: contentError } = await supabase
      .from('spoken_word_content')
      .select('audio_url, title, artist')
      .eq('id', tokenData.track_id)
      .single()
    
    if (contentError || !contentData) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve audio content' }),
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
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('spoken-word-audio')
      .createSignedUrl(contentData.audio_url, 3600) // 1 hour expiry
    
    if (signedUrlError || !signedUrlData) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate download URL' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // Fetch the audio file content
    const audioResponse = await fetch(signedUrlData.signedUrl);
    
    if (!audioResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch audio file: ${audioResponse.status}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }
    
    const audioBlob = await audioResponse.blob();
    
    // Create a filename
    const filename = `${contentData.artist || 'Artist'} - ${contentData.title || 'Track'}.mp3`;
    
    // Return the audio file with Content-Disposition: attachment header
    return new Response(audioBlob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': audioBlob.size.toString(),
        ...corsHeaders
      },
      status: 200
    });
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