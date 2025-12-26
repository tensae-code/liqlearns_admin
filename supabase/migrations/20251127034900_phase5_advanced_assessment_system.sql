-- Location: supabase/migrations/20251127034900_phase5_advanced_assessment_system.sql
-- Schema Analysis: Extending existing quiz/assignment system with advanced assessment features
-- Integration Type: Extension - Adding question banks, quiz templates, rubrics, gradebook
-- Dependencies: lessons, courses, student_profiles, user_profiles, quiz_questions, quiz_attempts, assignments, assignment_submissions

-- ============================================================================
-- PHASE 5: ADVANCED ASSESSMENT SYSTEM
-- ============================================================================

-- 1. CUSTOM TYPES
-- ============================================================================

-- Quiz template types
CREATE TYPE public.quiz_template_type AS ENUM (
    'practice',
    'graded',
    'placement',
    'midterm',
    'final'
);

-- Attempt strategy types
CREATE TYPE public.attempt_strategy AS ENUM (
    'unlimited',
    'limited',
    'single_attempt',
    'timed_retake'
);

-- Rubric criteria types
CREATE TYPE public.rubric_criteria_type AS ENUM (
    'content_accuracy',
    'organization',
    'grammar',
    'creativity',
    'effort',
    'participation'
);

-- Grade scale types
CREATE TYPE public.grade_scale AS ENUM (
    'letter',      -- A, B, C, D, F
    'percentage',  -- 0-100%
    'points'       -- 0-X points
);

-- Report period types
CREATE TYPE public.report_period AS ENUM (
    'weekly',
    'monthly',
    'quarterly',
    'semester',
    'annual'
);

-- 2. CORE TABLES
-- ============================================================================

-- Question Banks - Centralized question management
CREATE TABLE public.question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tags TEXT[],
    difficulty_level public.difficulty_level NOT NULL DEFAULT 'medium'::public.difficulty_level,
    subject_area TEXT,
    is_public BOOLEAN DEFAULT false,
    total_questions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Question Bank Questions (extends quiz_questions relationship)
CREATE TABLE public.question_bank_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_bank_id, question_id)
);

-- Quiz Templates - Reusable quiz configurations
CREATE TABLE public.quiz_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    template_type public.quiz_template_type NOT NULL DEFAULT 'practice'::public.quiz_template_type,
    
    -- Quiz Settings
    time_limit_minutes INTEGER,
    passing_percentage NUMERIC(5,2) DEFAULT 70.00,
    randomize_questions BOOLEAN DEFAULT false,
    randomize_options BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT true,
    show_explanations BOOLEAN DEFAULT true,
    
    -- Attempt Settings
    attempt_strategy public.attempt_strategy NOT NULL DEFAULT 'unlimited'::public.attempt_strategy,
    max_attempts INTEGER,
    retake_delay_hours INTEGER,
    
    -- Question Configuration
    total_questions INTEGER NOT NULL DEFAULT 0,
    questions_per_attempt INTEGER,
    
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Template Questions - Links templates to question banks
CREATE TABLE public.quiz_template_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_template_id UUID REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quiz_template_id, question_id)
);

