-- Update demo user (ceo) with realistic stats for testing dashboard
UPDATE public.student_profiles
SET 
  xp = 3400,
  gold = 150,
  streak = 7,
  current_level = 3,
  level_name = 'Intermediate',
  rank_title = 'Scholar',
  aura_points = 1250
WHERE id = (
  SELECT id FROM public.user_profiles WHERE username = 'ceo' LIMIT 1
);

-- Create some sample course enrollments for the ceo user if they don't exist
INSERT INTO public.course_enrollments (student_id, course_id, enrolled_at, is_completed, progress_percentage)
SELECT 
  sp.id,
  c.id,
  NOW() - INTERVAL '30 days',
  false,
  30
FROM public.student_profiles sp
CROSS JOIN (SELECT id FROM public.courses LIMIT 2) c
WHERE sp.id = (SELECT id FROM public.user_profiles WHERE username = 'ceo' LIMIT 1)
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Mark one course as completed
UPDATE public.course_enrollments
SET 
  is_completed = true,
  completed_at = NOW() - INTERVAL '5 days',
  progress_percentage = 100
WHERE student_id = (SELECT id FROM public.user_profiles WHERE username = 'ceo' LIMIT 1)
  AND id = (
    SELECT id FROM public.course_enrollments 
    WHERE student_id = (SELECT id FROM public.user_profiles WHERE username = 'ceo' LIMIT 1)
    LIMIT 1
  );