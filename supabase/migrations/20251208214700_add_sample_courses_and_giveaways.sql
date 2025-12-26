-- Add sample courses with course giveaways
-- This migration adds demo courses for CEO, Admin, and Support dashboards
-- Plus 20 promotional/giveaway courses

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert sample courses for each role view
DO $$
DECLARE
  ceo_course_id UUID;
  admin_course_id UUID;
  support_course_id UUID;
  giveaway_course_id UUID;
  ceo_unit_id UUID;
  admin_unit_id UUID;
  support_unit_id UUID;
  i INTEGER;
BEGIN
  -- Sample course for CEO Dashboard
  INSERT INTO courses (
    title,
    description,
    course_type,
    difficulty_level,
    language,
    lesson_type,
    estimated_duration_minutes,
    cultural_theme,
    xp_reward,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    'Executive Leadership Development',
    'Advanced leadership course designed for CEOs and senior executives to master strategic decision-making and organizational transformation.',
    'science'::course_type,
    'hard'::difficulty_level,
    'English',
    'interactive'::lesson_type,
    600,
    'Professional',
    500,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO ceo_course_id;

  -- Create course unit for CEO course
  INSERT INTO course_units (
    course_id,
    title,
    description,
    order_index,
    is_published,
    created_at,
    updated_at
  ) VALUES (
    ceo_course_id,
    'Strategic Leadership Fundamentals',
    'Core principles of executive leadership and organizational management.',
    1,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO ceo_unit_id;

  -- Create lessons for CEO course
  INSERT INTO lessons (
    course_id,
    unit_id,
    title,
    description,
    order_index,
    estimated_duration_minutes,
    xp_reward,
    is_published,
    created_at,
    updated_at
  ) VALUES
    (ceo_course_id, ceo_unit_id, 'Vision and Mission Development', 'Learn to craft compelling organizational vision and mission statements.', 1, 60, 50, true, NOW(), NOW()),
    (ceo_course_id, ceo_unit_id, 'Strategic Planning Essentials', 'Master the art of long-term strategic planning and execution.', 2, 90, 75, true, NOW(), NOW()),
    (ceo_course_id, ceo_unit_id, 'Team Building at Scale', 'Build and manage high-performing executive teams.', 3, 75, 60, true, NOW(), NOW());

  -- Sample course for Admin Dashboard
  INSERT INTO courses (
    title,
    description,
    course_type,
    difficulty_level,
    language,
    lesson_type,
    estimated_duration_minutes,
    cultural_theme,
    xp_reward,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    'System Administration & Analytics',
    'Comprehensive training for administrators covering system management, user analytics, and platform optimization.',
    'mathematics'::course_type,
    'medium'::difficulty_level,
    'English',
    'interactive'::lesson_type,
    450,
    'Professional',
    400,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO admin_course_id;

  -- Create course unit for Admin course
  INSERT INTO course_units (
    course_id,
    title,
    description,
    order_index,
    is_published,
    created_at,
    updated_at
  ) VALUES (
    admin_course_id,
    'Platform Administration Basics',
    'Essential skills for platform administrators and content moderators.',
    1,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO admin_unit_id;

  -- Create lessons for Admin course
  INSERT INTO lessons (
    course_id,
    unit_id,
    title,
    description,
    order_index,
    estimated_duration_minutes,
    xp_reward,
    is_published,
    created_at,
    updated_at
  ) VALUES
    (admin_course_id, admin_unit_id, 'User Management Best Practices', 'Effective strategies for managing user accounts and permissions.', 1, 45, 40, true, NOW(), NOW()),
    (admin_course_id, admin_unit_id, 'Content Moderation Techniques', 'Learn to moderate and review platform content efficiently.', 2, 60, 50, true, NOW(), NOW()),
    (admin_course_id, admin_unit_id, 'Analytics and Reporting', 'Master platform analytics and generate insightful reports.', 3, 75, 60, true, NOW(), NOW());

  -- Sample course for Support Dashboard
  INSERT INTO courses (
    title,
    description,
    course_type,
    difficulty_level,
    language,
    lesson_type,
    estimated_duration_minutes,
    cultural_theme,
    xp_reward,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    'Customer Support Excellence',
    'Master the art of exceptional customer support, including ticket management, communication skills, and conflict resolution.',
    'language'::course_type,
    'easy'::difficulty_level,
    'English',
    'conversation'::lesson_type,
    300,
    'Professional',
    300,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO support_course_id;

  -- Create course unit for Support course
  INSERT INTO course_units (
    course_id,
    title,
    description,
    order_index,
    is_published,
    created_at,
    updated_at
  ) VALUES (
    support_course_id,
    'Customer Support Fundamentals',
    'Core principles of providing excellent customer support and technical assistance.',
    1,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO support_unit_id;

  -- Create lessons for Support course
  INSERT INTO lessons (
    course_id,
    unit_id,
    title,
    description,
    order_index,
    estimated_duration_minutes,
    xp_reward,
    is_published,
    created_at,
    updated_at
  ) VALUES
    (support_course_id, support_unit_id, 'Communication Skills for Support', 'Master effective communication with users and clients.', 1, 45, 35, true, NOW(), NOW()),
    (support_course_id, support_unit_id, 'Ticket Management Systems', 'Learn to efficiently manage and resolve support tickets.', 2, 50, 40, true, NOW(), NOW()),
    (support_course_id, support_unit_id, 'Problem-Solving Strategies', 'Develop critical thinking for troubleshooting technical issues.', 3, 60, 50, true, NOW(), NOW());

  -- Now create 20 course giveaway promotional courses
  FOR i IN 1..20 LOOP
    INSERT INTO courses (
      title,
      description,
      course_type,
      difficulty_level,
      language,
      lesson_type,
      estimated_duration_minutes,
      cultural_theme,
      xp_reward,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      'Giveaway Course ' || i || ': ' || 
      CASE 
        WHEN i % 3 = 0 THEN 'Advanced Skills Development'
        WHEN i % 3 = 1 THEN 'Professional Growth Track'
        ELSE 'Career Advancement Program'
      END,
      'FREE promotional course - ' || 
      CASE 
        WHEN i % 3 = 0 THEN 'Master advanced techniques and methodologies for professional excellence.'
        WHEN i % 3 = 1 THEN 'Accelerate your career with industry-leading training and certification.'
        ELSE 'Unlock your potential with cutting-edge skills and knowledge.'
      END,
      (CASE 
        WHEN i % 3 = 0 THEN 'language'
        WHEN i % 3 = 1 THEN 'mathematics'
        ELSE 'science'
      END)::course_type,
      (CASE 
        WHEN i <= 7 THEN 'easy'
        WHEN i <= 14 THEN 'medium'
        ELSE 'hard'
      END)::difficulty_level,
      'English',
      (CASE 
        WHEN i % 2 = 0 THEN 'interactive'
        ELSE 'cultural_immersion'
      END)::lesson_type,
      300 + (i * 30),
      CASE 
        WHEN i % 4 = 0 THEN 'Modern'
        WHEN i % 4 = 1 THEN 'Traditional'
        WHEN i % 4 = 2 THEN 'Professional'
        ELSE 'Academic'
      END,
      100 + (i * 10),
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO giveaway_course_id;

    -- Add a course unit for each giveaway course
    INSERT INTO course_units (
      course_id,
      title,
      description,
      order_index,
      is_published,
      created_at,
      updated_at
    ) VALUES (
      giveaway_course_id,
      'Module 1: Foundation',
      'Build your foundational knowledge in this comprehensive module.',
      1,
      true,
      NOW(),
      NOW()
    );

    -- Add 2-3 lessons per giveaway course
    INSERT INTO lessons (
      course_id,
      unit_id,
      title,
      description,
      order_index,
      estimated_duration_minutes,
      xp_reward,
      is_published,
      created_at,
      updated_at
    ) SELECT 
      giveaway_course_id,
      cu.id,
      'Lesson ' || ln || ': Core Concepts',
      'Essential concepts and practical applications.',
      ln,
      30 + (ln * 10),
      25 + (ln * 5),
      true,
      NOW(),
      NOW()
    FROM course_units cu
    CROSS JOIN generate_series(1, 2 + (i % 2)) AS ln
    WHERE cu.course_id = giveaway_course_id
    LIMIT 3;
  END LOOP;

  RAISE NOTICE 'Successfully created sample courses:';
  RAISE NOTICE '- CEO Executive Leadership Course (ID: %)', ceo_course_id;
  RAISE NOTICE '- Admin Platform Management Mastery (ID: %)', admin_course_id;
  RAISE NOTICE '- Support Excellence Training Program (ID: %)', support_course_id;
  RAISE NOTICE '- 20 Giveaway Promotional Courses';
END $$;

-- Add marketplace products for giveaway courses (free promotional items)
INSERT INTO marketplace_products (
  seller_id,
  title,
  description,
  category,
  price,
  payment_method,
  file_url,
  preview_image_url,
  status,
  inventory_count,
  downloads_allowed,
  access_expiry_days,
  printable,
  shareable,
  rating_average,
  total_sales,
  created_at,
  updated_at
)
SELECT 
  (SELECT id FROM user_profiles WHERE role = 'ceo' LIMIT 1),
  'Course Giveaway #' || ROW_NUMBER() OVER (ORDER BY c.created_at),
  'FREE ACCESS: ' || c.description,
  'ebook',
  0, -- Free
  'aura_points',
  'https://example.com/course/' || c.id || '/materials',
  'https://example.com/course/' || c.id || '/preview.jpg',
  'active',
  999999, -- Unlimited
  true, -- downloads_allowed is boolean, not integer
  365,
  true,
  true,
  5.0,
  0,
  NOW(),
  NOW()
FROM courses c
WHERE c.title LIKE 'Giveaway Course%'
ORDER BY c.created_at
LIMIT 20;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📚 Created 3 role-specific courses (CEO, Admin, Support)';
  RAISE NOTICE '🎁 Created 20 giveaway promotional courses';
  RAISE NOTICE '🛍️ Created 20 marketplace giveaway products';
END $$;