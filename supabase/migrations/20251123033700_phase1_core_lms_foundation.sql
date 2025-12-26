-- Location: supabase/migrations/20251123033700_phase1_core_lms_foundation.sql
-- Schema Analysis: Existing courses, course_enrollments, student_profiles, student_progress tables
-- Integration Type: Extension - Adding course structure, lessons, assignments, quizzes
-- Dependencies: courses, student_profiles, user_profiles

-- ============================================================
-- PHASE 1: CORE LMS FOUNDATION
-- Multi-level course organization, lesson player, assignments, quizzes
-- ============================================================

-- 1. CREATE CUSTOM TYPES
CREATE TYPE public.content_type AS ENUM ('video', 'text', 'audio', 'pdf', 'interactive');
CREATE TYPE public.assignment_status AS ENUM ('not_started', 'in_progress', 'submitted', 'graded', 'returned');
CREATE TYPE public.submission_type AS ENUM ('text', 'file', 'audio', 'video');
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching');

-- 2. COURSE UNITS (Hierarchical structure within courses)
CREATE TABLE public.course_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. LESSONS (Individual lessons within units)
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.course_units(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 15,
    xp_reward INTEGER DEFAULT 25,
    is_published BOOLEAN DEFAULT false,
    prerequisite_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. LESSON CONTENT (Videos, texts, materials for each lesson)
CREATE TABLE public.lesson_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    content_type public.content_type NOT NULL,
    title TEXT NOT NULL,
    content_url TEXT,
    content_text TEXT,
    order_index INTEGER NOT NULL,
    duration_seconds INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. STUDENT LESSON PROGRESS (Track completion and access)
CREATE TABLE public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    progress_percentage INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, lesson_id)
);

-- 6. ASSIGNMENTS (Teacher-created assignments)
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    submission_type public.submission_type DEFAULT 'text'::public.submission_type,
    max_score INTEGER DEFAULT 100,
    due_date TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT false,
    allow_late_submission BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. ASSIGNMENT SUBMISSIONS (Student submissions)
CREATE TABLE public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_file_url TEXT,
    status public.assignment_status DEFAULT 'not_started'::public.assignment_status,
    score INTEGER,
    feedback TEXT,
    graded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- 8. QUIZ QUESTIONS (Questions for quizzes and tests)
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question_type public.question_type NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 10,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. QUIZ ATTEMPTS (Student quiz attempts and scores)
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    answers JSONB NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX idx_course_units_course_id ON public.course_units(course_id);
CREATE INDEX idx_course_units_order ON public.course_units(course_id, order_index);

CREATE INDEX idx_lessons_unit_id ON public.lessons(unit_id);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(unit_id, order_index);
CREATE INDEX idx_lessons_prerequisite ON public.lessons(prerequisite_lesson_id);

CREATE INDEX idx_lesson_content_lesson_id ON public.lesson_content(lesson_id);
CREATE INDEX idx_lesson_content_order ON public.lesson_content(lesson_id, order_index);

CREATE INDEX idx_student_lesson_progress_student ON public.student_lesson_progress(student_id);
CREATE INDEX idx_student_lesson_progress_lesson ON public.student_lesson_progress(lesson_id);
CREATE INDEX idx_student_lesson_progress_completion ON public.student_lesson_progress(student_id, is_completed);

CREATE INDEX idx_assignments_lesson_id ON public.assignments(lesson_id);
CREATE INDEX idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX idx_assignments_due_date ON public.assignments(due_date);

CREATE INDEX idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON public.assignment_submissions(status);

CREATE INDEX idx_quiz_questions_lesson ON public.quiz_questions(lesson_id);
CREATE INDEX idx_quiz_questions_order ON public.quiz_questions(lesson_id, order_index);

CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_lesson ON public.quiz_attempts(lesson_id);

-- 11. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.course_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 12. HELPER FUNCTIONS FOR RLS
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('teacher', 'admin', 'ceo')
)
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(course_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    WHERE ce.student_id = auth.uid()
    AND ce.course_id = course_uuid
)
$$;

