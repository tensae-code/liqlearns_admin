-- Location: supabase/migrations/20251218184500_life_progress_imbalance_suggestions.sql
-- Schema Analysis: Building upon existing life_progress_entries, daily_missions, student_mission_progress
-- Integration Type: Extension - adding imbalance analysis and suggestion features
-- Dependencies: life_progress_entries, daily_missions, student_profiles

-- 1. Extend daily_missions table to support category-specific missions
ALTER TABLE public.daily_missions
ADD COLUMN IF NOT EXISTS category public.life_category DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_suggestion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suggestion_reason TEXT DEFAULT NULL;

-- Create index for category-filtered queries
CREATE INDEX IF NOT EXISTS idx_daily_missions_category ON public.daily_missions(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_missions_suggestions ON public.daily_missions(is_suggestion) WHERE is_suggestion = true;

-- 2. Create life_progress_suggestions table for AI-generated personalized suggestions
CREATE TABLE IF NOT EXISTS public.life_progress_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    category public.life_category NOT NULL,
    suggestion_text TEXT NOT NULL,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('daily_mission', 'weekly_goal', 'habit_change', 'resource')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    based_on_score INTEGER NOT NULL CHECK (based_on_score BETWEEN 1 AND 100),
    is_active BOOLEAN DEFAULT true,
    applied_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient querying
CREATE INDEX idx_life_progress_suggestions_student ON public.life_progress_suggestions(student_id);
CREATE INDEX idx_life_progress_suggestions_category ON public.life_progress_suggestions(category);
CREATE INDEX idx_life_progress_suggestions_active ON public.life_progress_suggestions(is_active) WHERE is_active = true;
CREATE INDEX idx_life_progress_suggestions_expires ON public.life_progress_suggestions(expires_at);

-- 3. Enable RLS
ALTER TABLE public.life_progress_suggestions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "students_manage_own_life_suggestions"
ON public.life_progress_suggestions
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- 5. Function to detect imbalanced categories (below 50 threshold)
CREATE OR REPLACE FUNCTION public.get_imbalanced_categories(
    p_student_id UUID,
    p_threshold INTEGER DEFAULT 50,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
    category public.life_category,
    average_score NUMERIC,
    latest_score INTEGER,
    imbalance_severity TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    RETURN QUERY
    WITH category_averages AS (
        SELECT 
            lpe.category,
            COALESCE(AVG(lpe.satisfaction_score), 0)::NUMERIC AS avg_score,
            (
                SELECT satisfaction_score 
                FROM public.life_progress_entries 
                WHERE student_id = p_student_id 
                AND category = lpe.category
                ORDER BY entry_date DESC 
                LIMIT 1
            ) AS last_score
        FROM public.life_progress_entries lpe
        WHERE lpe.student_id = p_student_id
        AND lpe.entry_date >= (CURRENT_DATE - p_days)
        GROUP BY lpe.category
    )
    SELECT 
        ca.category,
        ca.avg_score,
        COALESCE(ca.last_score, 0) AS latest_score,
        CASE 
            WHEN ca.avg_score < 30 THEN 'critical'
            WHEN ca.avg_score < 50 THEN 'moderate'
            WHEN ca.avg_score < 70 THEN 'mild'
            ELSE 'balanced'
        END AS imbalance_severity
    FROM category_averages ca
    WHERE ca.avg_score < p_threshold
    ORDER BY ca.avg_score ASC;
END;
$func$;

-- 6. Function to generate category-specific mission suggestions
CREATE OR REPLACE FUNCTION public.generate_life_category_suggestions(
    p_student_id UUID,
    p_category public.life_category,
    p_current_score INTEGER
)
RETURNS TABLE(
    suggestion_text TEXT,
    suggestion_type TEXT,
    priority INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    -- Generate suggestions based on category and score
    RETURN QUERY
    SELECT 
        sugg.text AS suggestion_text,
        sugg.type AS suggestion_type,
        sugg.priority_level AS priority
    FROM (
        -- Spiritual suggestions
        SELECT 
            CASE p_current_score
                WHEN p_current_score < 30 THEN 'Start with 5 minutes of meditation or prayer daily'
                WHEN p_current_score < 50 THEN 'Dedicate 15 minutes to spiritual reflection'
                WHEN p_current_score < 70 THEN 'Explore a new spiritual practice or teaching'
                ELSE 'Share your spiritual insights with others'
            END AS text,
            'daily_mission' AS type,
            CASE 
                WHEN p_current_score < 30 THEN 5
                WHEN p_current_score < 50 THEN 4
                ELSE 3
            END AS priority_level
        WHERE p_category = 'spiritual'
        
        UNION ALL
        
        -- Health suggestions
        SELECT 
            CASE p_current_score
                WHEN p_current_score < 30 THEN 'Take a 10-minute walk today'
                WHEN p_current_score < 50 THEN 'Exercise for 30 minutes'
                WHEN p_current_score < 70 THEN 'Try a new physical activity'
                ELSE 'Maintain your fitness routine and set new goals'
            END AS text,
            'daily_mission' AS type,
            CASE 
                WHEN p_current_score < 30 THEN 5
                WHEN p_current_score < 50 THEN 4
                ELSE 3
            END AS priority_level
        WHERE p_category = 'health'
        
        UNION ALL
        
        -- Wealth suggestions
        SELECT 
            CASE p_current_score
                WHEN p_current_score < 30 THEN 'Review your monthly budget and track expenses'
                WHEN p_current_score < 50 THEN 'Set one financial goal for this month'
                WHEN p_current_score < 70 THEN 'Learn about one investment opportunity'
                ELSE 'Review and optimize your financial portfolio'
            END AS text,
            'daily_mission' AS type,
            CASE 
                WHEN p_current_score < 30 THEN 5
                WHEN p_current_score < 50 THEN 4
                ELSE 3
            END AS priority_level
        WHERE p_category = 'wealth'
        
        UNION ALL
        
        -- Service suggestions
        SELECT 
            CASE p_current_score
                WHEN p_current_score < 30 THEN 'Perform one random act of kindness today'
                WHEN p_current_score < 50 THEN 'Volunteer 1 hour for a cause you care about'
                WHEN p_current_score < 70 THEN 'Organize a small community service activity'
                ELSE 'Mentor someone in need of guidance'
            END AS text,
            'daily_mission' AS type,
            CASE 
                WHEN p_current_score < 30 THEN 5
                WHEN p_current_score < 50 THEN 4
                ELSE 3
            END AS priority_level
        WHERE p_category = 'service'
        
        UNION ALL
        
        -- Education suggestions
        SELECT 
            CASE p_current_score
                WHEN p_current_score < 30 THEN 'Read for 15 minutes on a topic of interest'
                WHEN p_current_score < 50 THEN 'Complete one online course lesson'
                WHEN p_current_score < 70 THEN 'Teach someone something you know'
                ELSE 'Share your learning journey on social media'
            END AS text,
            'daily_mission' AS type,
            CASE 
                WHEN p_current_score < 30 THEN 5
                WHEN p_current_score < 50 THEN 4
                ELSE 3
            END AS priority_level
        WHERE p_category = 'education'
        
        UNION ALL
        
        -- Family suggestions
        SELECT 
            CASE p_current_score
                WHEN p_current_score < 30 THEN 'Call a family member and have a meaningful conversation'
                WHEN p_current_score < 50 THEN 'Plan a family activity for this week'
                WHEN p_current_score < 70 THEN 'Create a new family tradition'
                ELSE 'Document a family memory or story'
            END AS text,
            'daily_mission' AS type,
            CASE 
                WHEN p_current_score < 30 THEN 5
                WHEN p_current_score < 50 THEN 4
                ELSE 3
            END AS priority_level
        WHERE p_category = 'family'
        
        UNION ALL
        
        -- Social suggestions
        SELECT 
            CASE p_current_score
                WHEN p_current_score < 30 THEN 'Reach out to an old friend'
                WHEN p_current_score < 50 THEN 'Attend a social event or join a club'
                WHEN p_current_score < 70 THEN 'Organize a get-together with friends'
                ELSE 'Expand your social circle by meeting new people'
            END AS text,
            'daily_mission' AS type,
            CASE 
                WHEN p_current_score < 30 THEN 5
                WHEN p_current_score < 50 THEN 4
                ELSE 3
            END AS priority_level
        WHERE p_category = 'social'
    ) AS sugg;
END;
$func$;

-- 7. Function to auto-generate suggestions for imbalanced categories
CREATE OR REPLACE FUNCTION public.auto_generate_life_suggestions(
    p_student_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_category_record RECORD;
    v_suggestion_record RECORD;
    v_count INTEGER := 0;
BEGIN
    -- Clean up expired suggestions
    DELETE FROM public.life_progress_suggestions
    WHERE student_id = p_student_id
    AND expires_at < CURRENT_TIMESTAMP;
    
    -- Generate suggestions for each imbalanced category
    FOR v_category_record IN 
        SELECT category, average_score::INTEGER, latest_score
        FROM public.get_imbalanced_categories(p_student_id, 50, 7)
    LOOP
        -- Generate suggestions for this category
        FOR v_suggestion_record IN
            SELECT suggestion_text, suggestion_type, priority
            FROM public.generate_life_category_suggestions(
                p_student_id,
                v_category_record.category,
                v_category_record.latest_score
            )
        LOOP
            -- Insert suggestion if it does not already exist
            INSERT INTO public.life_progress_suggestions (
                student_id,
                category,
                suggestion_text,
                suggestion_type,
                priority,
                based_on_score,
                is_active,
                created_at,
                expires_at
            )
            VALUES (
                p_student_id,
                v_category_record.category,
                v_suggestion_record.suggestion_text,
                v_suggestion_record.suggestion_type,
                v_suggestion_record.priority,
                v_category_record.latest_score,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP + INTERVAL '7 days'
            )
            ON CONFLICT DO NOTHING;
            
            v_count := v_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN v_count;
END;
$func$;

-- 8. Add sample category-specific missions
DO $$
DECLARE
    v_mission_id UUID;
BEGIN
    -- Spiritual missions
    INSERT INTO public.daily_missions (title, description, category, difficulty_level, xp_reward, is_active)
    VALUES
        ('Morning Meditation', 'Practice 10 minutes of mindfulness meditation', 'spiritual', 'easy', 50, true),
        ('Gratitude Journal', 'Write 3 things you are grateful for today', 'spiritual', 'easy', 40, true),
        ('Spiritual Reading', 'Read inspiring spiritual content for 15 minutes', 'spiritual', 'medium', 75, true)
    ON CONFLICT DO NOTHING;
    
    -- Health missions
    INSERT INTO public.daily_missions (title, description, category, difficulty_level, xp_reward, is_active)
    VALUES
        ('Daily Walk', 'Take a 30-minute walk outdoors', 'health', 'easy', 60, true),
        ('Healthy Meal', 'Prepare and eat a nutritious meal', 'health', 'medium', 70, true),
        ('Workout Session', 'Complete a 45-minute workout routine', 'health', 'hard', 100, true)
    ON CONFLICT DO NOTHING;
    
    -- Wealth missions
    INSERT INTO public.daily_missions (title, description, category, difficulty_level, xp_reward, is_active)
    VALUES
        ('Budget Review', 'Review and update your monthly budget', 'wealth', 'medium', 80, true),
        ('Financial Learning', 'Learn about one new investment concept', 'wealth', 'medium', 70, true),
        ('Expense Tracking', 'Track all expenses for the day', 'wealth', 'easy', 50, true)
    ON CONFLICT DO NOTHING;
    
    -- Service missions
    INSERT INTO public.daily_missions (title, description, category, difficulty_level, xp_reward, is_active)
    VALUES
        ('Random Act of Kindness', 'Perform one unexpected act of kindness', 'service', 'easy', 60, true),
        ('Community Help', 'Help a neighbor or community member', 'service', 'medium', 75, true),
        ('Volunteer Time', 'Spend 1 hour volunteering for a cause', 'service', 'hard', 100, true)
    ON CONFLICT DO NOTHING;
    
    -- Education missions
    INSERT INTO public.daily_missions (title, description, category, difficulty_level, xp_reward, is_active)
    VALUES
        ('Read and Learn', 'Read for 30 minutes on a topic of interest', 'education', 'easy', 50, true),
        ('Complete Lesson', 'Finish one online course lesson', 'education', 'medium', 80, true),
        ('Teach Others', 'Share knowledge by teaching someone', 'education', 'medium', 85, true)
    ON CONFLICT DO NOTHING;
    
    -- Family missions
    INSERT INTO public.daily_missions (title, description, category, difficulty_level, xp_reward, is_active)
    VALUES
        ('Family Call', 'Have a meaningful conversation with family', 'family', 'easy', 55, true),
        ('Quality Time', 'Spend uninterrupted time with family', 'family', 'medium', 75, true),
        ('Family Activity', 'Organize a fun family activity', 'family', 'hard', 90, true)
    ON CONFLICT DO NOTHING;
    
    -- Social missions
    INSERT INTO public.daily_missions (title, description, category, difficulty_level, xp_reward, is_active)
    VALUES
        ('Connect with Friend', 'Reach out to a friend you have not talked to recently', 'social', 'easy', 50, true),
        ('Social Event', 'Attend a social gathering or meetup', 'social', 'medium', 70, true),
        ('Host Gathering', 'Organize a get-together with friends', 'social', 'hard', 95, true)
    ON CONFLICT DO NOTHING;
END $$;

-- 9. Comment on new objects
COMMENT ON TABLE public.life_progress_suggestions IS 'Stores AI-generated personalized suggestions for improving life progress in low-scoring categories';
COMMENT ON COLUMN public.life_progress_suggestions.suggestion_type IS 'Type of suggestion: daily_mission, weekly_goal, habit_change, or resource';
COMMENT ON COLUMN public.life_progress_suggestions.priority IS 'Priority level from 1 (lowest) to 5 (highest)';
COMMENT ON COLUMN public.life_progress_suggestions.based_on_score IS 'The satisfaction score that triggered this suggestion';

COMMENT ON FUNCTION public.get_imbalanced_categories IS 'Identifies life categories with satisfaction scores below threshold for targeted improvement';
COMMENT ON FUNCTION public.generate_life_category_suggestions IS 'Generates personalized mission suggestions based on category and current satisfaction score';
COMMENT ON FUNCTION public.auto_generate_life_suggestions IS 'Automatically generates suggestions for all imbalanced categories for a student';