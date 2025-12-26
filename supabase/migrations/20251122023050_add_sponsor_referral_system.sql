-- Add sponsor_name column to user_profiles for referral system
-- This allows tracking who referred each user for payment distribution

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS sponsor_name TEXT;

-- Add index for faster sponsor lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_sponsor_name 
ON public.user_profiles(sponsor_name);

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.sponsor_name IS 'Username of the sponsor/referrer who invited this user';