-- 13. RLS POLICIES

-- Course Units: Public read if course is active, teachers can manage
CREATE POLICY "public_can_read_published_units"
ON public.course_units
FOR SELECT
TO public
USING (
    is_published = true
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_active = true)
);

CREATE POLICY "teachers_manage_course_units"
ON public.course_units
FOR ALL
TO authenticated
USING (public.is_teacher_or_admin())
WITH CHECK (public.is_teacher_or_admin());

-- Lessons: Enrolled students and teachers can view
CREATE POLICY "enrolled_students_view_lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (
    is_published = true
    AND public.is_enrolled_in_course(course_id)
);

CREATE POLICY "teachers_manage_lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (public.is_teacher_or_admin())
WITH CHECK (public.is_teacher_or_admin());

-- Lesson Content: Enrolled students can view
CREATE POLICY "enrolled_students_view_content"
ON public.lesson_content
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.lessons l
        WHERE l.id = lesson_id
        AND public.is_enrolled_in_course(l.course_id)
    )
);

CREATE POLICY "teachers_manage_content"
ON public.lesson_content
FOR ALL
TO authenticated
USING (public.is_teacher_or_admin())
WITH CHECK (public.is_teacher_or_admin());

-- Student Lesson Progress: Students manage own progress
CREATE POLICY "students_manage_own_lesson_progress"
ON public.student_lesson_progress
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "teachers_view_student_progress"
ON public.student_lesson_progress
FOR SELECT
TO authenticated
USING (public.is_teacher_or_admin());

-- Assignments: Enrolled students view, teachers manage
CREATE POLICY "enrolled_students_view_assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (
    is_published = true
    AND public.is_enrolled_in_course(course_id)
);

CREATE POLICY "teachers_manage_assignments"
ON public.assignments
FOR ALL
TO authenticated
USING (public.is_teacher_or_admin())
WITH CHECK (public.is_teacher_or_admin());

-- Assignment Submissions: Students manage own submissions
CREATE POLICY "students_manage_own_submissions"
ON public.assignment_submissions
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "teachers_view_all_submissions"
ON public.assignment_submissions
FOR SELECT
TO authenticated
USING (public.is_teacher_or_admin());

CREATE POLICY "teachers_grade_submissions"
ON public.assignment_submissions
FOR UPDATE
TO authenticated
USING (public.is_teacher_or_admin())
WITH CHECK (public.is_teacher_or_admin());

-- Quiz Questions: Enrolled students view, teachers manage
CREATE POLICY "enrolled_students_view_questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.lessons l
        WHERE l.id = lesson_id
        AND public.is_enrolled_in_course(l.course_id)
    )
);

CREATE POLICY "teachers_manage_questions"
ON public.quiz_questions
FOR ALL
TO authenticated
USING (public.is_teacher_or_admin())
WITH CHECK (public.is_teacher_or_admin());

-- Quiz Attempts: Students manage own attempts
CREATE POLICY "students_manage_own_quiz_attempts"
ON public.quiz_attempts
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "teachers_view_quiz_attempts"
ON public.quiz_attempts
FOR SELECT
TO authenticated
USING (public.is_teacher_or_admin());

-- 14. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_course_units_updated_at
    BEFORE UPDATE ON public.course_units
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_content_updated_at
    BEFORE UPDATE ON public.lesson_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_lesson_progress_updated_at
    BEFORE UPDATE ON public.student_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 15. FUNCTION TO UPDATE COURSE ENROLLMENT PROGRESS
CREATE OR REPLACE FUNCTION public.update_course_enrollment_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_lessons_count INTEGER;
    completed_lessons_count INTEGER;
    new_progress INTEGER;
