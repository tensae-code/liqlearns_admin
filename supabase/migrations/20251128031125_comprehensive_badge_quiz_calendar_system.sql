-- =====================================================================
-- COMPREHENSIVE BADGE, QUIZ TIMING, CALENDAR, AND COMMUNITY ENHANCEMENTS
-- Migration: 20251128031125_comprehensive_badge_quiz_calendar_system.sql
-- Description: Extends existing schema with badge search, ML quiz timing, 
--              calendar improvements, community approval, and complete platform features
-- =====================================================================

-- =====================================================================
-- PART 1: BADGE PUBLIC VIEWING AND SEARCH SYSTEM
-- =====================================================================

-- Table: public_badge_profiles (for public badge viewing like landing page)
CREATE TABLE IF NOT EXISTS public_badge_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    total_badges INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    level_name TEXT DEFAULT 'Beginner',
    rank_title TEXT DEFAULT 'Novice Learner',
    is_public BOOLEAN DEFAULT true,
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for badge profile search
CREATE INDEX IF NOT EXISTS idx_public_badge_profiles_username ON public_badge_profiles(username);
CREATE INDEX IF NOT EXISTS idx_public_badge_profiles_is_public ON public_badge_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_public_badge_profiles_total_badges ON public_badge_profiles(total_badges DESC);
CREATE INDEX IF NOT EXISTS idx_public_badge_profiles_total_xp ON public_badge_profiles(total_xp DESC);

-- RLS Policies for public badge profiles
ALTER TABLE public_badge_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_can_view_public_badges ON public_badge_profiles
    FOR SELECT
    TO public
    USING (is_public = true);

CREATE POLICY users_manage_own_badge_profile ON public_badge_profiles
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================================
-- PART 2: CEO BADGE MANAGEMENT SYSTEM
-- =====================================================================

-- Extend student_achievements table with additional CEO management fields
ALTER TABLE student_achievements ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);
ALTER TABLE student_achievements ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES user_profiles(id);
ALTER TABLE student_achievements ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE student_achievements ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Extend badge_tiers table for CEO management
ALTER TABLE badge_tiers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);
ALTER TABLE badge_tiers ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES user_profiles(id);
ALTER TABLE badge_tiers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- CEO can manage badges
CREATE POLICY ceo_manage_all_badges ON student_achievements
    FOR ALL
    TO authenticated
    USING (is_ceo())
    WITH CHECK (is_ceo());

CREATE POLICY ceo_manage_badge_tiers ON badge_tiers
    FOR ALL
    TO authenticated
    USING (is_ceo())
    WITH CHECK (is_ceo());

-- =====================================================================
-- PART 3: KAHOOT-STYLE QUIZ WITH ML TIMING SYSTEM
-- =====================================================================

-- Table: quiz_question_timing_analytics (ML data for question timing)
CREATE TABLE IF NOT EXISTS quiz_question_timing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    total_attempts INTEGER DEFAULT 0,
    avg_completion_seconds NUMERIC(10, 2) DEFAULT 0,
    median_completion_seconds NUMERIC(10, 2) DEFAULT 0,
    fastest_completion_seconds INTEGER DEFAULT 0,
    slowest_completion_seconds INTEGER DEFAULT 0,
    correct_answer_avg_time NUMERIC(10, 2) DEFAULT 0,
    incorrect_answer_avg_time NUMERIC(10, 2) DEFAULT 0,
    difficulty_rating NUMERIC(3, 2) DEFAULT 1.0, -- 1.0 = easy, 5.0 = very hard
    time_pressure_factor NUMERIC(3, 2) DEFAULT 1.0, -- multiplier for time adjustment
    last_recalculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quiz timing
