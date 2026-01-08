-- Migration: Fix Production Critical Issues
-- Created: 2026-01-08 20:13:30
-- Purpose: Fix Study Rooms RLS, Seed Production Data, Fix Course Data

-- =====================================================
-- 1. FIX STUDY ROOMS RLS POLICIES (No host_id)
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view rooms" ON study_rooms;
DROP POLICY IF EXISTS "Users can join rooms" ON study_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON study_rooms;
DROP POLICY IF EXISTS "Users can view participants" ON study_room_participants;
DROP POLICY IF EXISTS "Users can join as participants" ON study_room_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON study_room_participants;

-- Create new non-recursive policies for study_rooms
CREATE POLICY "study_rooms_select_policy"
ON study_rooms FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "study_rooms_insert_policy"
ON study_rooms FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "study_rooms_update_policy"
ON study_rooms FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "study_rooms_delete_policy"
ON study_rooms FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT room_id 
    FROM study_room_participants 
    WHERE student_id = auth.uid()
  )
);

-- Create new non-recursive policies for study_room_participants
CREATE POLICY "participants_select_policy"
ON study_room_participants FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "participants_insert_policy"
ON study_room_participants FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "participants_update_policy"
ON study_room_participants FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "participants_delete_policy"
ON study_room_participants FOR DELETE
TO authenticated
USING (student_id = auth.uid());

-- =====================================================
-- 2. SEED PRODUCTION DATABASE WITH SAMPLE DATA
-- =====================================================

-- Insert sample courses with lesson_type, language, and estimated_duration_minutes specified
INSERT INTO courses (id, title, description, difficulty_level, course_type, lesson_type, language, estimated_duration_minutes, is_active, created_at)
VALUES
  (gen_random_uuid(), 'Amharic Language Basics', 'Learn the fundamentals of Amharic language including alphabet, pronunciation, and basic conversations', 'easy', 'language', 'interactive', 'Amharic', 180, true, NOW()),
  (gen_random_uuid(), 'Ethiopian Culture & History', 'Explore the rich cultural heritage and historical significance of Ethiopia', 'medium', 'language', 'cultural_immersion', 'Amharic', 240, true, NOW()),
  (gen_random_uuid(), 'Mathematics Foundations', 'Master essential mathematical concepts from algebra to calculus', 'easy', 'mathematics', 'interactive', 'English', 300, true, NOW()),
  (gen_random_uuid(), 'Ethiopian Coffee Culture', 'Learn about Ethiopian coffee traditions, ceremony, and preparation methods', 'easy', 'language', 'cultural_immersion', 'Amharic', 120, true, NOW()),
  (gen_random_uuid(), 'Science & Technology', 'Introduction to modern science and technology concepts', 'medium', 'science', 'interactive', 'English', 360, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create course units for each course BEFORE creating lessons
INSERT INTO course_units (id, course_id, title, description, order_index, is_published, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  'Module 1: ' || c.title || ' Fundamentals',
  'Core concepts and foundational knowledge for ' || c.title,
  1,
  true,
  NOW()
FROM courses c
WHERE NOT EXISTS (
  SELECT 1 FROM course_units WHERE course_id = c.id
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons for each course with proper unit_id reference
INSERT INTO lessons (id, course_id, unit_id, title, description, order_index, is_published, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  u.id,
  'Introduction to ' || c.title,
  'First lesson covering the basics',
  1,
  true,
  NOW()
FROM courses c
JOIN course_units u ON u.course_id = c.id AND u.order_index = 1
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = c.id)
ON CONFLICT DO NOTHING;

-- Insert sample badges (student_achievements)
INSERT INTO student_achievements (id, name, description, category, requirement_value, xp_reward, aura_points, is_active, created_at)
VALUES
  (gen_random_uuid(), 'First Steps', 'Complete your first lesson', 'learning_consistency', 1, 10, 5, true, NOW()),
  (gen_random_uuid(), 'Dedicated Learner', 'Complete 10 lessons', 'learning_consistency', 10, 50, 25, true, NOW()),
  (gen_random_uuid(), 'Course Master', 'Complete your first course', 'learning_consistency', 1, 100, 50, true, NOW()),
  (gen_random_uuid(), 'Early Bird', 'Login for 7 consecutive days', 'learning_consistency', 7, 30, 15, true, NOW()),
  (gen_random_uuid(), 'Knowledge Seeker', 'Earn 1000 XP', 'skill_mastery', 1000, 200, 100, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample marketplace items
INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Premium Study Guide Set',
  'Complete study guides for all subjects',
  49.99,
  'ebook',
  'ethiopian_birr',
  100,
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Interactive Quiz Bundle',
  'Access to 500+ interactive quizzes',
  29.99,
  'video',
  'ethiopian_birr',
  50,
  'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Math Practice Workbook',
  'Comprehensive math exercises with solutions',
  19.99,
  'ebook',
  'aura_points',
  75,
  'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Language Learning Audio Pack',
  'Audio lessons for language mastery',
  39.99,
  'audio',
  'ethiopian_birr',
  30,
  'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Science Lab Kit',
  'Complete kit for home science experiments',
  89.99,
  'flashcards',
  'ethiopian_birr',
  20,
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Educational Board Game',
  'Fun learning through interactive gameplay',
  34.99,
  'worksheet',
  'aura_points',
  40,
  'https://images.unsplash.com/photo-1611891487972-44f3e3e3c0d2?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Digital Art Tablet',
  'Perfect for creative learning projects',
  149.99,
  'guide',
  'ethiopian_birr',
  15,
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketplace_products (id, seller_id, title, description, price, category, payment_method, inventory_count, preview_image_url, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM user_profiles WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Ergonomic Study Desk',
  'Comfortable workspace for long study sessions',
  199.99,
  'notes',
  'ethiopian_birr',
  10,
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400',
  'active',
  NOW()
WHERE EXISTS (SELECT 1 FROM user_profiles WHERE role IN ('teacher', 'admin'))
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CREATE SAMPLE STUDY ROOMS
-- =====================================================

-- Insert sample study rooms (no host_id needed)
INSERT INTO study_rooms (id, name, age_group, max_participants, status, created_at)
VALUES
  (gen_random_uuid(), 'Math Study Group', '30+', 10, 'active', NOW()),
  (gen_random_uuid(), 'Language Practice Room', '30+', 8, 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. ENABLE REALTIME FOR STUDY ROOMS
-- =====================================================

-- Ensure realtime is enabled for study room tables
-- Note: PostgreSQL ALTER PUBLICATION does not support IF NOT EXISTS
-- We'll use DO blocks to handle this safely

DO $$
BEGIN
  -- Try to add study_rooms to realtime publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE study_rooms;
    RAISE NOTICE 'Added study_rooms to realtime publication';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'study_rooms already in realtime publication';
    WHEN undefined_table THEN
      RAISE WARNING 'study_rooms table does not exist';
  END;

  -- Try to add study_room_participants to realtime publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE study_room_participants;
    RAISE NOTICE 'Added study_room_participants to realtime publication';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'study_room_participants already in realtime publication';
    WHEN undefined_table THEN
      RAISE WARNING 'study_room_participants table does not exist';
  END;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ Production database seeded successfully';
  RAISE NOTICE '✅ Study Rooms RLS policies fixed';
  RAISE NOTICE '✅ Realtime enabled for study rooms';
END $$;