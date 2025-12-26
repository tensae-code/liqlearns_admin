-- Location: supabase/migrations/20251121024252_student_dashboard_learning_system.sql
-- Schema Analysis: Extends existing user_profiles and student_profiles tables
-- Integration Type: Addition - New learning management features
-- Dependencies: user_profiles, student_profiles

-- 1. Custom Types
CREATE TYPE public.skill_type AS ENUM ('listening', 'reading', 'speaking', 'writing');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.achievement_category AS ENUM ('language_milestone', 'learning_consistency', 'skill_mastery');
CREATE TYPE public.lesson_type AS ENUM ('interactive', 'cultural_immersion', 'conversation', 'grammar');

-- 2. Core Tables

-- Courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    lesson_type public.lesson_type NOT NULL,
    difficulty_level public.difficulty_level NOT NULL,
    language TEXT NOT NULL,
    cultural_theme TEXT,
    estimated_duration_minutes INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student Progress table (extends student_profiles)
CREATE TABLE public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill_type public.skill_type NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_type)
);

-- Course Enrollments
CREATE TABLE public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    is_completed BOOLEAN DEFAULT false,
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Achievements table
CREATE TABLE public.student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.achievement_category NOT NULL,
    icon_emoji TEXT,
    xp_reward INTEGER DEFAULT 100,
    aura_points INTEGER DEFAULT 50,
    requirement_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student Achievement Records
CREATE TABLE public.student_achievement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.student_achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, achievement_id)
);

-- Daily Missions
CREATE TABLE public.daily_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 50,
    difficulty_level public.difficulty_level NOT NULL,
    deadline_hours INTEGER DEFAULT 24,
    mission_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student Mission Progress
CREATE TABLE public.student_mission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, mission_id)
);

-- Study Calendar Events
CREATE TABLE public.study_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    minutes_studied INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, event_date)
);

-- Community Guilds
CREATE TABLE public.community_guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    focus_language TEXT NOT NULL,
    member_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Guild Memberships
CREATE TABLE public.guild_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES public.community_guilds(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(guild_id, student_id)
);

-- 3. Indexes
CREATE INDEX idx_student_progress_student_id ON public.student_progress(student_id);
CREATE INDEX idx_student_progress_skill_type ON public.student_progress(skill_type);
CREATE INDEX idx_course_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_student_achievements_category ON public.student_achievements(category);
CREATE INDEX idx_student_achievement_records_student_id ON public.student_achievement_records(student_id);
CREATE INDEX idx_daily_missions_date ON public.daily_missions(mission_date);
CREATE INDEX idx_student_mission_progress_student_id ON public.student_mission_progress(student_id);
CREATE INDEX idx_study_calendar_student_date ON public.study_calendar_events(student_id, event_date);
CREATE INDEX idx_guild_memberships_student_id ON public.guild_memberships(student_id);
CREATE INDEX idx_guild_memberships_guild_id ON public.guild_memberships(guild_id);

-- 4. RLS Setup
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_memberships ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Courses - Public read access
CREATE POLICY "public_can_read_courses"
ON public.courses
FOR SELECT
TO public
USING (is_active = true);

-- Student Progress - Pattern 2: Simple user ownership
CREATE POLICY "students_manage_own_progress"
ON public.student_progress
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Course Enrollments - Pattern 2: Simple user ownership
CREATE POLICY "students_manage_own_enrollments"
ON public.course_enrollments
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Achievements - Public read access
CREATE POLICY "public_can_read_achievements"
ON public.student_achievements
FOR SELECT
TO public
USING (is_active = true);

-- Student Achievement Records - Pattern 2: Simple user ownership
CREATE POLICY "students_manage_own_achievement_records"
ON public.student_achievement_records
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Daily Missions - Public read access for active missions
CREATE POLICY "authenticated_can_read_daily_missions"
ON public.daily_missions
FOR SELECT
TO authenticated
USING (is_active = true AND mission_date >= CURRENT_DATE - INTERVAL '7 days');

-- Student Mission Progress - Pattern 2: Simple user ownership
CREATE POLICY "students_manage_own_mission_progress"
ON public.student_mission_progress
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Study Calendar Events - Pattern 2: Simple user ownership
CREATE POLICY "students_manage_own_calendar_events"
ON public.study_calendar_events
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Community Guilds - Public read for public guilds
CREATE POLICY "public_can_read_public_guilds"
ON public.community_guilds
FOR SELECT
TO authenticated
USING (is_public = true);

-- Guild Memberships - Pattern 2: Simple user ownership
CREATE POLICY "students_manage_own_guild_memberships"
ON public.guild_memberships
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 6. Functions