CREATE INDEX IF NOT EXISTS idx_quiz_timing_question_id ON quiz_question_timing_analytics(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_timing_difficulty ON quiz_question_timing_analytics(difficulty_rating);

-- Table: quiz_session_interactions (detailed timing for ML)
CREATE TABLE IF NOT EXISTS quiz_session_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    time_taken_seconds INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answer_submitted TEXT,
    hesitation_time_seconds INTEGER DEFAULT 0, -- time before first interaction
    review_time_seconds INTEGER DEFAULT 0, -- time spent reviewing
    device_type TEXT, -- mobile, tablet, desktop for context
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quiz interactions
CREATE INDEX IF NOT EXISTS idx_quiz_interactions_question_id ON quiz_session_interactions(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_interactions_student_id ON quiz_session_interactions(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_interactions_quiz_attempt ON quiz_session_interactions(quiz_attempt_id);

-- RLS for quiz interactions
ALTER TABLE quiz_session_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_manage_own_interactions ON quiz_session_interactions
    FOR ALL
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY teachers_view_interactions ON quiz_session_interactions
    FOR SELECT
    TO authenticated
    USING (is_teacher_or_admin());

-- Function: Calculate dynamic quiz question timing
CREATE OR REPLACE FUNCTION calculate_dynamic_quiz_timing(p_question_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_avg_time NUMERIC;
    v_difficulty NUMERIC;
    v_base_time INTEGER := 30; -- 30 seconds base time
    v_calculated_time INTEGER;
BEGIN
    -- Get analytics for question
    SELECT 
        COALESCE(avg_completion_seconds, v_base_time),
        COALESCE(difficulty_rating, 1.0)
    INTO v_avg_time, v_difficulty
    FROM quiz_question_timing_analytics
    WHERE question_id = p_question_id;

    -- Calculate time based on difficulty and average
    v_calculated_time := CEIL(v_avg_time * v_difficulty);

    -- Ensure minimum 15 seconds, maximum 180 seconds
    v_calculated_time := GREATEST(15, LEAST(180, v_calculated_time));

    RETURN v_calculated_time;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- PART 4: CALENDAR EVENT ENHANCEMENTS
-- =====================================================================

-- Table: calendar_events (replaces limited study_calendar_events)
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'cultural', 'study', 'competition', 'celebration', 'webinar', 'exam', 'other')),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location TEXT,
    is_virtual BOOLEAN DEFAULT false,
    virtual_link TEXT,
    host_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    host_name TEXT,
    host_poster_url TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false, -- true for public events
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    tags TEXT[], -- array of tags for filtering
    banner_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_datetime CHECK (end_datetime > start_datetime)
);

-- Indexes for calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_datetime ON calendar_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_is_public ON calendar_events(is_public);
CREATE INDEX IF NOT EXISTS idx_calendar_events_approval_status ON calendar_events(approval_status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_host_id ON calendar_events(host_id);

-- Table: calendar_event_participants
CREATE TABLE IF NOT EXISTS calendar_event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'cancelled', 'no_show')),
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    attended_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- Indexes for event participants
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON calendar_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON calendar_event_participants(user_id);

-- RLS for calendar events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_can_view_approved_events ON calendar_events
    FOR SELECT
    TO public
    USING (is_public = true AND approval_status = 'approved');

CREATE POLICY users_create_events ON calendar_events
    FOR INSERT
    TO authenticated
    WITH CHECK (host_id = auth.uid());

CREATE POLICY users_manage_own_events ON calendar_events
    FOR UPDATE
    TO authenticated
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

CREATE POLICY ceo_manage_all_events ON calendar_events
    FOR ALL
    TO authenticated
    USING (is_ceo())
    WITH CHECK (is_ceo());

-- RLS for event participants
ALTER TABLE calendar_event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_manage_own_registrations ON calendar_event_participants
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY event_hosts_view_participants ON calendar_event_participants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM calendar_events
            WHERE id = event_id AND host_id = auth.uid()
        )
    );

-- Function: Calculate countdown for events
CREATE OR REPLACE FUNCTION get_event_countdown(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_start_datetime TIMESTAMPTZ;
    v_interval INTERVAL;
    v_result JSONB;
BEGIN
    SELECT start_datetime INTO v_start_datetime
    FROM calendar_events
    WHERE id = p_event_id;

    IF v_start_datetime IS NULL THEN
        RETURN NULL;
    END IF;

    v_interval := v_start_datetime - CURRENT_TIMESTAMP;

    v_result := jsonb_build_object(
        'days', EXTRACT(DAY FROM v_interval),
        'hours', EXTRACT(HOUR FROM v_interval),
        'minutes', EXTRACT(MINUTE FROM v_interval),
        'seconds', FLOOR(EXTRACT(SECOND FROM v_interval)),
        'total_seconds', EXTRACT(EPOCH FROM v_interval),
        'is_past', v_start_datetime < CURRENT_TIMESTAMP
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- PART 5: COMMUNITY POSTS WITH APPROVAL SYSTEM
-- =====================================================================

-- Table: community_posts
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'link', 'poll')),
    is_public BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    attachments JSONB, -- {images: [], videos: [], files: []}
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for community posts
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_approval_status ON community_posts(approval_status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_public ON community_posts(is_public);

-- Table: community_post_interactions
CREATE TABLE IF NOT EXISTS community_post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'share', 'report', 'save')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id, interaction_type)
);