-- Enhanced Quiz Attempts (extends existing quiz_attempts)
CREATE TABLE public.quiz_attempt_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    quiz_template_id UUID REFERENCES public.quiz_templates(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    time_limit_minutes INTEGER,
    time_remaining_seconds INTEGER,
    is_timed_out BOOLEAN DEFAULT false,
    feedback TEXT,
    grade_letter TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Grading Rubrics - Detailed assessment criteria
CREATE TABLE public.grading_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 100,
    grade_scale public.grade_scale NOT NULL DEFAULT 'points'::public.grade_scale,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Rubric Criteria - Individual assessment criteria
CREATE TABLE public.rubric_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rubric_id UUID REFERENCES public.grading_rubrics(id) ON DELETE CASCADE,
    criteria_type public.rubric_criteria_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    max_points INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Rubric Criterion Levels - Performance levels for each criterion
CREATE TABLE public.rubric_criterion_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    criterion_id UUID REFERENCES public.rubric_criteria(id) ON DELETE CASCADE,
    level_name TEXT NOT NULL,
    level_description TEXT,
    points_value INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Grade Records - Comprehensive gradebook
CREATE TABLE public.grade_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    quiz_attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE SET NULL,
    rubric_id UUID REFERENCES public.grading_rubrics(id) ON DELETE SET NULL,
    
    -- Grade Information
    score NUMERIC(6,2) NOT NULL,
    max_score NUMERIC(6,2) NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    grade_letter TEXT,
    
    -- Grading Details
    graded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    feedback TEXT,
    rubric_scores JSONB,
    
    -- Metadata
    weight NUMERIC(5,2) DEFAULT 1.00,
    is_extra_credit BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Progress Reports - Student progress summaries
CREATE TABLE public.progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    period_type public.report_period NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Academic Performance
    overall_grade NUMERIC(5,2),
    grade_letter TEXT,
    attendance_percentage NUMERIC(5,2),
    lessons_completed INTEGER DEFAULT 0,
    assignments_completed INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    
    -- Skill Progress
    skill_improvements JSONB,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    
    -- Teacher Comments
    teacher_comments TEXT,
    generated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, course_id, period_type, start_date)
);

-- 3. INDEXES
-- ============================================================================

-- Question Banks
CREATE INDEX idx_question_banks_course ON public.question_banks(course_id);
CREATE INDEX idx_question_banks_creator ON public.question_banks(created_by);
CREATE INDEX idx_question_banks_tags ON public.question_banks USING gin(tags);
CREATE INDEX idx_question_banks_difficulty ON public.question_banks(difficulty_level);

-- Question Bank Items
CREATE INDEX idx_question_bank_items_bank ON public.question_bank_items(question_bank_id);
CREATE INDEX idx_question_bank_items_question ON public.question_bank_items(question_id);

-- Quiz Templates
CREATE INDEX idx_quiz_templates_course ON public.quiz_templates(course_id);
CREATE INDEX idx_quiz_templates_lesson ON public.quiz_templates(lesson_id);
CREATE INDEX idx_quiz_templates_creator ON public.quiz_templates(created_by);
CREATE INDEX idx_quiz_templates_type ON public.quiz_templates(template_type);
CREATE INDEX idx_quiz_templates_published ON public.quiz_templates(is_published);

-- Quiz Template Questions
CREATE INDEX idx_quiz_template_questions_template ON public.quiz_template_questions(quiz_template_id);
CREATE INDEX idx_quiz_template_questions_question ON public.quiz_template_questions(question_id);
CREATE INDEX idx_quiz_template_questions_order ON public.quiz_template_questions(quiz_template_id, order_index);

-- Quiz Attempt Details
CREATE INDEX idx_quiz_attempt_details_attempt ON public.quiz_attempt_details(quiz_attempt_id);
CREATE INDEX idx_quiz_attempt_details_template ON public.quiz_attempt_details(quiz_template_id);

-- Grading Rubrics
CREATE INDEX idx_grading_rubrics_assignment ON public.grading_rubrics(assignment_id);
CREATE INDEX idx_grading_rubrics_course ON public.grading_rubrics(course_id);
CREATE INDEX idx_grading_rubrics_creator ON public.grading_rubrics(created_by);

-- Rubric Criteria
CREATE INDEX idx_rubric_criteria_rubric ON public.rubric_criteria(rubric_id);
CREATE INDEX idx_rubric_criteria_order ON public.rubric_criteria(rubric_id, order_index);

-- Rubric Criterion Levels
CREATE INDEX idx_rubric_criterion_levels_criterion ON public.rubric_criterion_levels(criterion_id);
CREATE INDEX idx_rubric_criterion_levels_order ON public.rubric_criterion_levels(criterion_id, order_index);

