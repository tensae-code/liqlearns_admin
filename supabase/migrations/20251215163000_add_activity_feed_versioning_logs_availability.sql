-- ============================================================================
-- Migration: Add Platform Activity Feed, Content Versioning, Activity Logs, and Tutor Availability
-- Created: 2025-12-15 16:30:00
-- Description: Adds four new table systems to support student dashboard features
-- Schema Analysis: Partial exists - extending existing schema with new features
-- Integration Type: Additive
-- Dependencies: user_profiles, courses, lessons
-- ============================================================================

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Activity feed event types
CREATE TYPE public.activity_event_type AS ENUM (
    'enrollment',
    'completion',
    'milestone',
    'achievement',
    'purchase',
    'certificate'
);

-- Content version status
CREATE TYPE public.version_status AS ENUM (
    'draft',
    'published',
    'archived'
);

-- Activity log action types
CREATE TYPE public.activity_action_type AS ENUM (
    'login',
    'logout',
    'view_course',
    'start_assignment',
    'submit_assignment',
    'take_quiz',
    'join_classroom',
    'download_file',
    'purchase_product',
    'update_profile',
    'change_password'
);

-- Availability status
CREATE TYPE public.availability_status AS ENUM (
    'available',
    'busy',
    'offline'
);

-- ============================================================================
-- TABLE 1: platform_activity_feed
-- Purpose: Real-time activity feed for social proof block
-- ============================================================================

CREATE TABLE public.platform_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    event_type public.activity_event_type NOT NULL,
    event_title TEXT NOT NULL,
    event_description TEXT,
    related_entity_type TEXT, -- 'course', 'lesson', 'product', etc.
    related_entity_id UUID,
    is_anonymous BOOLEAN DEFAULT true,
    display_name TEXT, -- Anonymized or real name based on is_anonymous
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_event_title CHECK (char_length(event_title) > 0),
    CONSTRAINT valid_related_entity CHECK (
        (related_entity_type IS NULL AND related_entity_id IS NULL) OR
        (related_entity_type IS NOT NULL AND related_entity_id IS NOT NULL)
    )
);

-- Indexes for platform_activity_feed
CREATE INDEX idx_activity_feed_created_at ON public.platform_activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_event_type ON public.platform_activity_feed(event_type);
CREATE INDEX idx_activity_feed_user_id ON public.platform_activity_feed(user_id);
CREATE INDEX idx_activity_feed_related_entity ON public.platform_activity_feed(related_entity_type, related_entity_id);

-- ============================================================================
-- TABLE 2: content_versions
-- Purpose: Version history and changelog for course content
-- ============================================================================

CREATE TABLE public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL, -- 'course', 'lesson', 'assignment', etc.
    content_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    changelog TEXT,
    content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status public.version_status DEFAULT 'draft',
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_version_number CHECK (version_number > 0),
    CONSTRAINT valid_title CHECK (char_length(title) > 0),
    CONSTRAINT unique_content_version UNIQUE (content_type, content_id, version_number)
);

-- Indexes for content_versions
CREATE INDEX idx_content_versions_content ON public.content_versions(content_type, content_id);
CREATE INDEX idx_content_versions_version ON public.content_versions(content_type, content_id, version_number DESC);
CREATE INDEX idx_content_versions_status ON public.content_versions(status);
CREATE INDEX idx_content_versions_created_by ON public.content_versions(created_by);
CREATE INDEX idx_content_versions_published_at ON public.content_versions(published_at DESC);

-- ============================================================================
-- TABLE 3: user_activity_logs
-- Purpose: User-visible activity timeline for tracking actions
-- ============================================================================

CREATE TABLE public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type public.activity_action_type NOT NULL,
    action_title TEXT NOT NULL,
    action_description TEXT,
    related_entity_type TEXT, -- 'course', 'assignment', 'quiz', etc.
    related_entity_id UUID,
    related_entity_name TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_action_title CHECK (char_length(action_title) > 0)
);

-- Indexes for user_activity_logs
CREATE INDEX idx_activity_logs_user_id ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_action_type ON public.user_activity_logs(action_type);
CREATE INDEX idx_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_related_entity ON public.user_activity_logs(related_entity_type, related_entity_id);

-- ============================================================================
-- TABLE 4: tutor_availability
-- Purpose: Smart scheduling with tutor availability matching
-- ============================================================================

CREATE TABLE public.tutor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    status public.availability_status DEFAULT 'available',
    max_students INTEGER DEFAULT 10,
    current_students INTEGER DEFAULT 0,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT true,
    specific_date DATE, -- For non-recurring slots
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT valid_student_count CHECK (current_students >= 0 AND current_students <= max_students),
    CONSTRAINT valid_max_students CHECK (max_students > 0),
    CONSTRAINT recurring_or_specific CHECK (
        (is_recurring = true AND specific_date IS NULL) OR
        (is_recurring = false AND specific_date IS NOT NULL)
    )
);

