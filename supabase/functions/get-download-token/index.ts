import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { sessionId } = await req.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log(`Fetching download token for session: ${sessionId}`)

    // Query the download_tokens table using the service role (bypassing RLS)
    const { data, error } = await supabase
      .from('download_tokens')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    if (error) {
      console.error('Error fetching download token:', error)
      
      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Download token not found', notFound: true }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve download token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Return the token data
    return new Response(
      JSON.stringify({
        id: data.id,
        trackId: data.track_id,
        email: data.email,
        expiresAt: data.expires_at,
        downloadCount: data.download_count,
        maxDownloads: data.max_downloads,
        isActive: data.is_active,
        createdAt: data.created_at,
        lastDownloadedAt: data.last_downloaded_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-download-token function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})