-- Grade Records
CREATE INDEX idx_grade_records_student ON public.grade_records(student_id);
CREATE INDEX idx_grade_records_course ON public.grade_records(course_id);
CREATE INDEX idx_grade_records_assignment ON public.grade_records(assignment_id);
CREATE INDEX idx_grade_records_quiz_attempt ON public.grade_records(quiz_attempt_id);
CREATE INDEX idx_grade_records_graded_by ON public.grade_records(graded_by);
CREATE INDEX idx_grade_records_graded_at ON public.grade_records(graded_at);

-- Progress Reports
CREATE INDEX idx_progress_reports_student ON public.progress_reports(student_id);
CREATE INDEX idx_progress_reports_course ON public.progress_reports(course_id);
CREATE INDEX idx_progress_reports_period ON public.progress_reports(period_type, start_date, end_date);
CREATE INDEX idx_progress_reports_generated_by ON public.progress_reports(generated_by);

-- 4. FUNCTIONS
-- ============================================================================

-- Function: Update question bank count
CREATE OR REPLACE FUNCTION public.update_question_bank_count()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.question_banks
        SET total_questions = total_questions + 1
        WHERE id = NEW.question_bank_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.question_banks
        SET total_questions = GREATEST(total_questions - 1, 0)
        WHERE id = OLD.question_bank_id;
    END IF;
    RETURN NULL;
END;
$$;

-- Function: Calculate grade letter from percentage
CREATE OR REPLACE FUNCTION public.calculate_grade_letter(percentage NUMERIC)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
SELECT CASE
    WHEN percentage >= 90 THEN 'A'
    WHEN percentage >= 80 THEN 'B'
    WHEN percentage >= 70 THEN 'C'
    WHEN percentage >= 60 THEN 'D'
    ELSE 'F'
END;
$$;

-- Function: Auto-populate grade records from quiz attempts
CREATE OR REPLACE FUNCTION public.create_grade_record_from_quiz()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_course_id UUID;
    v_max_score INTEGER;
BEGIN
    -- Get course_id from lesson
    SELECT l.course_id INTO v_course_id
    FROM public.lessons l
    WHERE l.id = NEW.lesson_id;
    
    -- Calculate max possible score
    v_max_score := NEW.total_points;
    
    -- Insert grade record
    INSERT INTO public.grade_records (
        student_id,
        course_id,
        quiz_attempt_id,
        score,
        max_score,
        percentage,
        grade_letter,
        graded_at
    ) VALUES (
        NEW.student_id,
        v_course_id,
        NEW.id,
        NEW.score,
        v_max_score,
        NEW.percentage,
        public.calculate_grade_letter(NEW.percentage),
        NEW.completed_at
    );
    
    RETURN NEW;
END;
$$;

-- Function: Auto-populate grade records from assignment submissions
CREATE OR REPLACE FUNCTION public.create_grade_record_from_submission()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_course_id UUID;
    v_max_score INTEGER;
    v_percentage NUMERIC(5,2);
BEGIN
    -- Only create grade record when graded
    IF NEW.status = 'graded'::public.assignment_status AND NEW.score IS NOT NULL THEN
        -- Get assignment details
        SELECT a.course_id, a.max_score INTO v_course_id, v_max_score
        FROM public.assignments a
        WHERE a.id = NEW.assignment_id;
        
        -- Calculate percentage
        v_percentage := (NEW.score::NUMERIC / v_max_score::NUMERIC) * 100;
        
        -- Insert or update grade record
        INSERT INTO public.grade_records (
            student_id,
            course_id,
            assignment_id,
            score,
            max_score,
            percentage,
            grade_letter,
            graded_by,
            graded_at,
            feedback
        ) VALUES (
            NEW.student_id,
            v_course_id,
            NEW.assignment_id,
            NEW.score,
            v_max_score,
            v_percentage,
            public.calculate_grade_letter(v_percentage),
            NEW.graded_by,
            NEW.graded_at,
            NEW.feedback
        )
        ON CONFLICT (student_id, course_id, assignment_id)
        DO UPDATE SET
            score = EXCLUDED.score,
            percentage = EXCLUDED.percentage,
            grade_letter = EXCLUDED.grade_letter,
            graded_by = EXCLUDED.graded_by,
            graded_at = EXCLUDED.graded_at,
            feedback = EXCLUDED.feedback,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- Question Banks
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_manage_own_question_banks"
ON public.question_banks
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR is_teacher_or_admin())
WITH CHECK (created_by = auth.uid() OR is_teacher_or_admin());

