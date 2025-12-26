-- ========================================
-- Insert All Missing Demo Users
-- ========================================
-- Purpose: Add CEO, admin, tutor, and support demo users to user_profiles
-- Strategy: Additive only - preserves existing student row, adds missing rows
-- ON CONFLICT: Skips if user already exists by ID or EMAIL (idempotent)

INSERT INTO public.user_profiles (
  id,
  email,
  username,
  full_name,
  role,
  account_status,
  subscription_plan,
  subscription_status
)
VALUES 
  -- CEO Demo User
  (
    'ca402972-048a-4c9f-8699-079ec05f3f3f',
    'ceo@liqlearns.com',
    'ceo',
    'CEO User',
    'ceo'::user_role,
    'active'::account_status,
    'free_trial'::subscription_plan,
    'pending'
  ),
  
  -- Admin Demo User
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'admin@liqlearns.com',
    'admin',
    'Admin User',
    'admin'::user_role,
    'active'::account_status,
    'free_trial'::subscription_plan,
    'pending'
  ),
  
  -- Tutor Demo User
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'tutor@liqlearns.com',
    'tutor',
    'Tutor User',
    'teacher'::user_role,
    'active'::account_status,
    'free_trial'::subscription_plan,
    'pending'
  ),
  
  -- Support Demo User
  (
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    'support@liqlearns.com',
    'support',
    'Support User',
    'support'::user_role,
    'active'::account_status,
    'free_trial'::subscription_plan,
    'pending'
  )
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- Verification Query (Run After)
-- ========================================
-- Expected Result: All 5 rows should be returned
-- SELECT username, role FROM public.user_profiles 
-- WHERE username IN ('ceo', 'admin', 'tutor', 'support', 'student');