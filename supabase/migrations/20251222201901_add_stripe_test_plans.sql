-- =====================================================
-- Migration: Add Stripe Test Subscription Plans
-- Purpose: Create test subscription plans with prices
--          starting at $0.50 with $0.05 increments
-- =====================================================

-- Delete existing plans and insert new test plans
DELETE FROM subscription_plans WHERE name IN ('Basic', 'Premium');

-- Insert new test subscription plans (you'll need to replace stripe_price_id values after creating them in Stripe Dashboard)
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, currency, features, is_active, stripe_price_id_monthly, stripe_price_id_yearly) VALUES
-- Basic Plan: $0.50/month
(gen_random_uuid(), 'Basic', 0.50, 5.40, 'USD', 
 '{"storage":"1GB","courses":"5","support":"email","features":["Basic Learning Access","Email Support","Limited Course Library"]}',
 true, null, null),

-- Standard Plan: $0.55/month  
(gen_random_uuid(), 'Standard', 0.55, 5.94, 'USD',
 '{"storage":"5GB","courses":"10","support":"chat","features":["Expanded Course Library","Chat Support","Progress Tracking","Mobile Access"]}',
 true, null, null),

-- Pro Plan: $0.60/month
(gen_random_uuid(), 'Pro', 0.60, 6.48, 'USD',
 '{"storage":"20GB","courses":"50","support":"priority","features":["Full Course Library","Priority Support","Advanced Analytics","Certificate Programs","Live Sessions"]}',
 true, null, null),

-- Premium Plan: $0.65/month
(gen_random_uuid(), 'Premium', 0.65, 7.02, 'USD',
 '{"storage":"50GB","courses":"unlimited","support":"dedicated","features":["Unlimited Courses","Dedicated Support","Custom Learning Paths","Group Sessions","Mentor Access","Premium Resources"]}',
 true, null, null),

-- Elite Plan: $0.70/month
(gen_random_uuid(), 'Elite', 0.70, 7.56, 'USD',
 '{"storage":"unlimited","courses":"unlimited","support":"vip","features":["Everything in Premium","VIP Support","1-on-1 Coaching","Custom Content","API Access","White Label Options"]}',
 true, null, null);

-- Add comment explaining next steps
COMMENT ON TABLE subscription_plans IS 'Test plans created with pricing. IMPORTANT: Update stripe_price_id_monthly and stripe_price_id_yearly columns after creating products/prices in Stripe Dashboard.';