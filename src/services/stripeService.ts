import { supabase } from '../lib/supabase';

/**
 * Stripe Service for handling subscription payments
 * 
 * IMPORTANT SETUP STEPS:
 * 1. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file
 * 2. Install Stripe: npm install @stripe/stripe-js
 * 3. Create products and prices in Stripe Dashboard (Test Mode)
 * 4. Update subscription_plans table with stripe_price_id_monthly values
 * 5. Set up Stripe webhook endpoint in Supabase Edge Functions
 */

// Interface for subscription plan
export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: any;
  is_active: boolean;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
}

// Interface for checkout session creation
export interface CheckoutSessionParams {
  priceId: string;
  userId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

/**
 * Fetch all active subscription plans from database
 */
export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Create Stripe customer for a user
 * This should be called when user signs up
 */
export const createStripeCustomer = async (
  userId: string,
  email: string,
  name: string
): Promise<string | null> => {
  try {
    // Call Supabase Edge Function to create Stripe customer
    const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
      body: {
        userId,
        email,
        name
      }
    });
    
    if (error) throw error;
    
    // Update student_profiles with Stripe customer ID
    if (data?.customerId) {
      await supabase
        .from('student_profiles')
        .update({ stripe_customer_id: data.customerId })
        .eq('id', userId);
      
      return data.customerId;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return null;
  }
};

/**
 * Create Stripe checkout session for subscription
 */
export const createCheckoutSession = async (
  params: CheckoutSessionParams
): Promise<string | null> => {
  try {
    // Call Supabase Edge Function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: params
    });
    
    if (error) throw error;
    
    return data?.sessionUrl || null;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
};

/**
 * Get customer portal URL for managing subscriptions
 */
export const getCustomerPortalUrl = async (
  customerId: string,
  returnUrl: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-customer-portal', {
      body: {
        customerId,
        returnUrl
      }
    });
    
    if (error) throw error;
    
    return data?.portalUrl || null;
  } catch (error) {
    console.error('Error creating customer portal:', error);
    return null;
  }
};

/**
 * Get user's current subscription status
 */
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select(`
        stripe_subscription_id,
        subscription_plan,
        subscription_start_date,
        subscription_end_date,
        has_active_subscription
      `)
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
};

/**
 * Cancel subscription at period end
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId }
    });
    
    if (error) throw error;
    
    return data?.success || false;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
};

/**
 * Resume canceled subscription
 */
export const resumeSubscription = async (
  subscriptionId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('resume-subscription', {
      body: { subscriptionId }
    });
    
    if (error) throw error;
    
    return data?.success || false;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return false;
  }
};