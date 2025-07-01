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

    const url = new URL(req.url)
    const tokenId = url.pathname.split('/').pop()

    if (!tokenId) {
      return new Response(
        JSON.stringify({ error: 'Token ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Verify download token
    const { data: token, error: tokenError } = await supabase
      .from('download_tokens')
      .select('*')
      .eq('id', tokenId)
      .eq('is_active', true)
      .single()

    if (tokenError || !token) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired download token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(token.expires_at)
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Download token has expired' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 410,
        }
      )
    }

    // Check download limit
    if (token.download_count >= token.max_downloads) {
      return new Response(
        JSON.stringify({ error: 'Download limit exceeded' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      )
    }

    // Get track information
    const { data: track, error: trackError } = await supabase
      .from('spoken_word_content')
      .select('*')
      .eq('id', token.track_id)
      .single()

    if (trackError || !track) {
      return new Response(
        JSON.stringify({ error: 'Track not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Get the audio file path from the URL
    const audioFileName = track.audio_url.split('/').pop()

    // Fetch the audio file from storage
    const { data: audioData, error: audioError } = await supabase.storage
      .from('audio-files')
      .download(audioFileName)

    if (audioError || !audioData) {
      return new Response(
        JSON.stringify({ error: 'Audio file not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Update download count
    await supabase
      .from('download_tokens')
      .update({ 
        download_count: token.download_count + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', tokenId)

    // Log download activity
    await supabase
      .from('download_logs')
      .insert({
        token_id: tokenId,
        track_id: token.track_id,
        email: token.email,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        downloaded_at: new Date().toISOString()
      })

    // Return the audio file with appropriate headers
    const filename = `${track.artist} - ${track.title}.mp3`
    
    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })

  } catch (error) {
    console.error('Secure download error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})