-- Location: supabase/migrations/20251122025522_add_resource_unlock_system.sql
-- Schema Analysis: Existing student_profiles and student_progress tables
-- Integration Type: Extension - Adding level system and resource unlocks
-- Dependencies: student_profiles, student_progress

-- Add aura_points and level_name columns to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS aura_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS level_name TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS rank_title TEXT DEFAULT 'Novice Learner';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_student_profiles_aura_points ON public.student_profiles(aura_points);
CREATE INDEX IF NOT EXISTS idx_student_profiles_current_level ON public.student_profiles(current_level);

-- Create tutoring_resources table
CREATE TABLE IF NOT EXISTS public.tutoring_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon_color TEXT NOT NULL,
    unlock_level INTEGER NOT NULL DEFAULT 1,
    unlock_xp INTEGER NOT NULL DEFAULT 0,
    unlock_aura_points INTEGER NOT NULL DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index on unlock requirements
CREATE INDEX IF NOT EXISTS idx_tutoring_resources_unlock_level ON public.tutoring_resources(unlock_level);
CREATE INDEX IF NOT EXISTS idx_tutoring_resources_unlock_xp ON public.tutoring_resources(unlock_xp);

-- Enable RLS
ALTER TABLE public.tutoring_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Public read access for resources
CREATE POLICY "public_can_read_tutoring_resources"
ON public.tutoring_resources
FOR SELECT
TO authenticated
USING (true);

-- Function to calculate level from XP (accepts BIGINT to handle SUM() results)
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp_amount BIGINT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN xp_amount < 100 THEN 1
    WHEN xp_amount < 250 THEN 2
    WHEN xp_amount < 500 THEN 3
    WHEN xp_amount < 1000 THEN 4
    WHEN xp_amount < 2000 THEN 5
    WHEN xp_amount < 3500 THEN 6
    WHEN xp_amount < 5500 THEN 7
    WHEN xp_amount < 8000 THEN 8
    WHEN xp_amount < 11000 THEN 9
    ELSE 10
  END;
$$;

-- Function to get level name from level number
CREATE OR REPLACE FUNCTION public.get_level_name(level_num INTEGER)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT CASE level_num
    WHEN 1 THEN 'Beginner'
    WHEN 2 THEN 'Explorer'
    WHEN 3 THEN 'Apprentice'
    WHEN 4 THEN 'Skilled'
    WHEN 5 THEN 'Advanced'
    WHEN 6 THEN 'Expert'
    WHEN 7 THEN 'Master'
    WHEN 8 THEN 'Grandmaster'
    WHEN 9 THEN 'Legend'
    WHEN 10 THEN 'Mythic'
    ELSE 'Beginner'
  END;
$$;

-- Function to get rank title from aura points
CREATE OR REPLACE FUNCTION public.get_rank_title(aura_amount INTEGER)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN aura_amount < 500 THEN 'Novice Learner'
    WHEN aura_amount < 1500 THEN 'Bright Student'
    WHEN aura_amount < 3000 THEN 'Rising Star'
    WHEN aura_amount < 5000 THEN 'Knowledge Seeker'
    WHEN aura_amount < 8000 THEN 'Wisdom Holder'
    WHEN aura_amount < 12000 THEN 'Scholar Elite'
    WHEN aura_amount < 17000 THEN 'Cultural Ambassador'
    WHEN aura_amount < 23000 THEN 'Master Teacher'
    WHEN aura_amount < 30000 THEN 'Legendary Mentor'
    ELSE 'Transcendent Sage'
  END;
$$;

-- Function to update student level and rank
CREATE OR REPLACE FUNCTION public.update_student_level_and_rank()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_xp BIGINT;
    calculated_level INTEGER;
    new_level_name TEXT;
    new_rank_title TEXT;
BEGIN
    -- Get total XP from student_progress
    SELECT COALESCE(SUM(total_xp), 0) INTO total_xp
    FROM public.student_progress
    WHERE student_id = NEW.id;

    -- Calculate level from total XP
    calculated_level := public.calculate_level_from_xp(total_xp);
    new_level_name := public.get_level_name(calculated_level);
    new_rank_title := public.get_rank_title(COALESCE(NEW.aura_points, 0));

    -- Update student_profiles with calculated values
    UPDATE public.student_profiles
    SET 
        current_level = calculated_level,
        level_name = new_level_name,
        rank_title = new_rank_title,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

-- Trigger to update level when student_progress changes
CREATE TRIGGER update_level_on_progress_change
AFTER INSERT OR UPDATE ON public.student_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_student_level_and_rank();

-- Insert mock tutoring resources with unlock requirements
DO $$
BEGIN
    INSERT INTO public.tutoring_resources (name, category, icon_color, unlock_level, unlock_xp, unlock_aura_points, is_premium)
    VALUES
        ('Books', 'Reading', 'bg-blue-500', 1, 0, 0, false),
        ('Videos', 'Visual', 'bg-red-500', 1, 0, 0, false),
        ('Audio', 'Listening', 'bg-purple-500', 2, 100, 0, false),
        ('Music', 'Culture', 'bg-pink-500', 2, 100, 0, false),
        ('Games', 'Interactive', 'bg-green-500', 3, 250, 500, false),
        ('Audiobooks', 'Literature', 'bg-indigo-500', 3, 250, 500, false),
        ('Vocabulary', 'Language', 'bg-yellow-500', 4, 500, 1000, false),
        ('Notes', 'Study', 'bg-gray-500', 4, 500, 1000, false),
        ('Exercises', 'Practice', 'bg-orange-500', 5, 1000, 2000, true),
        ('Novels', 'Advanced Reading', 'bg-teal-500', 6, 2000, 3500, true),
        ('Movies', 'Immersion', 'bg-cyan-500', 7, 3500, 5500, true),
        ('Live Classes', 'Premium', 'bg-lime-500', 8, 5500, 8000, true);
END $$;

-- Update existing student profiles with initial values
UPDATE public.student_profiles sp
SET 
    current_level = public.calculate_level_from_xp(
        COALESCE((SELECT SUM(total_xp) FROM public.student_progress WHERE student_id = sp.id), 0)
    ),
    level_name = public.get_level_name(
        public.calculate_level_from_xp(
            COALESCE((SELECT SUM(total_xp) FROM public.student_progress WHERE student_id = sp.id), 0)
        )
    ),
    rank_title = public.get_rank_title(COALESCE(aura_points, 0)),
    aura_points = COALESCE(aura_points, 0)
WHERE current_level IS NULL OR level_name IS NULL;