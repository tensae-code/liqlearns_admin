-- Location: supabase/migrations/20251128010948_phase7_advanced_communication_ai.sql
-- Schema Analysis: Existing schema has 80 tables including user_profiles, courses, student_profiles
-- Integration Type: NEW_MODULE - Adding Phase 7 features
-- Dependencies: user_profiles, courses, student_profiles, lessons

-- ============================================
-- PHASE 7: ADVANCED COMMUNICATION & AI FEATURES
-- ============================================

-- 1. ENUMS for Phase 7
CREATE TYPE public.classroom_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled');
CREATE TYPE public.participant_role AS ENUM ('host', 'co_host', 'participant', 'observer');
CREATE TYPE public.whiteboard_tool AS ENUM ('pen', 'eraser', 'text', 'shape', 'image', 'pointer');
CREATE TYPE public.screen_share_quality AS ENUM ('low', 'medium', 'high', 'auto');
CREATE TYPE public.ai_model_type AS ENUM ('personalization', 'recommendation', 'assessment', 'content_generation');
CREATE TYPE public.learning_style AS ENUM ('visual', 'auditory', 'kinesthetic', 'reading_writing');
CREATE TYPE public.difficulty_adjustment AS ENUM ('easier', 'same', 'harder');

-- 2. VIRTUAL CLASSROOMS
CREATE TABLE public.virtual_classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    host_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status public.classroom_status DEFAULT 'scheduled'::public.classroom_status,
    max_participants INTEGER DEFAULT 100,
    recording_enabled BOOLEAN DEFAULT false,
    recording_url TEXT,
    meeting_url TEXT,
    meeting_password TEXT,
    whiteboard_enabled BOOLEAN DEFAULT true,
    screen_share_enabled BOOLEAN DEFAULT true,
    chat_enabled BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLASSROOM PARTICIPANTS
CREATE TABLE public.classroom_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.participant_role DEFAULT 'participant'::public.participant_role,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    screen_share_count INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(classroom_id, user_id)
);

-- 4. COLLABORATIVE WHITEBOARDS
CREATE TABLE public.whiteboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    canvas_data JSONB DEFAULT '{"objects":[],"background":"#ffffff"}'::JSONB,
    thumbnail_url TEXT,
    is_template BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. WHITEBOARD STROKES (for real-time collaboration)
CREATE TABLE public.whiteboard_strokes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whiteboard_id UUID REFERENCES public.whiteboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tool public.whiteboard_tool NOT NULL,
    stroke_data JSONB NOT NULL,
    color TEXT DEFAULT '#000000',
    width INTEGER DEFAULT 2,
    z_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. SCREEN SHARING SESSIONS
CREATE TABLE public.screen_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stream_id TEXT NOT NULL,
    quality public.screen_share_quality DEFAULT 'auto'::public.screen_share_quality,
    is_audio_enabled BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    viewer_count INTEGER DEFAULT 0,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. CLASSROOM CHAT
CREATE TABLE public.classroom_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID REFERENCES public.virtual_classrooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    reply_to_id UUID REFERENCES public.classroom_chat(id) ON DELETE SET NULL,
    is_question BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::JSONB,
    reactions JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. AI PERSONALIZATION ENGINES
CREATE TABLE public.ai_personalization_engines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    model_type public.ai_model_type NOT NULL,
    learning_style public.learning_style,
    preferred_pace TEXT,
    strengths JSONB DEFAULT '[]'::JSONB,
    weaknesses JSONB DEFAULT '[]'::JSONB,
    interests JSONB DEFAULT '[]'::JSONB,
    goals JSONB DEFAULT '[]'::JSONB,
    model_version TEXT DEFAULT '1.0',
    last_trained TIMESTAMPTZ,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. ADAPTIVE LEARNING PATHS
CREATE TABLE public.adaptive_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    current_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    next_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    difficulty_level INTEGER DEFAULT 1,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    estimated_completion_date DATE,
    adaptation_history JSONB DEFAULT '[]'::JSONB,
    performance_metrics JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- 10. AI RECOMMENDATIONS
CREATE TABLE public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    content_id UUID,
    content_type TEXT,
    title TEXT NOT NULL,
    description TEXT,
    reason TEXT,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    priority INTEGER DEFAULT 0,
    is_accepted BOOLEAN,
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. LEARNING BEHAVIOR ANALYTICS
CREATE TABLE public.learning_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    total_study_time_minutes INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    quizzes_attempted INTEGER DEFAULT 0,
    average_quiz_score DECIMAL(5,2) DEFAULT 0.00,
    videos_watched INTEGER DEFAULT 0,
    articles_read INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    peak_activity_hour INTEGER,
    engagement_level TEXT,
    focus_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, session_date)
);

-- 12. AI CONTENT SUGGESTIONS
CREATE TABLE public.ai_content_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL,
    original_content TEXT,
    suggested_content TEXT NOT NULL,
    difficulty_adjustment public.difficulty_adjustment,
    reasoning TEXT,
    ai_model TEXT,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    is_applied BOOLEAN DEFAULT false,
    applied_at TIMESTAMPTZ,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_virtual_classrooms_course_id ON public.virtual_classrooms(course_id);