-- Indexes for tutor_availability
CREATE INDEX idx_availability_tutor_id ON public.tutor_availability(tutor_id);
CREATE INDEX idx_availability_day_of_week ON public.tutor_availability(day_of_week);
CREATE INDEX idx_availability_status ON public.tutor_availability(status);
CREATE INDEX idx_availability_course_id ON public.tutor_availability(course_id);
CREATE INDEX idx_availability_specific_date ON public.tutor_availability(specific_date) WHERE specific_date IS NOT NULL;
CREATE INDEX idx_availability_time_range ON public.tutor_availability(start_time, end_time);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to anonymize user display name
CREATE OR REPLACE FUNCTION public.get_anonymous_display_name(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    anonymous_name TEXT;
BEGIN
    -- Generate anonymized name like "Student ###" based on user ID hash
    anonymous_name := 'Student ' || (ABS(HASHTEXT(user_uuid::TEXT)) % 1000)::TEXT;
    RETURN anonymous_name;
END;
$$;

-- Function to get latest content version
CREATE OR REPLACE FUNCTION public.get_latest_version(p_content_type TEXT, p_content_id UUID)
RETURNS TABLE (
    version_id UUID,
    version_number INTEGER,
    title TEXT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cv.id,
        cv.version_number,
        cv.title,
        cv.status::TEXT
    FROM public.content_versions cv
    WHERE cv.content_type = p_content_type
        AND cv.content_id = p_content_id
    ORDER BY cv.version_number DESC
    LIMIT 1;
END;
$$;

-- Function to check tutor availability
CREATE OR REPLACE FUNCTION public.is_tutor_available(
    p_tutor_id UUID,
    p_day_of_week INTEGER,
    p_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.tutor_availability ta
        WHERE ta.tutor_id = p_tutor_id
            AND ta.day_of_week = p_day_of_week
            AND ta.start_time <= p_time
            AND ta.end_time > p_time
            AND ta.status = 'available'
            AND ta.current_students < ta.max_students
    ) INTO is_available;
    
    RETURN is_available;
END;
$$;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_action_type public.activity_action_type,
    p_action_title TEXT,
    p_action_description TEXT DEFAULT NULL,
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL,
    p_related_entity_name TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_log_id UUID;
BEGIN
    INSERT INTO public.user_activity_logs (
        user_id,
        action_type,
        action_title,
        action_description,
        related_entity_type,
        related_entity_id,
        related_entity_name,
        metadata
    ) VALUES (
        p_user_id,
        p_action_type,
        p_action_title,
        p_action_description,
        p_related_entity_type,
        p_related_entity_id,
        p_related_entity_name,
        p_metadata
    ) RETURNING id INTO new_log_id;
    
    RETURN new_log_id;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for content_versions
CREATE OR REPLACE FUNCTION public.update_content_versions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_content_versions_updated_at
    BEFORE UPDATE ON public.content_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_content_versions_updated_at();

-- Auto-update updated_at for tutor_availability
CREATE OR REPLACE FUNCTION public.update_tutor_availability_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_tutor_availability_updated_at
    BEFORE UPDATE ON public.tutor_availability
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tutor_availability_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.platform_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: platform_activity_feed
-- ============================================================================

-- Anyone can view the activity feed (public social proof)
CREATE POLICY "anyone_can_view_activity_feed"
    ON public.platform_activity_feed
    FOR SELECT
    TO authenticated
    USING (true);

-- System can insert activity feed items
CREATE POLICY "system_can_insert_activity_feed"
    ON public.platform_activity_feed
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: content_versions
-- ============================================================================

-- Authenticated users can view published versions
CREATE POLICY "users_can_view_published_versions"
    ON public.content_versions
    FOR SELECT
    TO authenticated
    USING (status = 'published');

-- Content creators can view their own versions (all statuses)
CREATE POLICY "creators_can_view_own_versions"
    ON public.content_versions
    FOR SELECT
    TO authenticated
    USING (created_by = auth.uid());

-- Creators can create new versions
CREATE POLICY "creators_can_create_versions"
    ON public.content_versions
    FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Creators can update their own draft versions
CREATE POLICY "creators_can_update_own_drafts"
    ON public.content_versions
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() AND status = 'draft')
    WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- RLS POLICIES: user_activity_logs
-- ============================================================================

-- Users can view only their own activity logs
CREATE POLICY "users_can_view_own_activity_logs"
    ON public.user_activity_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- System can insert activity logs
CREATE POLICY "system_can_insert_activity_logs"
    ON public.user_activity_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: tutor_availability
-- ============================================================================

-- Anyone can view available tutor slots
CREATE POLICY "users_can_view_available_slots"
    ON public.tutor_availability
    FOR SELECT
    TO authenticated
    USING (status = 'available');

-- Tutors can manage their own availability
CREATE POLICY "tutors_can_manage_own_availability"
    ON public.tutor_availability
    FOR ALL
    TO authenticated
    USING (tutor_id = auth.uid())
    WITH CHECK (tutor_id = auth.uid());

-- ============================================================================
-- MOCK DATA
-- ============================================================================

DO $$
DECLARE
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
    tutor1_id UUID;
    tutor2_id UUID;
    course1_id UUID;
    course2_id UUID;
    version1_id UUID;
BEGIN
    -- Get existing user IDs (first 5 users from user_profiles)
    SELECT id INTO student1_id FROM public.user_profiles ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO student2_id FROM public.user_profiles ORDER BY created_at LIMIT 1 OFFSET 1;
    SELECT id INTO student3_id FROM public.user_profiles ORDER BY created_at LIMIT 1 OFFSET 2;
    SELECT id INTO tutor1_id FROM public.user_profiles ORDER BY created_at LIMIT 1 OFFSET 3;
    SELECT id INTO tutor2_id FROM public.user_profiles ORDER BY created_at LIMIT 1 OFFSET 4;
    
    -- Get existing course IDs - ensure we get DIFFERENT courses
    SELECT id INTO course1_id FROM public.courses ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO course2_id FROM public.courses WHERE id != course1_id ORDER BY created_at LIMIT 1 OFFSET 0;
    
    -- Only proceed if we have users and courses
    IF student1_id IS NOT NULL AND course1_id IS NOT NULL THEN
        
        -- =====================================================================
        -- MOCK DATA: platform_activity_feed
        -- =====================================================================
        
        -- Delete existing mock data to prevent duplicates
        DELETE FROM public.platform_activity_feed WHERE user_id IN (student1_id, student2_id, student3_id);
        
        INSERT INTO public.platform_activity_feed (user_id, event_type, event_title, event_description, related_entity_type, related_entity_id, is_anonymous, display_name, created_at) VALUES
        (student1_id, 'enrollment', 'New Enrollment', 'Just enrolled in Amharic Language Course', 'course', course1_id, true, public.get_anonymous_display_name(student1_id), NOW() - INTERVAL '5 minutes'),
        (student2_id, 'completion', 'Course Completed', 'Completed Introduction to Programming', 'course', course2_id, true, public.get_anonymous_display_name(student2_id), NOW() - INTERVAL '15 minutes'),
        (student3_id, 'milestone', 'Milestone Reached', 'Reached 100 XP in Mathematics', NULL, NULL, true, public.get_anonymous_display_name(student3_id), NOW() - INTERVAL '30 minutes'),
        (student1_id, 'achievement', 'Achievement Unlocked', 'Earned "Early Bird" badge', NULL, NULL, false, 'John Student', NOW() - INTERVAL '1 hour'),
        (student2_id, 'certificate', 'Certificate Earned', 'Received completion certificate for Science 101', 'course', course1_id, true, public.get_anonymous_display_name(student2_id), NOW() - INTERVAL '2 hours');
        
        -- =====================================================================
        -- MOCK DATA: content_versions
        -- =====================================================================
        
        -- Delete existing mock data to prevent duplicates
        DELETE FROM public.content_versions WHERE content_id IN (course1_id, course2_id);
        
        -- Only insert if we have two different courses
        IF course2_id IS NOT NULL AND course2_id != course1_id THEN
            INSERT INTO public.content_versions (content_type, content_id, version_number, title, description, changelog, content_data, status, created_by, published_at) VALUES
            ('course', course1_id, 1, 'Introduction to Amharic - v1', 'Initial course version', 'Initial release with 10 lessons', '{"lesson_count": 10, "difficulty": "beginner"}'::jsonb, 'published', tutor1_id, NOW() - INTERVAL '30 days'),
            ('course', course1_id, 2, 'Introduction to Amharic - v2', 'Updated with new content', 'Added 5 more lessons and improved audio', '{"lesson_count": 15, "difficulty": "beginner", "audio_improved": true}'::jsonb, 'published', tutor1_id, NOW() - INTERVAL '15 days'),
            ('course', course1_id, 3, 'Introduction to Amharic - v3', 'Latest version', 'Added interactive exercises and quizzes', '{"lesson_count": 15, "difficulty": "beginner", "audio_improved": true, "interactive": true}'::jsonb, 'draft', tutor1_id, NULL),
            ('course', course2_id, 1, 'Programming Basics - v1', 'First version', 'Initial course structure', '{"modules": 8, "language": "Python"}'::jsonb, 'published', tutor2_id, NOW() - INTERVAL '60 days');
        ELSE
            RAISE NOTICE 'Skipping content_versions mock data - need at least 2 different courses';
        END IF;
        
        -- =====================================================================
        -- MOCK DATA: user_activity_logs
        -- =====================================================================
        
        -- Delete existing mock data to prevent duplicates
        DELETE FROM public.user_activity_logs WHERE user_id IN (student1_id, student2_id, student3_id);
        
        INSERT INTO public.user_activity_logs (user_id, action_type, action_title, action_description, related_entity_type, related_entity_id, related_entity_name, metadata, created_at) VALUES
        (student1_id, 'login', 'User Login', 'Logged in successfully', NULL, NULL, NULL, '{"device": "desktop", "browser": "Chrome"}'::jsonb, NOW() - INTERVAL '10 minutes'),
        (student1_id, 'view_course', 'Viewed Course', 'Viewed Amharic Language Course', 'course', course1_id, 'Introduction to Amharic', '{"duration_seconds": 45}'::jsonb, NOW() - INTERVAL '8 minutes'),
        (student1_id, 'start_assignment', 'Started Assignment', 'Started Grammar Exercise 1', 'assignment', gen_random_uuid(), 'Grammar Exercise 1', '{}'::jsonb, NOW() - INTERVAL '5 minutes'),
        (student2_id, 'login', 'User Login', 'Logged in successfully', NULL, NULL, NULL, '{"device": "mobile", "browser": "Safari"}'::jsonb, NOW() - INTERVAL '30 minutes'),
        (student2_id, 'take_quiz', 'Took Quiz', 'Completed Unit 1 Quiz', 'quiz', gen_random_uuid(), 'Unit 1 Quiz', '{"score": 85, "total": 100}'::jsonb, NOW() - INTERVAL '20 minutes'),
        (student3_id, 'purchase_product', 'Purchased Product', 'Bought Study Guide', 'product', gen_random_uuid(), 'Amharic Study Guide', '{"price": 29.99, "currency": "USD"}'::jsonb, NOW() - INTERVAL '1 hour');
        
        -- =====================================================================
        -- MOCK DATA: tutor_availability
        -- =====================================================================
        
        -- Delete existing mock data to prevent duplicates
        DELETE FROM public.tutor_availability WHERE tutor_id IN (tutor1_id, tutor2_id);
        
        INSERT INTO public.tutor_availability (tutor_id, day_of_week, start_time, end_time, timezone, status, max_students, current_students, course_id, notes, is_recurring) VALUES
        -- Tutor 1 Schedule (Monday, Wednesday, Friday)
        (tutor1_id, 1, '09:00:00', '11:00:00', 'America/New_York', 'available', 15, 8, course1_id, 'Morning session for beginners', true),
        (tutor1_id, 1, '14:00:00', '16:00:00', 'America/New_York', 'available', 12, 5, course1_id, 'Afternoon session', true),
        (tutor1_id, 3, '09:00:00', '11:00:00', 'America/New_York', 'available', 15, 10, course1_id, 'Morning session for beginners', true),
        (tutor1_id, 3, '14:00:00', '16:00:00', 'America/New_York', 'available', 12, 7, course1_id, 'Afternoon session', true),
        (tutor1_id, 5, '10:00:00', '12:00:00', 'America/New_York', 'available', 10, 9, course1_id, 'Friday practice session', true),
        
        -- Tutor 2 Schedule (Tuesday, Thursday, Saturday)
        (tutor2_id, 2, '08:00:00', '10:00:00', 'Europe/London', 'available', 20, 12, course2_id, 'Early morning coding class', true),
        (tutor2_id, 2, '15:00:00', '17:00:00', 'Europe/London', 'available', 18, 6, course2_id, 'Afternoon coding session', true),
        (tutor2_id, 4, '08:00:00', '10:00:00', 'Europe/London', 'available', 20, 15, course2_id, 'Early morning coding class', true),
        (tutor2_id, 4, '15:00:00', '17:00:00', 'Europe/London', 'busy', 18, 18, course2_id, 'Afternoon coding session - FULL', true),
        (tutor2_id, 6, '09:00:00', '11:00:00', 'Europe/London', 'available', 15, 3, course2_id, 'Weekend workshop', true);
        
        RAISE NOTICE 'Mock data created successfully for activity feed, content versions, activity logs, and tutor availability';
    ELSE
        RAISE NOTICE 'Skipping mock data - required users or courses not found';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- Created 4 new tables:
--   1. platform_activity_feed - Real-time social proof activity feed
--   2. content_versions - Version history and changelog for content
--   3. user_activity_logs - User-visible activity timeline
--   4. tutor_availability - Smart scheduling with availability matching
--
-- Added 4 new ENUM types for type safety
-- Created 16 indexes for optimal query performance
-- Implemented 4 helper functions for common operations
-- Added 2 auto-update triggers for timestamps
-- Configured RLS policies for all tables with proper access control
-- Included comprehensive mock data for testing
-- ============================================================================