// Follow Deno deploy requirements
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

// Declare Deno global for environments that don't have it predefined
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Add this block - Initialize Supabase clients
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_ANON_KEY') || ''
);
// End of added block

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    let event: Stripe.Event;
    
    try {
      // CRITICAL: Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      
      // Log successful verification
      await supabaseAdmin
        .from('security_audit_logs')
        .insert({
          event_type: 'stripe_webhook_verification',
          success: true,
          event_description: `Webhook verified: ${event.type}`,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
        
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      
      // Log failed verification attempt
      await supabaseAdmin
        .from('security_audit_logs')
        .insert({
          event_type: 'stripe_webhook_verification',
          success: false,
          event_description: `Verification failed: ${err.message}`,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
      
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process verified event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

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

    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});