CREATE POLICY "students_view_public_question_banks"
ON public.question_banks
FOR SELECT
TO authenticated
USING (is_public = true);

-- Question Bank Items
ALTER TABLE public.question_bank_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_manage_question_bank_items"
ON public.question_bank_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.question_banks qb
        WHERE qb.id = question_bank_items.question_bank_id
        AND (qb.created_by = auth.uid() OR is_teacher_or_admin())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.question_banks qb
        WHERE qb.id = question_bank_items.question_bank_id
        AND (qb.created_by = auth.uid() OR is_teacher_or_admin())
    )
);

-- Quiz Templates
ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_manage_own_quiz_templates"
ON public.quiz_templates
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR is_teacher_or_admin())
WITH CHECK (created_by = auth.uid() OR is_teacher_or_admin());

CREATE POLICY "students_view_published_quiz_templates"
ON public.quiz_templates
FOR SELECT
TO authenticated
USING (is_published = true AND is_enrolled_in_course(course_id));

-- Quiz Template Questions
ALTER TABLE public.quiz_template_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_manage_quiz_template_questions"
ON public.quiz_template_questions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quiz_templates qt
        WHERE qt.id = quiz_template_questions.quiz_template_id
        AND (qt.created_by = auth.uid() OR is_teacher_or_admin())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quiz_templates qt
        WHERE qt.id = quiz_template_questions.quiz_template_id
        AND (qt.created_by = auth.uid() OR is_teacher_or_admin())
    )
);

-- Quiz Attempt Details
ALTER TABLE public.quiz_attempt_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_manage_own_quiz_attempt_details"
ON public.quiz_attempt_details
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts qa
        WHERE qa.id = quiz_attempt_details.quiz_attempt_id
        AND qa.student_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.quiz_attempts qa
        WHERE qa.id = quiz_attempt_details.quiz_attempt_id
        AND qa.student_id = auth.uid()
    )
);

CREATE POLICY "teachers_view_all_quiz_attempt_details"
ON public.quiz_attempt_details
FOR SELECT
TO authenticated
USING (is_teacher_or_admin());

-- Grading Rubrics
ALTER TABLE public.grading_rubrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_manage_own_rubrics"
ON public.grading_rubrics
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR is_teacher_or_admin())
WITH CHECK (created_by = auth.uid() OR is_teacher_or_admin());

CREATE POLICY "students_view_course_rubrics"
ON public.grading_rubrics
FOR SELECT
TO authenticated
USING (is_enrolled_in_course(course_id));

-- Rubric Criteria
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_manage_rubric_criteria"
ON public.rubric_criteria
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.grading_rubrics gr
        WHERE gr.id = rubric_criteria.rubric_id
        AND (gr.created_by = auth.uid() OR is_teacher_or_admin())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.grading_rubrics gr
        WHERE gr.id = rubric_criteria.rubric_id
        AND (gr.created_by = auth.uid() OR is_teacher_or_admin())
    )
);