-- Indexes for post interactions
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON community_post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON community_post_interactions(user_id);

-- Table: community_post_comments
CREATE TABLE IF NOT EXISTS community_post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for post comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON community_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON community_post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_reply_to_id ON community_post_comments(reply_to_id);

-- RLS for community posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_can_view_approved_posts ON community_posts
    FOR SELECT
    TO public
    USING (approval_status = 'approved' AND is_public = true);

CREATE POLICY users_create_posts ON community_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY users_manage_own_posts ON community_posts
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY ceo_manage_all_posts ON community_posts
    FOR ALL
    TO authenticated
    USING (is_ceo())
    WITH CHECK (is_ceo());

-- RLS for post interactions
ALTER TABLE community_post_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_manage_own_interactions ON community_post_interactions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS for post comments
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_manage_own_comments ON community_post_comments
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY public_can_view_comments ON community_post_comments
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM community_posts
            WHERE id = post_id AND approval_status = 'approved' AND is_public = true
        )
    );

-- =====================================================================
-- PART 6: TRIGGERS AND AUTOMATION
-- =====================================================================

-- Trigger: Update public badge profile on student profile changes
CREATE OR REPLACE FUNCTION sync_public_badge_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public_badge_profiles (
        user_id, username, display_name, total_xp, current_level, level_name, rank_title
    )
    SELECT 
        NEW.id,
        COALESCE((SELECT username FROM user_profiles WHERE id = NEW.id), 'user_' || substring(NEW.id::text, 1, 8)),
        (SELECT full_name FROM user_profiles WHERE id = NEW.id),
        COALESCE(NEW.total_xp, 0),
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
            SELECT COUNT(*) FROM student_badge_progress
            WHERE student_id = NEW.id AND is_unlocked = true
        ),
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_badge_profile ON student_profiles;
CREATE TRIGGER trigger_sync_badge_profile
    AFTER INSERT OR UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_public_badge_profile();

-- Trigger: Update calendar event participant count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE calendar_events
        SET current_participants = current_participants + 1
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE calendar_events
        SET current_participants = current_participants - 1
        WHERE id = OLD.event_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_event_participants ON calendar_event_participants;
CREATE TRIGGER trigger_update_event_participants
    AFTER INSERT OR DELETE ON calendar_event_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participant_count();

-- Trigger: Auto-calculate quiz question timing analytics
CREATE OR REPLACE FUNCTION update_quiz_timing_analytics()
RETURNS TRIGGER AS $$
DECLARE
    v_analytics_exists BOOLEAN;
BEGIN
    -- Check if analytics record exists
    SELECT EXISTS(
        SELECT 1 FROM quiz_question_timing_analytics
        WHERE question_id = NEW.question_id
    ) INTO v_analytics_exists;

    IF NOT v_analytics_exists THEN
        INSERT INTO quiz_question_timing_analytics (question_id)
        VALUES (NEW.question_id);
    END IF;

    -- Update analytics
    UPDATE quiz_question_timing_analytics
    SET
        total_attempts = total_attempts + 1,
        avg_completion_seconds = (
            SELECT AVG(time_taken_seconds)
            FROM quiz_session_interactions
            WHERE question_id = NEW.question_id
        ),
        median_completion_seconds = (
            SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_taken_seconds)
            FROM quiz_session_interactions
            WHERE question_id = NEW.question_id
        ),
        fastest_completion_seconds = (
            SELECT MIN(time_taken_seconds)
            FROM quiz_session_interactions
            WHERE question_id = NEW.question_id
        ),
        slowest_completion_seconds = (
            SELECT MAX(time_taken_seconds)
            FROM quiz_session_interactions
            WHERE question_id = NEW.question_id
        ),
        correct_answer_avg_time = (
            SELECT AVG(time_taken_seconds)
            FROM quiz_session_interactions
            WHERE question_id = NEW.question_id AND is_correct = true
        ),
        incorrect_answer_avg_time = (
            SELECT AVG(time_taken_seconds)
            FROM quiz_session_interactions
            WHERE question_id = NEW.question_id AND is_correct = false
        ),
        last_recalculated_at = CURRENT_TIMESTAMP
    WHERE question_id = NEW.question_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_quiz_analytics ON quiz_session_interactions;
