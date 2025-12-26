// Follow Deno deploy requirements
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Stripe } from 'https://esm.sh/stripe@14.21.0?target=deno';

// Declare Deno global for environments that don't have it predefined
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    
    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.subscription) {
          // Update student profile with subscription info
          await supabase
            .from('student_profiles')
            .update({
              stripe_subscription_id: session.subscription as string,
              has_active_subscription: true,
              subscription_start_date: new Date().toISOString()
            })
            .eq('id', userId)

          console.log(`✅ Subscription activated for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing'
          
          await supabase
            .from('student_profiles')
            .update({
              stripe_subscription_id: subscription.id,
              has_active_subscription: isActive,
              subscription_end_date: subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null
            })
            .eq('id', profile.id)

          console.log(`✅ Subscription updated for user ${profile.id}, active: ${isActive}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user and deactivate subscription
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase
            .from('student_profiles')
            .update({
              has_active_subscription: false,
              subscription_end_date: new Date().toISOString()
            })
            .eq('id', profile.id)

          console.log(`✅ Subscription canceled for user ${profile.id}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`✅ Payment succeeded for invoice ${invoice.id}`)
        // Additional payment success logic can be added here
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error(`❌ Payment failed for invoice ${invoice.id}`)
        // Handle failed payment (e.g., notify user, suspend access)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})