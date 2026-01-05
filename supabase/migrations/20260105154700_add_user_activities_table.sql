-- =====================================================
-- Migration: Add User Activities Table & Sample Data
-- =====================================================

-- Create user_activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.user_activities(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_view_own_activities"
  ON public.user_activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_activities"
  ON public.user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert sample activity data for demo user
INSERT INTO public.user_activities (user_id, title, xp_earned, created_at)
VALUES
  ('ca402972-048a-4c9f-8699-079ec05f3f3f', 'Completed React Basics Course', 100, NOW() - INTERVAL '2 days'),
  ('ca402972-048a-4c9f-8699-079ec05f3f3f', 'Maintained 7-day learning streak', 50, NOW() - INTERVAL '1 day'),
  ('ca402972-048a-4c9f-8699-079ec05f3f3f', 'Achieved Level 3 milestone', 75, NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Fix: Add unique constraint on user_id in public_badge_profiles
-- =====================================================

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'public_badge_profiles_user_id_key' 
        AND conrelid = 'public.public_badge_profiles'::regclass
    ) THEN
        ALTER TABLE public.public_badge_profiles 
        ADD CONSTRAINT public_badge_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- =====================================================
-- Fix: Update sync_public_badge_profile function
-- =====================================================

-- Drop existing function and trigger to ensure clean recreation
DROP TRIGGER IF EXISTS trigger_sync_badge_profile ON public.student_profiles CASCADE;
DROP FUNCTION IF EXISTS public.sync_public_badge_profile() CASCADE;

-- Recreate function with correct column references
CREATE OR REPLACE FUNCTION public.sync_public_badge_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert or update public_badge_profiles when student_profiles changes
    INSERT INTO public.public_badge_profiles (
        user_id, username, display_name, total_xp, current_level, level_name, rank_title
    )
    SELECT 
        NEW.id,
        COALESCE((SELECT username FROM public.user_profiles WHERE id = NEW.id), 'user_' || substring(NEW.id::text, 1, 8)),
        (SELECT full_name FROM public.user_profiles WHERE id = NEW.id),
        COALESCE(NEW.xp, 0),
        COALESCE(NEW.current_level, 1),
        COALESCE(NEW.level_name, 'Beginner'),
        COALESCE(NEW.rank_title, 'Novice Learner')
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        level_name = EXCLUDED.level_name,
        rank_title = EXCLUDED.rank_title,
        total_badges = (
            SELECT COUNT(*) FROM public.student_badge_progress
            WHERE student_id = NEW.id AND is_unlocked = true
        ),
        updated_at = CURRENT_TIMESTAMP;
        
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_sync_badge_profile
    AFTER INSERT OR UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_public_badge_profile();

-- =====================================================
-- Sync existing student profiles to public_badge_profiles
-- =====================================================

-- Manually trigger sync for existing records using UPDATE
UPDATE public.student_profiles
SET xp = xp
WHERE id IN (
    SELECT id FROM public.student_profiles
    WHERE id NOT IN (SELECT user_id FROM public.public_badge_profiles)
);