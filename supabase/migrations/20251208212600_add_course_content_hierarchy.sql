-- Migration: Add hierarchical course content management system
-- CEO -> Courses, Teachers -> Titles, Students -> Content Items

-- Create course_titles table (Teacher-managed modules/topics within courses)
CREATE TABLE IF NOT EXISTS course_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  
  CONSTRAINT unique_course_title_order UNIQUE(course_id, order_index)
);

-- Create course_content_items table (Student-contributed content for titles)
CREATE TABLE IF NOT EXISTS course_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_title_id UUID NOT NULL REFERENCES course_titles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'document', 'image', 'game', 'movie', 'interactive', 'article', 'quiz', 'exercise', 'flashcard', 'notes', 'presentation', 'animation', 'simulation', 'podcast', 'ebook', 'infographic', 'code')),
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT,
  content_data JSONB,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT unique_title_content_order UNIQUE(course_title_id, order_index)
);

-- Create indexes for better performance
CREATE INDEX idx_course_titles_course ON course_titles(course_id);
CREATE INDEX idx_course_titles_created_by ON course_titles(created_by);
CREATE INDEX idx_course_titles_published ON course_titles(is_published);

CREATE INDEX idx_course_content_items_title ON course_content_items(course_title_id);
CREATE INDEX idx_course_content_items_created_by ON course_content_items(created_by);
CREATE INDEX idx_course_content_items_approved ON course_content_items(is_approved);
CREATE INDEX idx_course_content_items_type ON course_content_items(content_type);

-- Enable Row Level Security
ALTER TABLE course_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_titles
-- CEO and Admins can see all titles
CREATE POLICY "CEO and Admins can view all course titles" ON course_titles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('ceo', 'admin')
    )
  );

-- Teachers can see titles they created or published titles in their subject
CREATE POLICY "Teachers can view relevant course titles" ON course_titles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.role = 'teacher'
        AND (created_by = auth.uid() OR is_published = true)
      )
    )
  );

-- Students can see published titles only
CREATE POLICY "Students can view published course titles" ON course_titles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'student'
    )
    AND is_published = true
  );

-- Teachers can insert titles for courses
CREATE POLICY "Teachers can create course titles" ON course_titles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'ceo', 'admin')
    )
    AND created_by = auth.uid()
  );

-- Teachers can update their own titles, CEO/Admin can update any
CREATE POLICY "Teachers can update own titles, CEO/Admin update any" ON course_titles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        (user_profiles.role = 'teacher' AND course_titles.created_by = auth.uid())
        OR user_profiles.role IN ('ceo', 'admin')
      )
    )
  );

-- Only CEO/Admin can delete titles
CREATE POLICY "CEO and Admins can delete course titles" ON course_titles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('ceo', 'admin')
    )
  );

-- RLS Policies for course_content_items
-- Everyone can see approved content
CREATE POLICY "Anyone can view approved content items" ON course_content_items
  FOR SELECT
  USING (
    is_approved = true
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('ceo', 'admin', 'teacher')
    )
  );

-- Students can insert content items for any title
CREATE POLICY "Students can create content items" ON course_content_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'student'
    )
    AND created_by = auth.uid()
  );

-- Students can update their own unapproved content
CREATE POLICY "Students can update own unapproved content" ON course_content_items
  FOR UPDATE
  USING (
    created_by = auth.uid()
    AND is_approved = false
  );

-- Teachers, CEO, Admin can approve/update content
CREATE POLICY "Teachers can approve and update content items" ON course_content_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'ceo', 'admin')
    )
  );

-- Students can delete their own unapproved content, staff can delete any
CREATE POLICY "Students can delete own unapproved content" ON course_content_items
  FOR DELETE
  USING (
    (created_by = auth.uid() AND is_approved = false)
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'ceo', 'admin')
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_titles_updated_at
  BEFORE UPDATE ON course_titles
  FOR EACH ROW
  EXECUTE FUNCTION update_course_content_updated_at();

CREATE TRIGGER update_course_content_items_updated_at
  BEFORE UPDATE ON course_content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_course_content_updated_at();

-- Add comments for documentation
COMMENT ON TABLE course_titles IS 'Teacher-managed modules/topics within courses - hierarchical level between courses and content';
COMMENT ON TABLE course_content_items IS 'Student-contributed content items for course titles - 20 types of learning materials';
COMMENT ON COLUMN course_content_items.content_type IS 'Type of content: video, audio, document, image, game, movie, interactive, article, quiz, exercise, flashcard, notes, presentation, animation, simulation, podcast, ebook, infographic, code';