CREATE INDEX idx_virtual_classrooms_host_id ON public.virtual_classrooms(host_id);
CREATE INDEX idx_virtual_classrooms_status ON public.virtual_classrooms(status);
CREATE INDEX idx_virtual_classrooms_scheduled_start ON public.virtual_classrooms(scheduled_start);

CREATE INDEX idx_classroom_participants_classroom_id ON public.classroom_participants(classroom_id);
CREATE INDEX idx_classroom_participants_user_id ON public.classroom_participants(user_id);

CREATE INDEX idx_whiteboards_classroom_id ON public.whiteboards(classroom_id);
CREATE INDEX idx_whiteboards_created_by ON public.whiteboards(created_by);

CREATE INDEX idx_whiteboard_strokes_whiteboard_id ON public.whiteboard_strokes(whiteboard_id);
CREATE INDEX idx_whiteboard_strokes_created_at ON public.whiteboard_strokes(created_at);

CREATE INDEX idx_screen_shares_classroom_id ON public.screen_shares(classroom_id);
CREATE INDEX idx_screen_shares_user_id ON public.screen_shares(user_id);

CREATE INDEX idx_classroom_chat_classroom_id ON public.classroom_chat(classroom_id);
CREATE INDEX idx_classroom_chat_user_id ON public.classroom_chat(user_id);
CREATE INDEX idx_classroom_chat_is_question ON public.classroom_chat(is_question);

CREATE INDEX idx_ai_personalization_student_id ON public.ai_personalization_engines(student_id);
CREATE INDEX idx_ai_personalization_model_type ON public.ai_personalization_engines(model_type);

CREATE INDEX idx_adaptive_paths_student_id ON public.adaptive_learning_paths(student_id);
CREATE INDEX idx_adaptive_paths_course_id ON public.adaptive_learning_paths(course_id);

CREATE INDEX idx_ai_recommendations_student_id ON public.ai_recommendations(student_id);
CREATE INDEX idx_ai_recommendations_content_type ON public.ai_recommendations(content_type);
CREATE INDEX idx_ai_recommendations_expires_at ON public.ai_recommendations(expires_at);

CREATE INDEX idx_learning_behavior_student_id ON public.learning_behavior_analytics(student_id);
CREATE INDEX idx_learning_behavior_session_date ON public.learning_behavior_analytics(session_date);

CREATE INDEX idx_ai_suggestions_student_id ON public.ai_content_suggestions(student_id);
CREATE INDEX idx_ai_suggestions_lesson_id ON public.ai_content_suggestions(lesson_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update classroom duration
CREATE OR REPLACE FUNCTION public.update_classroom_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF NEW.actual_end IS NOT NULL AND NEW.actual_start IS NOT NULL THEN
        UPDATE public.classroom_participants
        SET duration_seconds = EXTRACT(EPOCH FROM (NEW.actual_end - NEW.actual_start))::INTEGER
        WHERE classroom_id = NEW.id
        AND left_at IS NULL;
    END IF;
    RETURN NEW;
END;
$func$;

-- Function to update adaptive learning metrics
CREATE OR REPLACE FUNCTION public.update_adaptive_learning_metrics(
    p_student_id UUID,
    p_course_id UUID,
    p_performance_score DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_current_difficulty INTEGER;
    v_new_difficulty INTEGER;
BEGIN
    SELECT difficulty_level INTO v_current_difficulty
    FROM public.adaptive_learning_paths
    WHERE student_id = p_student_id AND course_id = p_course_id;

    IF p_performance_score >= 90 THEN
        v_new_difficulty := LEAST(v_current_difficulty + 1, 10);
    ELSIF p_performance_score < 70 THEN
        v_new_difficulty := GREATEST(v_current_difficulty - 1, 1);
    ELSE
        v_new_difficulty := v_current_difficulty;
    END IF;

    UPDATE public.adaptive_learning_paths
    SET 
        difficulty_level = v_new_difficulty,
        performance_metrics = jsonb_set(
            COALESCE(performance_metrics, '{}'::JSONB),
            '{last_score}',
            to_jsonb(p_performance_score)
        ),
        adaptation_history = COALESCE(adaptation_history, '[]'::JSONB) || 
            jsonb_build_object(
                'timestamp', CURRENT_TIMESTAMP,
                'old_difficulty', v_current_difficulty,
                'new_difficulty', v_new_difficulty,
                'trigger_score', p_performance_score
            ),
        updated_at = CURRENT_TIMESTAMP
    WHERE student_id = p_student_id AND course_id = p_course_id;
END;
$func$;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.virtual_classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_personalization_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_suggestions ENABLE ROW LEVEL SECURITY;

-- Virtual Classrooms - Teachers can manage, students can view
CREATE POLICY "teachers_manage_virtual_classrooms"
ON public.virtual_classrooms
FOR ALL
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

CREATE POLICY "students_view_enrolled_classrooms"
ON public.virtual_classrooms
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        WHERE ce.course_id = virtual_classrooms.course_id
        AND ce.student_id = auth.uid()
    )
);

