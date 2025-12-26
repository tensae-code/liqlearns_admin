-- ================================================
-- Migration: Add CEO Demo User for Validation Testing
-- Purpose: Insert missing 'ceo' user row to fix username/sponsor validation
-- Created: 2025-12-26 09:23:00
-- ================================================

-- Insert CEO demo user into user_profiles table
-- This user is needed for testing username and sponsor validation
INSERT INTO public.user_profiles (
  id,
  email,
  username,
  full_name,
  role,
  account_status,
  subscription_plan,
  subscription_status,
  created_at,
  updated_at
) VALUES (
  'ca402972-048a-4c9f-8699-079ec05f3f3f',
  'ceo@liqlearns.com',
  'ceo',
  'CEO User',
  'ceo',
  'active',
  'free_trial',
  'pending',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the insert worked
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.user_profiles WHERE username = 'ceo';
  
  IF user_count > 0 THEN
    RAISE NOTICE '✅ CEO demo user successfully created with username: ceo';
  ELSE
    RAISE EXCEPTION '❌ Failed to create CEO demo user';
  END IF;
END $$;