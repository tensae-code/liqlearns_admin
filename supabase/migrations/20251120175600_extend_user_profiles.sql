-- Location: supabase/migrations/20251120175600_extend_user_profiles.sql
-- Schema Analysis: Extending existing user_profiles table
-- Integration Type: Modification (adding columns)
-- Dependencies: user_profiles table

-- Add birthdate and address fields to existing user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan public.subscription_plan DEFAULT 'free_trial'::public.subscription_plan,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending';

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON public.user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_date_of_birth ON public.user_profiles(date_of_birth);

-- Update the handle_new_user trigger function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    role, 
    phone,
    date_of_birth,
    address,
    subscription_plan,
    avatar_url
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, NULL),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE((NEW.raw_user_meta_data->>'subscription_plan')::public.subscription_plan, 'free_trial'::public.subscription_plan),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;