-- Classroom Participants - Users manage their own participation
CREATE POLICY "users_manage_own_classroom_participation"
ON public.classroom_participants
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Whiteboards - Classroom participants can access
CREATE POLICY "classroom_participants_access_whiteboards"
ON public.whiteboards
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.classroom_participants cp
        WHERE cp.classroom_id = whiteboards.classroom_id
        AND cp.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.classroom_participants cp
        WHERE cp.classroom_id = whiteboards.classroom_id
        AND cp.user_id = auth.uid()
    )
);

-- Whiteboard Strokes - Classroom participants can draw
CREATE POLICY "classroom_participants_manage_strokes"
ON public.whiteboard_strokes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Screen Shares - Users manage their own shares
CREATE POLICY "users_manage_own_screen_shares"
ON public.screen_shares
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Classroom Chat - Participants can send messages
CREATE POLICY "classroom_participants_manage_chat"
ON public.classroom_chat
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- AI Personalization - Students access their own data
CREATE POLICY "students_manage_own_ai_personalization"
ON public.ai_personalization_engines
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Adaptive Learning Paths - Students access their own paths
CREATE POLICY "students_manage_own_learning_paths"
ON public.adaptive_learning_paths
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- AI Recommendations - Students view their recommendations
CREATE POLICY "students_view_own_recommendations"
ON public.ai_recommendations
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Learning Behavior Analytics - Students access their analytics
CREATE POLICY "students_view_own_behavior_analytics"
ON public.learning_behavior_analytics
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- AI Content Suggestions - Students view suggestions
CREATE POLICY "students_view_content_suggestions"
ON public.ai_content_suggestions
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_classroom_duration_trigger
AFTER UPDATE OF actual_end ON public.virtual_classrooms
FOR EACH ROW
EXECUTE FUNCTION public.update_classroom_duration();

-- ============================================
-- MOCK DATA
-- ============================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_student_id UUID;
    v_course_id UUID;
    v_lesson_id UUID;
    v_classroom_id UUID;
    v_whiteboard_id UUID;
BEGIN
    -- Get existing IDs
    SELECT id INTO v_teacher_id FROM public.user_profiles WHERE role = 'teacher' LIMIT 1;
    SELECT id INTO v_student_id FROM public.student_profiles LIMIT 1;
    SELECT id INTO v_course_id FROM public.courses LIMIT 1;
    SELECT id INTO v_lesson_id FROM public.lessons LIMIT 1;

    -- Create virtual classroom
    INSERT INTO public.virtual_classrooms (
        id, course_id, lesson_id, host_id, title, description,
        scheduled_start, scheduled_end, status, recording_enabled
    ) VALUES (
        gen_random_uuid(),
        v_course_id,
        v_lesson_id,
        v_teacher_id,
        'Introduction to Advanced Communication',
        'Learn about virtual classrooms and collaborative tools',
        CURRENT_TIMESTAMP + INTERVAL '1 day',
        CURRENT_TIMESTAMP + INTERVAL '1 day 1 hour',
        'scheduled'::public.classroom_status,
        true
    ) RETURNING id INTO v_classroom_id;

    -- Add classroom participant
    IF v_student_id IS NOT NULL THEN
        INSERT INTO public.classroom_participants (
            classroom_id, user_id, role
        ) VALUES (
            v_classroom_id,
            v_student_id,
            'participant'::public.participant_role
        );

        -- Create whiteboard
        INSERT INTO public.whiteboards (
            id, classroom_id, created_by, title, description
        ) VALUES (
            gen_random_uuid(),
            v_classroom_id,
            v_teacher_id,
            'Lesson Whiteboard',
            'Interactive whiteboard for collaborative learning'
        ) RETURNING id INTO v_whiteboard_id;

        -- Create AI personalization engine
        INSERT INTO public.ai_personalization_engines (
            student_id, model_type, learning_style, confidence_score
        ) VALUES (
            v_student_id,
            'personalization'::public.ai_model_type,
            'visual'::public.learning_style,
            85.50
        );

        -- Create adaptive learning path
        INSERT INTO public.adaptive_learning_paths (
            student_id, course_id, current_lesson_id, difficulty_level,
            completion_percentage
        ) VALUES (
            v_student_id,
            v_course_id,
            v_lesson_id,
            3,
            25.00
        );

        -- Create AI recommendation
        INSERT INTO public.ai_recommendations (
            student_id, recommendation_type, title, description,
            reason, confidence_score
        ) VALUES (
            v_student_id,
            'content',
            'Advanced Math Concepts',
            'Based on your progress, this course will help you master advanced topics',
            'Strong performance in prerequisite courses',
            92.30
        );
    END IF;
END $$;