-- Rubric Criterion Levels
ALTER TABLE public.rubric_criterion_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_manage_criterion_levels"
ON public.rubric_criterion_levels
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.rubric_criteria rc
        JOIN public.grading_rubrics gr ON rc.rubric_id = gr.id
        WHERE rc.id = rubric_criterion_levels.criterion_id
        AND (gr.created_by = auth.uid() OR is_teacher_or_admin())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.rubric_criteria rc
        JOIN public.grading_rubrics gr ON rc.rubric_id = gr.id
        WHERE rc.id = rubric_criterion_levels.criterion_id
        AND (gr.created_by = auth.uid() OR is_teacher_or_admin())
    )
);

-- Grade Records
ALTER TABLE public.grade_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_view_own_grades"
ON public.grade_records
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "teachers_manage_all_grades"
ON public.grade_records
FOR ALL
TO authenticated
USING (is_teacher_or_admin())
WITH CHECK (is_teacher_or_admin());

-- Progress Reports
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_view_own_progress_reports"
ON public.progress_reports
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "teachers_manage_progress_reports"
ON public.progress_reports
FOR ALL
TO authenticated
USING (is_teacher_or_admin())
WITH CHECK (is_teacher_or_admin());

-- 6. TRIGGERS
-- ============================================================================

-- Update question bank count
CREATE TRIGGER update_question_bank_count_on_insert
    AFTER INSERT ON public.question_bank_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_question_bank_count();

CREATE TRIGGER update_question_bank_count_on_delete
    AFTER DELETE ON public.question_bank_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_question_bank_count();

-- Update timestamps
CREATE TRIGGER update_question_banks_updated_at
    BEFORE UPDATE ON public.question_banks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_templates_updated_at
    BEFORE UPDATE ON public.quiz_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grading_rubrics_updated_at
    BEFORE UPDATE ON public.grading_rubrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grade_records_updated_at
    BEFORE UPDATE ON public.grade_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_reports_updated_at
    BEFORE UPDATE ON public.progress_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create grade records from quiz attempts
CREATE TRIGGER create_grade_record_on_quiz_completion
    AFTER INSERT ON public.quiz_attempts
    FOR EACH ROW
    WHEN (NEW.completed_at IS NOT NULL)
    EXECUTE FUNCTION public.create_grade_record_from_quiz();

-- Auto-create grade records from assignment grading
CREATE TRIGGER create_grade_record_on_assignment_grading
    AFTER UPDATE ON public.assignment_submissions
    FOR EACH ROW
    WHEN (NEW.status = 'graded'::public.assignment_status AND NEW.score IS NOT NULL)
    EXECUTE FUNCTION public.create_grade_record_from_submission();

-- 7. MOCK DATA
-- ============================================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_student_id UUID;
    v_course_id UUID;
    v_lesson_id UUID;
    v_question_bank_id UUID;
    v_quiz_template_id UUID;
    v_question1_id UUID;
    v_question2_id UUID;
    v_question3_id UUID;
    v_assignment_id UUID;
    v_rubric_id UUID;
    v_criterion_id UUID;
