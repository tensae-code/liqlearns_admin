// Follow Deno deploy requirements
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

// Declare Deno types for linting purposes
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    // Initialize Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let session: any;

    // Check if this is a subscription checkout (with priceId) or one-time payment (with lineItems)
    if (body.priceId) {
      // Subscription checkout flow
      const { priceId, userId, email, successUrl, cancelUrl, metadata = {} } = body

      // Validate required fields for subscription
      if (!priceId || !userId || !email || !successUrl || !cancelUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for subscription' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Get or create Stripe customer ID
      let customerId: string
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email,
          metadata: { userId }
        });
        customerId = customer.id

        // Save customer ID to database
        await supabase
          .from('student_profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      }

      // Create Stripe checkout session for subscription
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          ...metadata
        },
      });

    } else if (body.lineItems) {
      // One-time payment checkout flow (for marketplace purchases)
      const { lineItems, successUrl, cancelUrl } = body

      // Validate required fields for one-time payment
      if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0 || !successUrl || !cancelUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for one-time payment' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Create Stripe checkout session for one-time payment
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems.map((item: any) => ({
          price_data: {
            currency: item.price_data.currency,
            product_data: {
              name: item.price_data.product_data.name,
              description: item.price_data.product_data.description,
              images: item.price_data.product_data.images || []
            },
            unit_amount: item.price_data.unit_amount
          },
          quantity: item.quantity
        })),
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid request: must include either priceId (for subscription) or lineItems (for one-time payment)' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionUrl: session.url,
        sessionId: session.id,
        url: session.url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})