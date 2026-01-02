-- Location: supabase/migrations/20260102103345_add_quest_economy_columns.sql
-- Schema Analysis: Extending existing daily_missions and student_profiles for quest economy
-- Integration Type: Addition - Adding XP/Gold columns to support daily quest gamification
-- Dependencies: public.daily_missions, public.student_profiles

-- 1. Add missing gold_reward column to daily_missions
ALTER TABLE public.daily_missions
ADD COLUMN IF NOT EXISTS gold_reward INTEGER DEFAULT 50;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_daily_missions_rewards 
ON public.daily_missions(xp_reward, gold_reward);

-- 2. Add XP and quest tracking columns to student_profiles  
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_quest_date DATE DEFAULT NULL;

-- Add indexes for game economy queries
CREATE INDEX IF NOT EXISTS idx_student_profiles_xp 
ON public.student_profiles(xp);

CREATE INDEX IF NOT EXISTS idx_student_profiles_gold 
ON public.student_profiles(gold);

CREATE INDEX IF NOT EXISTS idx_student_profiles_streak 
ON public.student_profiles(streak);

CREATE INDEX IF NOT EXISTS idx_student_profiles_last_quest_date 
ON public.student_profiles(last_quest_date);

-- 3. Update existing quests to have gold rewards (additive update)
UPDATE public.daily_missions
SET gold_reward = 50
WHERE gold_reward IS NULL;

-- 4. Comment for documentation
COMMENT ON COLUMN public.student_profiles.xp IS 'Experience points earned from completing quests';
COMMENT ON COLUMN public.student_profiles.gold IS 'Gold currency earned from quests and activities';
COMMENT ON COLUMN public.student_profiles.streak IS 'Current daily quest completion streak';
COMMENT ON COLUMN public.student_profiles.last_quest_date IS 'Last date quests were completed for streak tracking';
COMMENT ON COLUMN public.daily_missions.gold_reward IS 'Gold reward amount for completing this quest';