BEGIN
    -- Get existing IDs
    SELECT id INTO v_teacher_id FROM public.user_profiles WHERE role = 'teacher'::public.user_role LIMIT 1;
    SELECT id INTO v_student_id FROM public.student_profiles LIMIT 1;
    SELECT id INTO v_course_id FROM public.courses LIMIT 1;
    SELECT id INTO v_lesson_id FROM public.lessons LIMIT 1;
    SELECT id INTO v_assignment_id FROM public.assignments LIMIT 1;

    -- Only proceed if we have necessary data
    IF v_teacher_id IS NULL OR v_student_id IS NULL OR v_course_id IS NULL OR v_lesson_id IS NULL THEN
        RAISE NOTICE 'Required data not found. Skipping Phase 5 mock data.';
        RETURN;
    END IF;

    -- Create Question Bank
    INSERT INTO public.question_banks (id, title, description, course_id, created_by, tags, difficulty_level, subject_area, is_public)
    VALUES (
        gen_random_uuid(),
        'Amharic Grammar Essentials',
        'Comprehensive question bank for Amharic grammar assessments',
        v_course_id,
        v_teacher_id,
        ARRAY['grammar', 'amharic', 'beginner'],
        'medium'::public.difficulty_level,
        'Language Learning',
        true
    )
    RETURNING id INTO v_question_bank_id;

    -- Create sample questions for question bank (capture first ID)
    INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, points, order_index)
    VALUES 
        (gen_random_uuid(), v_lesson_id, 'multiple_choice'::public.question_type, 
         'Which letter represents the sound "ka" in Amharic?', 
         '["ከ","ኮ","ኩ","ኪ"]'::jsonb, 
         'ከ', 
         'The letter ከ (ka) is the base form of the k-series consonant', 
         10, 100)
    RETURNING id INTO v_question1_id;
    
    -- Create second question
    INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, points, order_index)
    VALUES 
        (gen_random_uuid(), v_lesson_id, 'true_false'::public.question_type,
         'Amharic uses the Latin alphabet',
         '["True","False"]'::jsonb,
         'False',
         'Amharic uses its own unique script called Fidel',
         5, 101)
    RETURNING id INTO v_question2_id;
    
    -- Create third question
    INSERT INTO public.quiz_questions (id, lesson_id, question_type, question_text, options, correct_answer, explanation, points, order_index)
    VALUES 
        (gen_random_uuid(), v_lesson_id, 'multiple_choice'::public.question_type,
         'How many vowel forms does each Amharic consonant have?',
         '["5","6","7","8"]'::jsonb,
         '7',
         'Each consonant has 7 vowel forms in the Fidel writing system',
         10, 102)
    RETURNING id INTO v_question3_id;

    -- Link questions to bank
    IF v_question1_id IS NOT NULL THEN
        INSERT INTO public.question_bank_items (question_bank_id, question_id)
        VALUES 
            (v_question_bank_id, v_question1_id),
            (v_question_bank_id, v_question2_id),
            (v_question_bank_id, v_question3_id);
    END IF;

    -- Create Quiz Template
    INSERT INTO public.quiz_templates (
        id, title, description, course_id, lesson_id, created_by,
        template_type, time_limit_minutes, passing_percentage,
        randomize_questions, randomize_options, show_correct_answers, show_explanations,
        attempt_strategy, max_attempts, total_questions, questions_per_attempt, is_published
    ) VALUES (
        gen_random_uuid(),
        'Amharic Alphabet Mastery Quiz',
        'Comprehensive assessment of Amharic alphabet knowledge',
        v_course_id,
        v_lesson_id,
        v_teacher_id,
        'graded'::public.quiz_template_type,
        30,
        70.00,
        true,
        true,
        true,
        true,
        'limited'::public.attempt_strategy,
        3,
        3,
        3,
        true
    )
    RETURNING id INTO v_quiz_template_id;

    -- Link questions to template
    IF v_quiz_template_id IS NOT NULL AND v_question1_id IS NOT NULL THEN
        INSERT INTO public.quiz_template_questions (quiz_template_id, question_id, order_index, is_mandatory)
        VALUES 
            (v_quiz_template_id, v_question1_id, 1, true),
            (v_quiz_template_id, v_question2_id, 2, true),
            (v_quiz_template_id, v_question3_id, 3, true);
    END IF;

    -- Create Grading Rubric for assignment
    IF v_assignment_id IS NOT NULL THEN
        INSERT INTO public.grading_rubrics (
            id, title, description, assignment_id, course_id, created_by,
            total_points, grade_scale
        ) VALUES (
            gen_random_uuid(),
            'Writing Assignment Rubric',
            'Comprehensive rubric for evaluating written assignments',
            v_assignment_id,
            v_course_id,
            v_teacher_id,
            100,
            'points'::public.grade_scale
        )
        RETURNING id INTO v_rubric_id;

        -- Create rubric criteria (only capture first ID)
        INSERT INTO public.rubric_criteria (id, rubric_id, criteria_type, title, description, max_points, order_index)
        VALUES 
            (gen_random_uuid(), v_rubric_id, 'content_accuracy'::public.rubric_criteria_type,
             'Content Accuracy', 'Correctness and accuracy of information', 30, 1)
        RETURNING id INTO v_criterion_id;
        
        -- Insert remaining rubric criteria without capturing IDs
        INSERT INTO public.rubric_criteria (id, rubric_id, criteria_type, title, description, max_points, order_index)
        VALUES 
            (gen_random_uuid(), v_rubric_id, 'grammar'::public.rubric_criteria_type,
             'Grammar & Spelling', 'Proper use of grammar and spelling', 25, 2),
            (gen_random_uuid(), v_rubric_id, 'organization'::public.rubric_criteria_type,
             'Organization', 'Logical structure and flow', 25, 3),
            (gen_random_uuid(), v_rubric_id, 'creativity'::public.rubric_criteria_type,
             'Creativity', 'Original thinking and presentation', 20, 4);

        -- Create criterion levels for first criterion
        INSERT INTO public.rubric_criterion_levels (criterion_id, level_name, level_description, points_value, order_index)
        VALUES 
            (v_criterion_id, 'Excellent', 'All information is accurate and well-researched', 30, 1),
            (v_criterion_id, 'Good', 'Most information is accurate with minor errors', 24, 2),
            (v_criterion_id, 'Fair', 'Some information is accurate but contains notable errors', 18, 3),
            (v_criterion_id, 'Needs Improvement', 'Significant inaccuracies present', 12, 4);
    END IF;

    -- Create sample grade records
    INSERT INTO public.grade_records (
        student_id, course_id, assignment_id, score, max_score, percentage,
        grade_letter, graded_by, graded_at, feedback, weight
    ) VALUES 
        (v_student_id, v_course_id, v_assignment_id, 85.00, 100.00, 85.00,
         'B', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '2 days',
         'Excellent work on grammar exercises. Keep practicing pronunciation.', 1.00),
        (v_student_id, v_course_id, NULL, 92.00, 100.00, 92.00,
         'A', v_teacher_id, CURRENT_TIMESTAMP - INTERVAL '1 week',
         'Outstanding performance on midterm assessment.', 2.00);

    -- Create sample progress report
    INSERT INTO public.progress_reports (
        student_id, course_id, period_type, start_date, end_date,
        overall_grade, grade_letter, attendance_percentage,
        lessons_completed, assignments_completed, quizzes_completed,
        skill_improvements, strengths, areas_for_improvement,
        teacher_comments, generated_by
    ) VALUES (
        v_student_id,
        v_course_id,
        'monthly'::public.report_period,
        DATE_TRUNC('month', CURRENT_DATE)::DATE,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE,
        87.50,
        'B',
        95.00,
        12,
        8,
        5,
        '{"reading": 15, "writing": 20, "speaking": 10, "listening": 12}'::jsonb,
        ARRAY['Strong reading comprehension', 'Excellent grammar usage', 'Active class participation'],
        ARRAY['Practice pronunciation', 'Increase speaking confidence'],
        'Excellent progress this month. Continue focusing on speaking practice to match your strong writing skills.',
        v_teacher_id
    );

END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Phase 5 tables created successfully:
-- - question_banks (centralized question management)
-- - question_bank_items (question-to-bank relationships)
-- - quiz_templates (reusable quiz configurations with advanced settings)
-- - quiz_template_questions (template-to-question relationships)
-- - quiz_attempt_details (extended attempt information)
-- - grading_rubrics (detailed assessment criteria)
-- - rubric_criteria (individual grading criteria)
-- - rubric_criterion_levels (performance levels for criteria)
-- - grade_records (comprehensive gradebook)
-- - progress_reports (student progress summaries)
-- ============================================================================
