import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('Processing completed checkout session:', session.id)
        
        // Store donation in database
        const { error: insertError } = await supabase
          .from('donations')
          .insert({
            stripe_session_id: session.id,
            amount: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_details?.email,
            status: 'completed',
            metadata: session.metadata || {},
            created_at: new Date(session.created * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error storing donation:', insertError)
          // Don't return error to Stripe, log it for manual review
        } else {
          console.log('Successfully stored donation for session:', session.id)
        }
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session
        
        // Update donation status to expired
        const { error: updateError } = await supabase
          .from('donations')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', expiredSession.id)

        if (updateError) {
          console.error('Error updating expired session:', updateError)
        }
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Update donation status if needed
        if (paymentIntent.metadata?.session_id) {
          await supabase
            .from('donations')
            .update({ 
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_session_id', paymentIntent.metadata.session_id)
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        
        // Update donation status to failed
        if (failedPayment.metadata?.session_id) {
          await supabase
            .from('donations')
            .update({ 
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_session_id', failedPayment.metadata.session_id)
        }
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Subscription payment succeeded:', invoice.id)
        
        // Handle recurring subscription payments
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          
          // Store recurring donation
          await supabase
            .from('donations')
            .insert({
              stripe_session_id: `recurring_${invoice.id}`,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              customer_email: invoice.customer_email,
              status: 'completed',
              metadata: {
                type: 'recurring_payment',
                subscription_id: subscription.id,
                invoice_id: invoice.id
              },
              created_at: new Date(invoice.created * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', deletedSubscription.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
})