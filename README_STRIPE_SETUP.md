# 🎯 Stripe Integration Setup Guide

This guide will help you set up Stripe recurring payments for your LiqLearns application.

## 📋 Prerequisites

1. Stripe account (use Test Mode for development)
2. Supabase project with Edge Functions enabled
3. Node.js and npm installed

## 🚀 Step-by-Step Setup

### 1. Install Stripe SDK

```bash
npm install @stripe/stripe-js
```

### 2. Get Stripe API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Switch to **Test Mode** (toggle in top-right corner)
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 3. Add Environment Variables

Create/update `.env` file in your project root:

```env
# Stripe Keys (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Add to Supabase project settings
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 4. Create Stripe Products and Prices

1. In Stripe Dashboard, go to **Products** → **Add product**
2. Create products for each subscription tier:

   **Basic Plan ($0.50/month)**
   - Name: Basic Plan
   - Description: Basic learning access with email support
   - Price: $0.50 USD
   - Billing period: Monthly
   - Type: Recurring

   **Standard Plan ($0.55/month)**
   - Name: Standard Plan  
   - Description: Expanded course library with chat support
   - Price: $0.55 USD
   - Billing period: Monthly
   - Type: Recurring

   **Pro Plan ($0.60/month)**
   - Name: Pro Plan
   - Description: Full course library with priority support
   - Price: $0.60 USD
   - Billing period: Monthly
   - Type: Recurring

   **Premium Plan ($0.65/month)**
   - Name: Premium Plan
   - Description: Unlimited courses with dedicated support
   - Price: $0.65 USD
   - Billing period: Monthly
   - Type: Recurring

   **Elite Plan ($0.70/month)**
   - Name: Elite Plan
   - Description: VIP support with 1-on-1 coaching
   - Price: $0.70 USD
   - Billing period: Monthly
   - Type: Recurring

3. After creating each product, copy the **Price ID** (starts with `price_`)

### 5. Update Database with Stripe Price IDs

Run this SQL in Supabase SQL Editor to update your subscription plans with Stripe price IDs:

```sql
-- Update Basic Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_YOUR_BASIC_PRICE_ID'
WHERE name = 'Basic';

-- Update Standard Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_YOUR_STANDARD_PRICE_ID'
WHERE name = 'Standard';

-- Update Pro Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_YOUR_PRO_PRICE_ID'
WHERE name = 'Pro';

-- Update Premium Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_YOUR_PREMIUM_PRICE_ID'
WHERE name = 'Premium';

-- Update Elite Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_YOUR_ELITE_PRICE_ID'
WHERE name = 'Elite';
```

### 6. Deploy Supabase Edge Functions

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

3. Set Stripe secret in Supabase:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
```

4. Deploy Edge Functions:
```bash
supabase functions deploy create-stripe-customer
supabase functions deploy create-checkout-session  
supabase functions deploy stripe-webhook
```

### 7. Set Up Stripe Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Webhook signing secret** (starts with `whsec_`)

6. Add webhook secret to Supabase:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 8. Run Database Migration

The migration file `20251222201901_add_stripe_test_plans.sql` has already been created. Run it in Supabase SQL Editor to create the test subscription plans.

## 🧪 Testing the Integration

### Test Signup Flow

1. Go to your signup page
2. Complete registration with test credentials
3. Select a subscription plan
4. You should be redirected to Stripe Checkout
5. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

### Test Subscription Management

1. After successful payment, check Supabase database:
   ```sql
   SELECT 
     id,
     stripe_customer_id,
     stripe_subscription_id,
     has_active_subscription,
     subscription_start_date
   FROM student_profiles
   WHERE email = 'test@example.com';
   ```

2. Verify subscription in Stripe Dashboard:
   - Go to **Customers** and find your test customer
   - Check subscription status and next billing date

### Test Webhooks

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Check the **Logs** tab to see received events
4. Test webhook by triggering events:
   - Update subscription
   - Cancel subscription
   - Trigger payment success/failure

## 🔧 Troubleshooting

### Common Issues

**Issue: "Stripe is not defined"**
- Solution: Ensure `@stripe/stripe-js` is installed and `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env`

**Issue: "Price ID not found"**
- Solution: Verify you copied the correct Price ID (not Product ID) from Stripe Dashboard
- Make sure you updated the database with the correct price IDs

**Issue: "Webhook signature verification failed"**
- Solution: Check that `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe Dashboard
- Ensure webhook endpoint URL is correct

**Issue: "Customer creation failed"**
- Solution: Verify `STRIPE_SECRET_KEY` is set correctly in Supabase
- Check Edge Function logs in Supabase Dashboard

**Issue: "Subscription not updating in database"**
- Solution: Check webhook is receiving events in Stripe Dashboard
- Verify Edge Function logs for errors
- Ensure RLS policies allow updates to `student_profiles` table

## 📚 Additional Resources

- [Stripe Testing Docs](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)

## ✅ Verification Checklist

Before going live:

- [ ] All Stripe API keys added to environment variables
- [ ] Subscription plans created in Stripe Dashboard
- [ ] Database updated with Stripe price IDs
- [ ] Edge Functions deployed successfully
- [ ] Webhook endpoint configured and receiving events
- [ ] Test signup flow completes successfully
- [ ] Test payment with Stripe test card works
- [ ] Subscription status updates in database
- [ ] Webhook events are being processed
- [ ] Error handling works for failed payments

## 🎉 Next Steps

Once setup is complete:

1. Test the complete user journey from signup to payment
2. Verify subscription data is being tracked correctly
3. Test subscription cancellation and reactivation
4. Set up email notifications for payment events
5. Implement subscription management in user dashboard
6. When ready for production, switch to Stripe Live Mode and update API keys

---

**Need Help?** 
- Check Supabase logs: Dashboard → Edge Functions → Logs
- Check Stripe logs: Dashboard → Developers → Webhooks → Logs
- Review browser console for frontend errors