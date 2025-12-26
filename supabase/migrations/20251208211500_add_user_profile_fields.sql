-- Add missing user profile fields for Part 2 implementation
-- This migration adds display_name, sortable_name, pronouns, language, and timezone to user_profiles

-- Add new columns to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS sortable_name TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON public.user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_sortable_name ON public.user_profiles(sortable_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_language ON public.user_profiles(language);

-- Add comment explaining the new fields
COMMENT ON COLUMN public.user_profiles.display_name IS 'User preferred display name - separate from username';
COMMENT ON COLUMN public.user_profiles.sortable_name IS 'Name formatted for alphabetical sorting (Last, First)';
COMMENT ON COLUMN public.user_profiles.pronouns IS 'User preferred pronouns (e.g., he/him, she/her, they/them)';
COMMENT ON COLUMN public.user_profiles.language IS 'User preferred display language (ISO 639-1 code)';
COMMENT ON COLUMN public.user_profiles.timezone IS 'User timezone (IANA timezone identifier, e.g., America/New_York)';

-- Update existing records with default values if needed
UPDATE public.user_profiles
SET 
  display_name = COALESCE(display_name, full_name),
  sortable_name = COALESCE(sortable_name, full_name),
  language = COALESCE(language, 'en')
WHERE display_name IS NULL OR sortable_name IS NULL OR language IS NULL;