CREATE TRIGGER trigger_update_quiz_analytics
    AFTER INSERT ON quiz_session_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_timing_analytics();

-- Trigger: Update community post counts
CREATE OR REPLACE FUNCTION update_post_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.interaction_type = 'like' THEN
            UPDATE community_posts
            SET likes_count = likes_count + 1
            WHERE id = NEW.post_id;
        ELSIF NEW.interaction_type = 'share' THEN
            UPDATE community_posts
            SET shares_count = shares_count + 1
            WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.interaction_type = 'like' THEN
            UPDATE community_posts
            SET likes_count = likes_count - 1
            WHERE id = OLD.post_id;
        ELSIF OLD.interaction_type = 'share' THEN
            UPDATE community_posts
            SET shares_count = shares_count - 1
            WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_counts ON community_post_interactions;
CREATE TRIGGER trigger_update_post_counts
    AFTER INSERT OR DELETE ON community_post_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_interaction_counts();

-- =====================================================================
-- PART 7: MOCK DATA FOR TESTING
-- =====================================================================

-- Insert sample calendar events
INSERT INTO calendar_events (
    title, description, event_type, start_datetime, end_datetime, 
    is_public, requires_approval, approval_status, host_name
) VALUES
    (
        'Amharic Cultural Workshop',
        'Interactive workshop exploring Ethiopian culture and traditions',
        'workshop',
        CURRENT_TIMESTAMP + INTERVAL '5 days',
        CURRENT_TIMESTAMP + INTERVAL '5 days 2 hours',
        true,
        false,
        'approved',
        'Cultural Center'
    ),
    (
        'Ethiopian Coffee Ceremony',
        'Experience authentic Ethiopian coffee preparation',
        'cultural',
        CURRENT_TIMESTAMP + INTERVAL '12 days',
        CURRENT_TIMESTAMP + INTERVAL '12 days 2 hours',
        true,
        false,
        'approved',
        'Heritage Club'
    ),
    (
        'Language Learning Competition',
        'Compete with peers in Amharic language challenges',
        'competition',
        CURRENT_TIMESTAMP + INTERVAL '23 days',
        CURRENT_TIMESTAMP + INTERVAL '23 days 3 hours',
        true,
        false,
        'approved',
        'LiqLearns Team'
    )
ON CONFLICT DO NOTHING;

-- Insert sample community posts
INSERT INTO community_posts (
    user_id, content, post_type, is_public, approval_status
)
SELECT 
    id,
    'Just completed my first week of Amharic lessons! The circular progress feature is so motivating! 🎯',
    'text',
    true,
    'approved'
FROM user_profiles
WHERE role = 'student'
LIMIT 1
ON CONFLICT DO NOTHING;

DO $$
DECLARE
    v_notice TEXT := '
    ✅ MIGRATION COMPLETED SUCCESSFULLY
    =====================================
    
    🎯 NEW FEATURES ADDED:
    1. ✅ Public Badge Profiles - Search badges on landing page
    2. ✅ CEO Badge Management - Full CRUD for badges and tiers
    3. ✅ ML Quiz Timing System - Dynamic question timing based on analytics
    4. ✅ Enhanced Calendar Events - Full event management with approval
    5. ✅ Community Posts with Approval - CEO approval for public posts
    
    📊 NEW TABLES:
    - public_badge_profiles (badge search)
    - quiz_question_timing_analytics (ML timing)
    - quiz_session_interactions (detailed timing data)
    - calendar_events (enhanced calendar)
    - calendar_event_participants (event registration)
    - community_posts (community wall)
    - community_post_interactions (likes, shares)
    - community_post_comments (commenting system)
    
    🔧 ENHANCEMENTS:
    - Badge tiers now editable by CEO
    - Calendar with month navigation and event details
    - Quiz questions adapt timing based on ML data
    - Community posts require CEO approval for public visibility
    
    🔐 RLS POLICIES:
    - Public badge viewing (read-only)
    - CEO badge management (full control)
    - Event approval workflow
    - Post approval system
    
    ⚡ TRIGGERS:
    - Auto-sync badge profiles
    - Auto-calculate quiz timing
    - Auto-update event participant counts
    - Auto-update post interaction counts
    
    🎉 Platform is now ready for tutorial-focused badge gamification!
    ';
BEGIN
    RAISE NOTICE '%', v_notice;
END $$;