-- Location: supabase/migrations/20251214120000_add_lms_syllabus_attendance_outcomes.sql
-- Schema Analysis: Existing LMS infrastructure (assignments, grades, discussions, live_sessions)
-- Integration Type: ADDITIVE - New LMS features
-- Dependencies: courses, user_profiles, student_profiles, lessons

BEGIN;

-- ======================
-- 1. COURSE SYLLABUS TABLE
-- ======================
CREATE TABLE IF NOT EXISTS public.course_syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER,
  topics TEXT[],
  learning_objectives TEXT[],
  required_readings TEXT[],
  assignments_due TEXT[],
  start_date DATE,
  end_date DATE,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for syllabus
CREATE INDEX idx_course_syllabus_course_id ON public.course_syllabus(course_id);
CREATE INDEX idx_course_syllabus_week ON public.course_syllabus(week_number);
CREATE INDEX idx_course_syllabus_dates ON public.course_syllabus(start_date, end_date);

-- ======================
-- 2. ATTENDANCE TRACKING TABLE
-- ======================
CREATE TABLE IF NOT EXISTS public.course_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  live_session_id UUID REFERENCES public.live_sessions(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present',
  duration_minutes INTEGER DEFAULT 0,
  notes TEXT,
  marked_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_attendance_status CHECK (status IN ('present', 'absent', 'late', 'excused'))
);

-- Unique constraint: one attendance record per student per course per day
CREATE UNIQUE INDEX idx_attendance_unique_daily ON public.course_attendance(student_id, course_id, attendance_date);

-- Indexes for attendance
CREATE INDEX idx_attendance_student ON public.course_attendance(student_id);
CREATE INDEX idx_attendance_course ON public.course_attendance(course_id);
CREATE INDEX idx_attendance_date ON public.course_attendance(attendance_date);
CREATE INDEX idx_attendance_status ON public.course_attendance(status);

-- ======================
-- 3. COURSE OUTCOMES TABLE
-- ======================
CREATE TABLE IF NOT EXISTS public.course_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  outcome_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'knowledge',
  mastery_criteria TEXT[],
  assessment_methods TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_outcome_category CHECK (category IN ('knowledge', 'skills', 'abilities', 'attitudes'))
);

-- Unique constraint: one outcome number per course
CREATE UNIQUE INDEX idx_outcome_unique_per_course ON public.course_outcomes(course_id, outcome_number);

-- Indexes for outcomes
CREATE INDEX idx_outcomes_course ON public.course_outcomes(course_id);
CREATE INDEX idx_outcomes_category ON public.course_outcomes(category);

-- ======================
-- 4. STUDENT OUTCOME PROGRESS TABLE
-- ======================
CREATE TABLE IF NOT EXISTS public.student_outcome_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  outcome_id UUID NOT NULL REFERENCES public.course_outcomes(id) ON DELETE CASCADE,
  mastery_level INTEGER DEFAULT 0,
  evidence_count INTEGER DEFAULT 0,
  last_assessed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_mastery_level CHECK (mastery_level >= 0 AND mastery_level <= 100)
);

-- Unique constraint: one progress record per student per outcome
CREATE UNIQUE INDEX idx_outcome_progress_unique ON public.student_outcome_progress(student_id, outcome_id);

-- Indexes for outcome progress
CREATE INDEX idx_outcome_progress_student ON public.student_outcome_progress(student_id);
CREATE INDEX idx_outcome_progress_outcome ON public.student_outcome_progress(outcome_id);
CREATE INDEX idx_outcome_progress_mastery ON public.student_outcome_progress(mastery_level);

-- ======================
-- 5. TRIGGERS FOR AUTO-UPDATE
-- ======================

-- Auto-update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_lms_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_syllabus_updated_at
  BEFORE UPDATE ON public.course_syllabus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

CREATE TRIGGER trigger_update_attendance_updated_at
  BEFORE UPDATE ON public.course_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

CREATE TRIGGER trigger_update_outcomes_updated_at
  BEFORE UPDATE ON public.course_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

CREATE TRIGGER trigger_update_outcome_progress_updated_at
  BEFORE UPDATE ON public.student_outcome_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

-- ======================
-- 6. ROW LEVEL SECURITY (RLS)
-- ======================

-- Enable RLS
ALTER TABLE public.course_syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_outcome_progress ENABLE ROW LEVEL SECURITY;

-- Syllabus Policies
CREATE POLICY "students_view_published_syllabus"
  ON public.course_syllabus FOR SELECT
  TO authenticated
  USING (
    is_published = true 
    AND course_id IN (
      SELECT course_id FROM public.course_enrollments 
      WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "teachers_manage_syllabus"
  ON public.course_syllabus FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('teacher', 'admin', 'ceo')
    )
  );

-- Attendance Policies
CREATE POLICY "students_view_own_attendance"
  ON public.course_attendance FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "teachers_manage_attendance"
  ON public.course_attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('teacher', 'admin', 'ceo')
    )
  );

-- Outcomes Policies
CREATE POLICY "students_view_course_outcomes"
  ON public.course_outcomes FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND course_id IN (
      SELECT course_id FROM public.course_enrollments 
      WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "teachers_manage_outcomes"
  ON public.course_outcomes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('teacher', 'admin', 'ceo')
    )
  );

-- Student Outcome Progress Policies
CREATE POLICY "students_view_own_outcome_progress"
  ON public.student_outcome_progress FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "teachers_manage_outcome_progress"
  ON public.student_outcome_progress FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('teacher', 'admin', 'ceo')
    )
  );

-- ======================
-- 7. SAMPLE DATA
-- ======================

