-- Migration: Enroll student@liqlearns.com in sample courses with realistic data
-- Purpose: Show working LMS features with visible sample data
-- Fixed: Corrected SELECT INTO query to return exactly one row

BEGIN;

-- ======================
-- 1. CREATE TABLES IF THEY DON'T EXIST
-- ======================

-- Course Syllabus Table
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

CREATE INDEX IF NOT EXISTS idx_course_syllabus_course_id ON public.course_syllabus(course_id);
CREATE INDEX IF NOT EXISTS idx_course_syllabus_week ON public.course_syllabus(week_number);
CREATE INDEX IF NOT EXISTS idx_course_syllabus_dates ON public.course_syllabus(start_date, end_date);

-- Attendance Tracking Table
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique_daily ON public.course_attendance(student_id, course_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.course_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON public.course_attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.course_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.course_attendance(status);

-- Course Outcomes Table
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_outcome_unique_per_course ON public.course_outcomes(course_id, outcome_number);
CREATE INDEX IF NOT EXISTS idx_outcomes_course ON public.course_outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_category ON public.course_outcomes(category);

-- Student Outcome Progress Table
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_outcome_progress_unique ON public.student_outcome_progress(student_id, outcome_id);
CREATE INDEX IF NOT EXISTS idx_outcome_progress_student ON public.student_outcome_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_outcome_progress_outcome ON public.student_outcome_progress(outcome_id);
CREATE INDEX IF NOT EXISTS idx_outcome_progress_mastery ON public.student_outcome_progress(mastery_level);

-- ======================
-- 2. CREATE TRIGGERS IF THEY DON'T EXIST
-- ======================

CREATE OR REPLACE FUNCTION public.update_lms_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_syllabus_updated_at ON public.course_syllabus;
CREATE TRIGGER trigger_update_syllabus_updated_at
  BEFORE UPDATE ON public.course_syllabus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

DROP TRIGGER IF EXISTS trigger_update_attendance_updated_at ON public.course_attendance;
CREATE TRIGGER trigger_update_attendance_updated_at
  BEFORE UPDATE ON public.course_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

DROP TRIGGER IF EXISTS trigger_update_outcomes_updated_at ON public.course_outcomes;
CREATE TRIGGER trigger_update_outcomes_updated_at
  BEFORE UPDATE ON public.course_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

DROP TRIGGER IF EXISTS trigger_update_outcome_progress_updated_at ON public.student_outcome_progress;
CREATE TRIGGER trigger_update_outcome_progress_updated_at
  BEFORE UPDATE ON public.student_outcome_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lms_tables_updated_at();

-- ======================
-- 3. ENABLE RLS ON NEW TABLES
-- ======================

ALTER TABLE public.course_syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_outcome_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "students_view_published_syllabus" ON public.course_syllabus;
DROP POLICY IF EXISTS "teachers_manage_syllabus" ON public.course_syllabus;
DROP POLICY IF EXISTS "students_view_own_attendance" ON public.course_attendance;
DROP POLICY IF EXISTS "teachers_manage_attendance" ON public.course_attendance;
DROP POLICY IF EXISTS "students_view_course_outcomes" ON public.course_outcomes;
DROP POLICY IF EXISTS "teachers_manage_outcomes" ON public.course_outcomes;
DROP POLICY IF EXISTS "students_view_own_outcome_progress" ON public.student_outcome_progress;
DROP POLICY IF EXISTS "teachers_manage_outcome_progress" ON public.student_outcome_progress;

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
-- 4. ENROLL STUDENT IN EXISTING COURSE (FIXED)
-- ======================

DO $$
DECLARE
  v_student_id uuid;
  v_course_id uuid;
BEGIN
  -- Get student ID
  SELECT id INTO v_student_id
  FROM auth.users
  WHERE email = 'student@liqlearns.com';

  -- Get the first matching course (fixed to return exactly one row)
  v_course_id := (
    SELECT id
    FROM courses
    WHERE (title ILIKE '%Ethiopian Culture%' OR title ILIKE '%language%')
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1
  );

  -- If no suitable course found, get any active course
  IF v_course_id IS NULL THEN
    v_course_id := (
      SELECT id
      FROM courses
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    );
  END IF;

  -- Enroll student if not already enrolled
  IF v_student_id IS NOT NULL AND v_course_id IS NOT NULL THEN
    INSERT INTO course_enrollments (
      student_id,
      course_id,
      enrolled_at,
      progress_percentage,
      last_accessed_at,
      is_completed
    )
    VALUES (
      v_student_id,
      v_course_id,
      NOW() - INTERVAL '30 days',
      45,
      NOW() - INTERVAL '1 day',
      false
    )
    ON CONFLICT (student_id, course_id) DO UPDATE
    SET progress_percentage = 45,
        last_accessed_at = NOW() - INTERVAL '1 day';
  END IF;
END $$;

-- ======================
-- 5. ADD SAMPLE DISCUSSIONS
-- ======================

DO $$
DECLARE
  v_student_id uuid;
  v_course_id uuid;
BEGIN
  SELECT id INTO v_student_id FROM auth.users WHERE email = 'student@liqlearns.com';
  
  v_course_id := (
    SELECT course_id 
    FROM course_enrollments 
    WHERE student_id = v_student_id 
    ORDER BY enrolled_at DESC
    LIMIT 1
  );

  IF v_student_id IS NOT NULL AND v_course_id IS NOT NULL THEN
    INSERT INTO course_discussions (
      course_id,
      author_id,
      author_name,
      title,
      content,
      category,
      views,
      reply_count,
      pinned,
      created_at
    )
    VALUES
      (
        v_course_id,
        v_student_id,
        'Student User',
        'Best resources for practicing pronunciation?',
        'I''m looking for recommendations on resources to improve my Amharic pronunciation. What has worked well for you?',
        'resources',
        12,
        3,
        false,
        NOW() - INTERVAL '5 days'
      ),
      (
        v_course_id,
        v_student_id,
        'Student User',
        'Study group for next week''s quiz?',
        'Anyone interested in forming a study group to prepare for the upcoming cultural quiz? Let''s schedule a time!',
        'study_groups',
        8,
        5,
        false,
        NOW() - INTERVAL '2 days'
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ======================
-- 6. ADD SAMPLE SYLLABUS
-- ======================

DO $$
DECLARE
  v_course_id uuid;
BEGIN
  v_course_id := (
    SELECT course_id
    FROM course_enrollments
    WHERE student_id = (SELECT id FROM auth.users WHERE email = 'student@liqlearns.com')
    ORDER BY enrolled_at DESC
    LIMIT 1
  );

  IF v_course_id IS NOT NULL THEN
    INSERT INTO course_syllabus (
      course_id,
      title,
      description,
      week_number,
      topics,
      learning_objectives,
      required_readings,
      assignments_due,
      start_date,
      end_date,
      is_published
    )
    VALUES
      (
        v_course_id,
        'Introduction to Ethiopian Culture',
        'Explore the rich history, traditions, and cultural practices of Ethiopia',
        1,
        ARRAY['Ethiopian history overview', 'Traditional clothing', 'Coffee ceremony'],
        ARRAY['Understand key historical events', 'Identify traditional garments', 'Describe coffee ceremony steps'],
        ARRAY['Chapter 1: History of Ethiopia', 'Article: Ethiopian Coffee Culture'],
        ARRAY['Assignment 1: Cultural Research Paper'],
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '7 days',
        true
      ),
      (
        v_course_id,
        'Language Fundamentals',
        'Master the basics of Amharic language and grammar',
        2,
        ARRAY['Amharic alphabet', 'Basic vocabulary', 'Simple phrases'],
        ARRAY['Read and write the Amharic alphabet', 'Use common greetings', 'Form simple sentences'],
        ARRAY['Chapter 2: Amharic Writing System', 'Vocabulary List 1-50'],
        ARRAY['Assignment 2: Alphabet Practice', 'Quiz 1: Vocabulary'],
        CURRENT_DATE + INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '14 days',
        true
      ),
      (
        v_course_id,
        'Cultural Practices & Traditions',
        'Deep dive into Ethiopian celebrations and social customs',
        3,
        ARRAY['Major holidays', 'Social etiquette', 'Family structures'],
        ARRAY['Explain major Ethiopian holidays', 'Demonstrate proper greetings', 'Understand family dynamics'],
        ARRAY['Chapter 3: Ethiopian Holidays', 'Video: Traditional Celebrations'],
        ARRAY['Assignment 3: Holiday Presentation'],
        CURRENT_DATE + INTERVAL '14 days',
        CURRENT_DATE + INTERVAL '21 days',
        true
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ======================
-- 7. ADD SAMPLE ATTENDANCE RECORDS
-- ======================

DO $$
DECLARE
  v_student_id uuid;
  v_course_id uuid;
  v_date date;
BEGIN
  SELECT id INTO v_student_id FROM auth.users WHERE email = 'student@liqlearns.com';
  
  v_course_id := (
    SELECT course_id 
    FROM course_enrollments 
    WHERE student_id = v_student_id 
    ORDER BY enrolled_at DESC
    LIMIT 1
  );

  IF v_student_id IS NOT NULL AND v_course_id IS NOT NULL THEN
    FOR i IN 1..10 LOOP
      v_date := CURRENT_DATE - (i * 2);

      INSERT INTO course_attendance (
        student_id,
        course_id,
        attendance_date,
        status,
        duration_minutes,
        notes
      )
      VALUES (
        v_student_id,
        v_course_id,
        v_date,
        CASE
          WHEN i <= 7 THEN 'present'
          WHEN i = 8 THEN 'late'
          ELSE 'absent'
        END,
        CASE
          WHEN i <= 7 THEN 45
          WHEN i = 8 THEN 30
          ELSE 0
        END,
        CASE
          WHEN i = 8 THEN 'Arrived 15 minutes late'
          WHEN i > 8 THEN 'Was sick'
          ELSE NULL
        END
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- ======================
-- 8. ADD SAMPLE OUTCOMES
-- ======================

DO $$
DECLARE
  v_student_id uuid;
  v_course_id uuid;
BEGIN
  SELECT id INTO v_student_id FROM auth.users WHERE email = 'student@liqlearns.com';
  
  v_course_id := (
    SELECT course_id 
    FROM course_enrollments 
    WHERE student_id = v_student_id 
    ORDER BY enrolled_at DESC
    LIMIT 1
  );

  IF v_course_id IS NOT NULL THEN
    INSERT INTO course_outcomes (
      course_id,
      outcome_number,
      title,
      description,
      category,
      mastery_criteria,
      assessment_methods,
      is_active
    )
    VALUES
      (
        v_course_id,
        1,
        'Cultural Knowledge',
        'Demonstrate understanding of Ethiopian history and traditions',
        'knowledge',
        ARRAY['Score 80%+ on cultural quiz', 'Complete research paper', 'Participate in discussions'],
        ARRAY['Quizzes', 'Written assignments', 'Discussion participation'],
        true
      ),
      (
        v_course_id,
        2,
        'Language Proficiency',
        'Read, write, and speak basic Amharic',
        'skills',
        ARRAY['Read Amharic text fluently', 'Write simple sentences', 'Hold basic conversation'],
        ARRAY['Reading assessments', 'Writing samples', 'Oral exams'],
        true
      ),
      (
        v_course_id,
        3,
        'Cultural Appreciation',
        'Show respect and understanding of Ethiopian culture',
        'attitudes',
        ARRAY['Participate in cultural events', 'Engage respectfully in discussions', 'Complete cultural immersion activities'],
        ARRAY['Event participation', 'Peer evaluations', 'Reflection essays'],
        true
      )
    ON CONFLICT DO NOTHING;

    IF v_student_id IS NOT NULL THEN
      INSERT INTO student_outcome_progress (
        student_id,
        outcome_id,
        mastery_level,
        evidence_count,
        last_assessed_at,
        notes
      )
      SELECT
        v_student_id,
        id,
        CASE
          WHEN outcome_number = 1 THEN 75
          WHEN outcome_number = 2 THEN 60
          ELSE 85
        END,
        CASE
          WHEN outcome_number = 1 THEN 4
          WHEN outcome_number = 2 THEN 3
          ELSE 5
        END,
        NOW() - INTERVAL '3 days',
        'Good progress, continue practicing'
      FROM course_outcomes
      WHERE course_id = v_course_id
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- ======================
-- 9. CREATE SAMPLE STUDY ROOMS
-- ======================

DO $$
DECLARE
  v_student_id uuid;
  v_age_group_val age_group;
BEGIN
  SELECT id INTO v_student_id FROM auth.users WHERE email = 'student@liqlearns.com';

  IF v_student_id IS NOT NULL THEN
    v_age_group_val := (
      SELECT calculate_age_group(date_of_birth)
      FROM user_profiles
      WHERE id = v_student_id
      LIMIT 1
    );

    INSERT INTO study_rooms (
      name,
      age_group,
      status,
      current_participants,
      max_participants,
      started_at
    )
    VALUES
      (
        'Ethiopian Culture Study Group',
        v_age_group_val,
        'active',
        3,
        12,
        NOW() - INTERVAL '15 minutes'
      ),
      (
        'Language Practice Room',
        v_age_group_val,
        'waiting',
        0,
        12,
        NULL
      ),
      (
        'Homework Help Session',
        v_age_group_val,
        'active',
        5,
        12,
        NOW() - INTERVAL '30 minutes'
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

COMMIT;