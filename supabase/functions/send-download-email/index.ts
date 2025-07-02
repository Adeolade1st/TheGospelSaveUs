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
    const { email, tokenId, trackTitle, artist } = await req.json()

    if (!email || !tokenId || !trackTitle) {
      return new Response(
        JSON.stringify({ error: 'Email, token ID, and track title are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Verify token exists and is valid
    const { data: token, error: tokenError } = await supabase
      .from('download_tokens')
      .select('*')
      .eq('id', tokenId)
      .single()

    if (tokenError || !token) {
      return new Response(
        JSON.stringify({ error: 'Invalid download token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Verify token belongs to this email
    if (token.email !== email) {
      return new Response(
        JSON.stringify({ error: 'Token does not belong to this email' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Generate a download link
    const downloadLink = `${Deno.env.get('SUPABASE_URL')}/functions/v1/download-audio?token=${tokenId}`

    // In a real implementation, you would send an email here
    // For this example, we'll just simulate it
    console.log(`Sending email to ${email} with download link: ${downloadLink}`)

    // For demonstration purposes, we'll log what would be in the email
    const emailContent = `
      Hello,

      Thank you for your purchase of "${trackTitle}" by ${artist || 'God Will Provide Outreach Ministry'}.

      You can download your audio file using this secure link:
      ${downloadLink}

      This link will expire on ${new Date(token.expires_at).toLocaleDateString()} and can be used ${token.max_downloads - token.download_count} more times.

      Thank you for supporting our ministry!

      God Will Provide Outreach Ministry
    `

    console.log('Email content:', emailContent)

    // In a production environment, you would use a service like SendGrid, Mailgun, etc.
    // For example with SendGrid:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'downloads@godwillprovide.org', name: 'God Will Provide Outreach Ministry' },
        subject: `Your Download Link for "${trackTitle}"`,
        content: [{ type: 'text/plain', value: emailContent }]
      })
    });
    */

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-download-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})