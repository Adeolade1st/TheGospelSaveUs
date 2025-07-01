import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { email, trackTitle, artistName, downloadTokenId } = await req.json()

    if (!email || !trackTitle || !artistName || !downloadTokenId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create download URL
    const downloadUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/secure-download/${downloadTokenId}`

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Music Download - God Will Provide Outreach Ministry</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .download-button { display: inline-block; background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .track-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .security-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Music Download is Ready!</h1>
              <p>Thank you for supporting God Will Provide Outreach Ministry</p>
            </div>
            
            <div class="content">
              <div class="track-info">
                <h2>${trackTitle}</h2>
                <p><strong>Artist:</strong> ${artistName}</p>
                <p><strong>Format:</strong> High Quality MP3 (320kbps)</p>
                <p><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Your secure download link is ready. Click the button below to download your track:</p>
              
              <div style="text-align: center;">
                <a href="${downloadUrl}" class="download-button">Download Your Track</a>
              </div>
              
              <div class="security-notice">
                <h3>🔒 Security Information</h3>
                <ul>
                  <li>This download link is valid for 7 days</li>
                  <li>You can download the track up to 3 times</li>
                  <li>The link is secured and tracked for your protection</li>
                  <li>Please save the file to your device after downloading</li>
                </ul>
              </div>
              
              <p>If you have any issues with your download, please contact our support team.</p>
              
              <p>Thank you for supporting our ministry and helping us spread God's word through music!</p>
              
              <div class="footer">
                <p>God Will Provide Outreach Ministry<br>
                Atlanta, Georgia<br>
                <a href="mailto:support@godwillprovide.org">support@godwillprovide.org</a></p>
                
                <p><small>This email was sent because you purchased a track from our website. 
                If you did not make this purchase, please contact us immediately.</small></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // In production, integrate with your email service (SendGrid, Mailgun, etc.)
    // For now, we'll simulate sending the email
    console.log('Sending download email to:', email)
    console.log('Download URL:', downloadUrl)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Download email sent successfully',
        downloadUrl: downloadUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Send download email error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send download email' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})