DO $$
DECLARE
  v_course_id UUID;
  v_student_id UUID;
  v_teacher_id UUID;
  v_syllabus_id UUID;
  v_outcome_id UUID;
BEGIN
  -- Get existing course and users
  SELECT id INTO v_course_id FROM public.courses WHERE course_type = 'language' LIMIT 1;
  SELECT id INTO v_student_id FROM public.student_profiles LIMIT 1;
  SELECT id INTO v_teacher_id FROM public.user_profiles WHERE role = 'teacher' LIMIT 1;

  IF v_course_id IS NOT NULL AND v_student_id IS NOT NULL THEN
    -- Insert syllabus entries
    INSERT INTO public.course_syllabus (course_id, title, description, week_number, topics, learning_objectives, required_readings, start_date, end_date, is_published, created_by)
    VALUES 
      (v_course_id, 'Week 1: Introduction to Amharic', 'Basic greetings and alphabet introduction', 1, 
       ARRAY['Amharic alphabet', 'Basic greetings', 'Pronunciation basics'],
       ARRAY['Master the Amharic alphabet', 'Use basic greetings', 'Understand pronunciation rules'],
       ARRAY['Amharic Alphabet Guide Chapter 1', 'Greeting Phrases Worksheet'],
       CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true, v_teacher_id),
      (v_course_id, 'Week 2: Numbers and Time', 'Counting and telling time in Amharic', 2,
       ARRAY['Numbers 1-100', 'Time expressions', 'Days of the week'],
       ARRAY['Count from 1 to 100', 'Tell time accurately', 'Name days and months'],
       ARRAY['Number System Guide', 'Time Practice Exercises'],
       CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days', true, v_teacher_id),
      (v_course_id, 'Week 3: Family and Relationships', 'Family vocabulary and relationship terms', 3,
       ARRAY['Family members', 'Relationship vocabulary', 'Possessive pronouns'],
       ARRAY['Identify family members', 'Describe relationships', 'Use possessive forms'],
       ARRAY['Family Vocabulary List', 'Relationship Dialogues'],
       CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days', false, v_teacher_id)
    RETURNING id INTO v_syllabus_id;

    -- Insert attendance records
    INSERT INTO public.course_attendance (student_id, course_id, attendance_date, status, duration_minutes, marked_by)
    VALUES 
      (v_student_id, v_course_id, CURRENT_DATE - INTERVAL '5 days', 'present', 45, v_teacher_id),
      (v_student_id, v_course_id, CURRENT_DATE - INTERVAL '4 days', 'present', 50, v_teacher_id),
      (v_student_id, v_course_id, CURRENT_DATE - INTERVAL '3 days', 'late', 35, v_teacher_id),
      (v_student_id, v_course_id, CURRENT_DATE - INTERVAL '2 days', 'present', 48, v_teacher_id),
      (v_student_id, v_course_id, CURRENT_DATE - INTERVAL '1 day', 'present', 52, v_teacher_id);

    -- Insert course outcomes
    INSERT INTO public.course_outcomes (course_id, outcome_number, title, description, category, mastery_criteria, assessment_methods, is_active, created_by)
    VALUES 
      (v_course_id, 1, 'Reading Proficiency', 'Read and comprehend Amharic text at intermediate level', 'skills',
       ARRAY['Read 100 words per minute', 'Comprehend 85% of text', 'Recognize 500 common words'],
       ARRAY['Reading comprehension tests', 'Timed reading exercises', 'Vocabulary quizzes'],
       true, v_teacher_id),
      (v_course_id, 2, 'Speaking Fluency', 'Speak Amharic conversationally with proper pronunciation', 'skills',
       ARRAY['Maintain 5-minute conversation', 'Correct pronunciation 90%', 'Use appropriate grammar'],
       ARRAY['Oral examinations', 'Recorded conversations', 'Presentation assessments'],
       true, v_teacher_id),
      (v_course_id, 3, 'Writing Skills', 'Write coherent paragraphs in Amharic', 'skills',
       ARRAY['Write 200-word essays', 'Use proper grammar', 'Organize thoughts clearly'],
       ARRAY['Writing assignments', 'Essay evaluations', 'Grammar tests'],
       true, v_teacher_id),
      (v_course_id, 4, 'Cultural Understanding', 'Demonstrate understanding of Ethiopian culture', 'attitudes',
       ARRAY['Identify cultural practices', 'Show cultural sensitivity', 'Apply cultural knowledge'],
       ARRAY['Cultural presentations', 'Reflection papers', 'Participation in cultural events'],
       true, v_teacher_id)
    RETURNING id INTO v_outcome_id;

    -- Insert student outcome progress
    INSERT INTO public.student_outcome_progress (student_id, outcome_id, mastery_level, evidence_count, last_assessed_at)
    SELECT v_student_id, id, 
           CASE 
             WHEN outcome_number = 1 THEN 65
             WHEN outcome_number = 2 THEN 58
             WHEN outcome_number = 3 THEN 72
             WHEN outcome_number = 4 THEN 80
           END,
           CASE 
             WHEN outcome_number = 1 THEN 8
             WHEN outcome_number = 2 THEN 6
             WHEN outcome_number = 3 THEN 10
             WHEN outcome_number = 4 THEN 5
           END,
           CURRENT_TIMESTAMP - INTERVAL '2 days'
    FROM public.course_outcomes
    WHERE course_id = v_course_id;

    RAISE NOTICE 'LMS features sample data created successfully';
  ELSE
    RAISE NOTICE 'Required course or student not found - skipping sample data';
  END IF;
END $$;

COMMIT;