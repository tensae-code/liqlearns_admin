-- ============================================================================
-- Add Missing CEO Demo User
-- ============================================================================
-- Purpose: Insert the CEO user row that edge functions are looking for
-- This user is required for username and sponsor validation testing

-- Insert CEO user (ON CONFLICT ensures no duplicate if row exists)
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

-- Verify the row was inserted
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE username = 'ceo') THEN
    RAISE NOTICE '✅ CEO user successfully added/verified in user_profiles';
  ELSE
    RAISE EXCEPTION '❌ Failed to add CEO user - check constraints';
  END IF;
END $$;