BEGIN
    -- Calculate total lessons in the course
    SELECT COUNT(*) INTO total_lessons_count
    FROM public.lessons l
    WHERE l.course_id = (SELECT course_id FROM public.lessons WHERE id = NEW.lesson_id);

    -- Calculate completed lessons for this student
    SELECT COUNT(*) INTO completed_lessons_count
    FROM public.student_lesson_progress slp
    JOIN public.lessons l ON slp.lesson_id = l.id
    WHERE slp.student_id = NEW.student_id
    AND l.course_id = (SELECT course_id FROM public.lessons WHERE id = NEW.lesson_id)
    AND slp.is_completed = true;

    -- Calculate progress percentage
    IF total_lessons_count > 0 THEN
        new_progress := ROUND((completed_lessons_count::DECIMAL / total_lessons_count) * 100);
    ELSE
        new_progress := 0;
    END IF;

    -- Update course enrollment progress
    UPDATE public.course_enrollments
    SET 
        progress_percentage = new_progress,
        last_accessed_at = CURRENT_TIMESTAMP,
        is_completed = (new_progress = 100),
        completed_at = CASE WHEN new_progress = 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
    WHERE student_id = NEW.student_id
    AND course_id = (SELECT course_id FROM public.lessons WHERE id = NEW.lesson_id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER update_enrollment_on_lesson_complete
    AFTER INSERT OR UPDATE ON public.student_lesson_progress
    FOR EACH ROW
    WHEN (NEW.is_completed = true)
    EXECUTE FUNCTION public.update_course_enrollment_progress();

-- 16. SAMPLE DATA FOR TESTING

DO $$
DECLARE
    -- Get existing course and student IDs
    amharic_course_id UUID;
    ethiopian_course_id UUID;
    existing_student_id UUID;
    
    -- Unit IDs
    unit1_id UUID := gen_random_uuid();
    unit2_id UUID := gen_random_uuid();
    unit3_id UUID := gen_random_uuid();
    
    -- Lesson IDs
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
    lesson3_id UUID := gen_random_uuid();
    lesson4_id UUID := gen_random_uuid();
    
    -- Assignment IDs
    assignment1_id UUID := gen_random_uuid();
    assignment2_id UUID := gen_random_uuid();
    
    -- Get admin/teacher for assignments
    teacher_id UUID;
BEGIN
    -- Get existing course IDs
    SELECT id INTO amharic_course_id FROM public.courses WHERE title = 'Amharic Basics: Greetings' LIMIT 1;
    SELECT id INTO ethiopian_course_id FROM public.courses WHERE title = 'Ethiopian Coffee Ceremony' LIMIT 1;
    
    -- Get existing student ID
    SELECT id INTO existing_student_id FROM public.student_profiles LIMIT 1;
    
    -- Get teacher/admin ID
    SELECT id INTO teacher_id FROM public.user_profiles WHERE role IN ('teacher', 'admin', 'ceo') LIMIT 1;
    
    IF amharic_course_id IS NULL OR existing_student_id IS NULL THEN
        RAISE NOTICE 'Required course or student not found. Skipping sample data creation.';
        RETURN;
    END IF;

    -- Create Course Units for Amharic Basics
    INSERT INTO public.course_units (id, course_id, title, description, order_index, is_published)
    VALUES
        (unit1_id, amharic_course_id, 'Getting Started with Amharic', 'Introduction to the Amharic alphabet and basic pronunciation', 1, true),
        (unit2_id, amharic_course_id, 'Essential Phrases', 'Learn common greetings and everyday expressions', 2, true),
        (unit3_id, amharic_course_id, 'Building Vocabulary', 'Expand your Amharic vocabulary with themed lessons', 3, true);

    -- Create Lessons for Unit 1
    INSERT INTO public.lessons (id, unit_id, course_id, title, description, order_index, estimated_duration_minutes, xp_reward, is_published)
    VALUES
        (lesson1_id, unit1_id, amharic_course_id, 'The Amharic Alphabet', 'Learn the 33 basic characters of Amharic script', 1, 20, 30, true),
        (lesson2_id, unit1_id, amharic_course_id, 'Pronunciation Practice', 'Master the sounds of Amharic letters', 2, 15, 25, true);

    -- Create Lessons for Unit 2 with prerequisites
    INSERT INTO public.lessons (id, unit_id, course_id, title, description, order_index, estimated_duration_minutes, xp_reward, is_published, prerequisite_lesson_id)
    VALUES
        (lesson3_id, unit2_id, amharic_course_id, 'Common Greetings', 'Learn how to greet people in different situations', 1, 15, 25, true, lesson2_id),
        (lesson4_id, unit2_id, amharic_course_id, 'Introducing Yourself', 'Practice introducing yourself in Amharic', 2, 20, 30, true, lesson3_id);

    -- Create Lesson Content for Lesson 1
    INSERT INTO public.lesson_content (lesson_id, content_type, title, content_url, content_text, order_index, duration_seconds, is_required)
    VALUES
        (lesson1_id, 'video', 'Introduction to Amharic Script', 'https://example.com/video1.mp4', NULL, 1, 600, true),
        (lesson1_id, 'text', 'Alphabet Chart', NULL, 'ሀ ሁ ሂ ሃ ሄ ህ ሆ - These are the variations of the first Amharic letter...', 2, NULL, true),
        (lesson1_id, 'interactive', 'Letter Recognition Practice', NULL, NULL, 3, NULL, true);

    -- Create Lesson Content for Lesson 2
    INSERT INTO public.lesson_content (lesson_id, content_type, title, content_url, content_text, order_index, duration_seconds, is_required)
    VALUES
        (lesson2_id, 'audio', 'Pronunciation Guide', 'https://example.com/audio1.mp3', NULL, 1, 300, true),
        (lesson2_id, 'text', 'Practice Tips', NULL, 'Focus on tongue placement and vowel sounds...', 2, NULL, false),
        (lesson2_id, 'video', 'Native Speaker Examples', 'https://example.com/video2.mp4', NULL, 3, 420, true);

    -- Create sample lesson progress for existing student
    INSERT INTO public.student_lesson_progress (student_id, lesson_id, is_completed, progress_percentage, time_spent_minutes)
    VALUES
        (existing_student_id, lesson1_id, true, 100, 25),
        (existing_student_id, lesson2_id, false, 60, 12);

    -- Create Assignments (only if teacher exists)
    IF teacher_id IS NOT NULL THEN
        INSERT INTO public.assignments (id, lesson_id, course_id, title, description, instructions, submission_type, max_score, due_date, is_published, created_by)
        VALUES
            (assignment1_id, lesson1_id, amharic_course_id, 
             'Write the Alphabet', 
             'Practice writing all 33 Amharic letters',
             'Use the trace board to practice writing each letter. Submit a photo of your completed work.',
             'file',
             100,
             CURRENT_TIMESTAMP + INTERVAL '7 days',
             true,
             teacher_id),
            (assignment2_id, lesson2_id, amharic_course_id,
             'Pronunciation Recording',
             'Record yourself pronouncing the alphabet',
             'Use the audio recorder to submit your pronunciation of the first 10 letters.',
             'audio',
             100,
             CURRENT_TIMESTAMP + INTERVAL '5 days',
             true,
             teacher_id);

        -- Create sample submission
        INSERT INTO public.assignment_submissions (assignment_id, student_id, submission_text, status, submitted_at)
        VALUES
            (assignment1_id, existing_student_id, 'Completed all letters with correct stroke order', 'submitted', CURRENT_TIMESTAMP);
    END IF;

    -- Create Quiz Questions for Lesson 1
    INSERT INTO public.quiz_questions (lesson_id, question_type, question_text, options, correct_answer, points, explanation, order_index)
    VALUES
        (lesson1_id, 'multiple_choice', 'How many basic characters are in the Amharic alphabet?',
         '["26", "28", "33", "40"]'::jsonb, '33', 10, 'The Amharic alphabet has 33 basic consonants', 1),
        (lesson1_id, 'multiple_choice', 'Which direction is Amharic written?',
         '["Right to left", "Left to right", "Top to bottom", "Bottom to top"]'::jsonb, 'Left to right', 10, 'Amharic is written from left to right', 2),
        (lesson1_id, 'true_false', 'Amharic uses the Latin alphabet',
         '["True", "False"]'::jsonb, 'False', 10, 'Amharic uses its own unique script called Ge''ez', 3);

    -- Create sample quiz attempt
    INSERT INTO public.quiz_attempts (student_id, lesson_id, score, total_points, percentage, answers, time_taken_seconds)
    VALUES
        (existing_student_id, lesson1_id, 25, 30, 83.33,
         '[{"question_id": "1", "answer": "33", "correct": true}, {"question_id": "2", "answer": "Left to right", "correct": true}, {"question_id": "3", "answer": "True", "correct": false}]'::jsonb,
         180);

    RAISE NOTICE 'Phase 1 Core LMS Foundation sample data created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample data: %', SQLERRM;
END $$;

-- 17. UTILITY FUNCTION TO GET NEXT LESSON
CREATE OR REPLACE FUNCTION public.get_next_lesson(current_lesson_uuid UUID)
RETURNS TABLE(
    next_lesson_id UUID,
    next_lesson_title TEXT,
    is_unlocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_unit_id UUID;
    current_order INTEGER;
    student_uuid UUID;
BEGIN
    student_uuid := auth.uid();
    
    -- Get current lesson details
    SELECT unit_id, order_index 
    INTO current_unit_id, current_order
    FROM public.lessons
    WHERE id = current_lesson_uuid;
    
    -- Find next lesson in same unit
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        CASE 
            WHEN l.prerequisite_lesson_id IS NULL THEN true
            WHEN EXISTS (
                SELECT 1 FROM public.student_lesson_progress slp
                WHERE slp.student_id = student_uuid
                AND slp.lesson_id = l.prerequisite_lesson_id
                AND slp.is_completed = true
            ) THEN true
            ELSE false
        END as is_unlocked
    FROM public.lessons l
    WHERE l.unit_id = current_unit_id
    AND l.order_index = current_order + 1
    AND l.is_published = true
    LIMIT 1;
    
    -- If no next lesson in unit, get first lesson of next unit
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            l.id,
            l.title,
            CASE 
                WHEN l.prerequisite_lesson_id IS NULL THEN true
                WHEN EXISTS (
                    SELECT 1 FROM public.student_lesson_progress slp
                    WHERE slp.student_id = student_uuid
                    AND slp.lesson_id = l.prerequisite_lesson_id
                    AND slp.is_completed = true
                ) THEN true
                ELSE false
            END as is_unlocked
        FROM public.lessons l
        JOIN public.course_units cu ON l.unit_id = cu.id
        WHERE cu.course_id = (SELECT course_id FROM public.course_units WHERE id = current_unit_id)
        AND cu.order_index = (SELECT order_index + 1 FROM public.course_units WHERE id = current_unit_id)
        AND l.order_index = 1
        AND l.is_published = true
        LIMIT 1;
    END IF;
END;
$$;

COMMENT ON TABLE public.course_units IS 'Organizational units within courses (chapters, modules, sections)';
COMMENT ON TABLE public.lessons IS 'Individual lessons within course units with prerequisite support';
COMMENT ON TABLE public.lesson_content IS 'Content blocks for each lesson (videos, texts, materials)';
COMMENT ON TABLE public.student_lesson_progress IS 'Tracks student progress through individual lessons';
COMMENT ON TABLE public.assignments IS 'Teacher-created assignments for lessons';
COMMENT ON TABLE public.assignment_submissions IS 'Student submissions for assignments';
COMMENT ON TABLE public.quiz_questions IS 'Questions for quizzes and assessments';
COMMENT ON TABLE public.quiz_attempts IS 'Student quiz attempts and scores';