-- Function to update student XP and level
CREATE OR REPLACE FUNCTION public.update_student_xp(
    p_student_id UUID,
    p_skill_type public.skill_type,
    p_xp_gained INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Get current XP
    SELECT total_xp INTO v_current_xp
    FROM public.student_progress
    WHERE student_id = p_student_id AND skill_type = p_skill_type;
    
    -- Calculate new level (100 XP per level)
    v_new_level := FLOOR((v_current_xp + p_xp_gained) / 100) + 1;
    
    -- Update progress
    UPDATE public.student_progress
    SET 
        total_xp = total_xp + p_xp_gained,
        level = v_new_level,
        progress_percentage = LEAST(100, FLOOR(((total_xp + p_xp_gained) % 100))),
        updated_at = CURRENT_TIMESTAMP
    WHERE student_id = p_student_id AND skill_type = p_skill_type;
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_student_streak(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
BEGIN
    -- Get last activity date and current streaks
    SELECT 
        DATE(last_activity_date),
        current_streak_days,
        longest_streak_days
    INTO v_last_activity, v_current_streak, v_longest_streak
    FROM public.student_progress
    WHERE student_id = p_student_id
    LIMIT 1;
    
    -- Update streak logic
    IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Continue streak
        UPDATE public.student_progress
        SET 
            current_streak_days = current_streak_days + 1,
            longest_streak_days = GREATEST(longest_streak_days, current_streak_days + 1),
            last_activity_date = CURRENT_TIMESTAMP
        WHERE student_id = p_student_id;
    ELSIF v_last_activity < CURRENT_DATE - INTERVAL '1 day' THEN
        -- Reset streak
        UPDATE public.student_progress
        SET 
            current_streak_days = 1,
            last_activity_date = CURRENT_TIMESTAMP
        WHERE student_id = p_student_id;
    END IF;
END;
$$;

-- 7. Mock Data
DO $$
DECLARE
    v_student_id UUID;
    v_course1_id UUID := gen_random_uuid();
    v_course2_id UUID := gen_random_uuid();
    v_achievement1_id UUID := gen_random_uuid();
    v_achievement2_id UUID := gen_random_uuid();
    v_mission1_id UUID := gen_random_uuid();
    v_mission2_id UUID := gen_random_uuid();
    v_guild1_id UUID := gen_random_uuid();
BEGIN
    -- Get first student ID
    SELECT id INTO v_student_id FROM public.student_profiles LIMIT 1;
    
    IF v_student_id IS NOT NULL THEN
        -- Insert sample courses
        INSERT INTO public.courses (id, title, description, lesson_type, difficulty_level, language, xp_reward, estimated_duration_minutes)
        VALUES
            (v_course1_id, 'Amharic Basics: Greetings', 'Learn essential Amharic greetings and introductions', 'interactive'::public.lesson_type, 'easy'::public.difficulty_level, 'Amharic', 50, 30),
            (v_course2_id, 'Ethiopian Coffee Ceremony', 'Cultural immersion: Traditional Ethiopian coffee ceremony', 'cultural_immersion'::public.lesson_type, 'medium'::public.difficulty_level, 'Amharic', 75, 45);
        
        -- Initialize student progress for all skills
        INSERT INTO public.student_progress (student_id, skill_type, progress_percentage, level, total_xp, current_streak_days, last_activity_date)
        VALUES
            (v_student_id, 'listening'::public.skill_type, 85, 12, 2450, 7, CURRENT_TIMESTAMP),
            (v_student_id, 'reading'::public.skill_type, 72, 10, 1890, 7, CURRENT_TIMESTAMP),
            (v_student_id, 'speaking'::public.skill_type, 68, 9, 1650, 7, CURRENT_TIMESTAMP),
            (v_student_id, 'writing'::public.skill_type, 59, 8, 1420, 7, CURRENT_TIMESTAMP);
        
        -- Enroll student in courses
        INSERT INTO public.course_enrollments (student_id, course_id, progress_percentage, last_accessed_at)
        VALUES
            (v_student_id, v_course1_id, 75, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
            (v_student_id, v_course2_id, 30, CURRENT_TIMESTAMP - INTERVAL '1 day');
        
        -- Create achievements
        INSERT INTO public.student_achievements (id, name, description, category, icon_emoji, xp_reward, aura_points, requirement_value)
        VALUES
            (v_achievement1_id, 'Quick Learner', 'Completed 5 lessons in one day', 'learning_consistency'::public.achievement_category, '⚡', 100, 50, 5),
            (v_achievement2_id, 'Streak Master', 'Maintained 7-day learning streak', 'learning_consistency'::public.achievement_category, '🔥', 150, 75, 7);
        
        -- Award achievements to student
        INSERT INTO public.student_achievement_records (student_id, achievement_id, earned_at)
        VALUES
            (v_student_id, v_achievement1_id, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
            (v_student_id, v_achievement2_id, CURRENT_TIMESTAMP - INTERVAL '1 day');
        
        -- Create daily missions
        INSERT INTO public.daily_missions (id, title, description, xp_reward, difficulty_level, mission_date)
        VALUES
            (v_mission1_id, 'Complete Morning Lesson', 'Finish any lesson before 12 PM', 50, 'easy'::public.difficulty_level, CURRENT_DATE),
            (v_mission2_id, 'Practice Speaking Exercise', 'Complete 3 speaking exercises', 75, 'medium'::public.difficulty_level, CURRENT_DATE);
        
        -- Track mission progress
        INSERT INTO public.student_mission_progress (student_id, mission_id, is_completed, completed_at)
        VALUES
            (v_student_id, v_mission1_id, true, CURRENT_TIMESTAMP - INTERVAL '3 hours');
        
        -- Create study calendar events (last 7 days)
        INSERT INTO public.study_calendar_events (student_id, event_date, minutes_studied, lessons_completed, xp_earned)
        SELECT 
            v_student_id,
            CURRENT_DATE - (n || ' days')::INTERVAL,
            FLOOR(RANDOM() * 60 + 30)::INTEGER,
            FLOOR(RANDOM() * 3 + 1)::INTEGER,
            FLOOR(RANDOM() * 100 + 50)::INTEGER
        FROM generate_series(0, 6) n;
        
        -- Create community guild
        INSERT INTO public.community_guilds (id, name, description, focus_language, member_count)
        VALUES
            (v_guild1_id, 'Amharic Learners Circle', 'Practice and learn Amharic together', 'Amharic', 1);
        
        -- Add student to guild
        INSERT INTO public.guild_memberships (guild_id, student_id)
        VALUES
            (v_guild1_id, v_student_id);
    ELSE
        RAISE NOTICE 'No student profiles found. Create a student account first.';
    END IF;
END $$;