-- Fix Student Account Status Logic
-- Students should be active immediately, only teachers need approval

-- Update the handle_new_user trigger function to set correct account_status based on role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_status account_status;
BEGIN
  -- Determine account status based on role
  -- Students get active status immediately
  -- Teachers, support, admin, and CEO need approval
  IF NEW.raw_user_meta_data->>'role' = 'student' THEN
    default_status := 'active'::account_status;
  ELSE
    default_status := 'pending_approval'::account_status;
  END IF;

  -- Insert user profile with correct status
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    full_name,
    phone,
    role,
    account_status,
    subscription_plan,
    subscription_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    default_status,
    'free_trial'::subscription_plan,
    'pending'
  );

  -- Create student profile if role is student
  IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role) = 'student' THEN
    INSERT INTO public.student_profiles (
      id,
      streak_days,
      total_xp,
      current_level,
      aura_points
    )
    VALUES (
      NEW.id,
      0,
      0,
      1,
      100
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update any existing students who are incorrectly set to pending_approval
UPDATE public.user_profiles
SET account_status = 'active'::account_status
WHERE role = 'student'::user_role
  AND account_status = 'pending_approval'::account_status;

-- Add comment explaining the logic
COMMENT ON FUNCTION handle_new_user() IS 'Trigger function that creates user_profiles and student_profiles on signup. Students get active status immediately, other roles require approval.';