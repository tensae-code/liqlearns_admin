-- ============================================================================
-- Migration: Real Stats System Implementation
-- Purpose: Add XP increment system and quest completion rewards
-- Timestamp: 20260106092100
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE RPC FUNCTION FOR SAFE XP INCREMENT
-- ============================================================================
-- This function safely increments XP in student_profiles table with level calculation
CREATE OR REPLACE FUNCTION public.increment_student_profile_xp(
  p_student_id UUID,
  p_xp_amount INTEGER,
  p_gold_amount INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
BEGIN
  -- Get current stats
  SELECT xp, current_level
  INTO v_current_xp, v_old_level
  FROM public.student_profiles
  WHERE id = p_student_id;

  -- Calculate new values
  v_new_xp := COALESCE(v_current_xp, 0) + p_xp_amount;
  v_new_level := public.calculate_level_from_xp(v_new_xp);
  v_level_up := v_new_level > v_old_level;

  -- Update student_profiles
  UPDATE public.student_profiles
  SET 
    xp = v_new_xp,
    current_level = v_new_level,
    level_name = public.get_level_name(v_new_level),
    rank_title = public.get_rank_title(v_new_level),
    gold = COALESCE(gold, 0) + p_gold_amount
  WHERE id = p_student_id;

  -- Log activity in user_activities table
  INSERT INTO public.user_activities (user_id, title, xp_earned)
  VALUES (
    p_student_id,
    CASE 
      WHEN v_level_up THEN format('Achieved Level %s milestone', v_new_level)
      ELSE format('Earned %s XP', p_xp_amount)
    END,
    p_xp_amount
  );

  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'old_xp', v_current_xp,
    'new_xp', v_new_xp,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'level_up', v_level_up,
    'gold_added', p_gold_amount
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_student_profile_xp TO authenticated;

-- ============================================================================
-- STEP 2: CREATE TRIGGER FOR AUTOMATIC QUEST COMPLETION REWARDS
-- ============================================================================
-- This trigger automatically awards XP and gold when a quest is marked as completed
CREATE OR REPLACE FUNCTION public.reward_quest_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mission RECORD;
BEGIN
  -- Only proceed if quest was just completed
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    
    -- Get mission details to know rewards
    SELECT xp_reward, gold_reward, title
    INTO v_mission
    FROM public.daily_missions
    WHERE id = NEW.mission_id;

    -- Award XP and gold via RPC function (creates activity log automatically)
    PERFORM public.increment_student_profile_xp(
      NEW.student_id,
      COALESCE(v_mission.xp_reward, 50),
      COALESCE(v_mission.gold_reward, 50)
    );

    RAISE NOTICE 'Quest completed: % earned % XP and % gold', 
      v_mission.title, 
      v_mission.xp_reward, 
      v_mission.gold_reward;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on student_mission_progress
DROP TRIGGER IF EXISTS trigger_reward_quest_completion ON public.student_mission_progress;
CREATE TRIGGER trigger_reward_quest_completion
  AFTER UPDATE ON public.student_mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.reward_quest_completion();

-- ============================================================================
-- STEP 3: ADD SAMPLE DAILY QUESTS FOR TESTING
-- ============================================================================
-- Insert diverse sample quests across all 7 life categories
DO $$
DECLARE
  v_tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
BEGIN
  -- Only insert if no quests exist for tomorrow
  IF NOT EXISTS (SELECT 1 FROM public.daily_missions WHERE mission_date = v_tomorrow LIMIT 1) THEN
    
    INSERT INTO public.daily_missions (
      title, description, category, difficulty_level, 
      xp_reward, gold_reward, mission_date, is_active
    ) VALUES
    -- Spiritual quest
    ('Morning Meditation Practice', 
     'Complete 15 minutes of mindfulness meditation to start your day with clarity', 
     'spiritual', 'easy', 60, 40, v_tomorrow, true),
    
    -- Health quest
    ('30-Minute Cardio Workout', 
     'Complete a 30-minute cardio session - running, cycling, or aerobics', 
     'health', 'medium', 100, 60, v_tomorrow, true),
    
    -- Wealth quest
    ('Review Monthly Budget', 
     'Review last month''s expenses and create this month''s budget plan', 
     'wealth', 'medium', 80, 50, v_tomorrow, true),
    
    -- Service quest
    ('Help a Classmate', 
     'Spend 20 minutes helping a fellow student understand a difficult concept', 
     'service', 'easy', 70, 45, v_tomorrow, true),
    
    -- Education quest (AI-suggested)
    ('Complete Math Practice Set', 
     'Finish 10 algebra problems from Chapter 5 practice exercises', 
     'education', 'hard', 150, 80, v_tomorrow, true),
    
    -- Family quest
    ('Quality Family Time', 
     'Spend 1 hour of undistracted time with family - no phones!', 
     'family', 'easy', 65, 40, v_tomorrow, true),
    
    -- Social quest
    ('Connect with 3 Friends', 
     'Have meaningful conversations with 3 friends today', 
     'social', 'medium', 75, 45, v_tomorrow, true);

    RAISE NOTICE 'Created 7 sample daily quests for tomorrow (%)', v_tomorrow;
  ELSE
    RAISE NOTICE 'Quests already exist for tomorrow - skipping sample data';
  END IF;
END;
$$;

-- ============================================================================
-- STEP 4: SEED INITIAL STATS FOR EXISTING USERS
-- ============================================================================
-- CRITICAL FIX: Ensure both user_profiles AND student_profiles exist for all auth users
DO $$
DECLARE
  v_user_record RECORD;
  v_inserted_profiles INTEGER := 0;
  v_inserted_students INTEGER := 0;
BEGIN
  -- Loop through all auth.users
  FOR v_user_record IN 
    SELECT DISTINCT u.id, u.email
    FROM auth.users u
  LOOP
    -- STEP 4A: Ensure user_profiles record exists first
    INSERT INTO public.user_profiles (
      id, email, full_name, role, account_status
    ) VALUES (
      v_user_record.id,
      COALESCE(v_user_record.email, 'user@example.com'),
      'User',
      'student',
      'active'
    )
    ON CONFLICT (id) DO NOTHING;

    IF FOUND THEN
      v_inserted_profiles := v_inserted_profiles + 1;
    END IF;

    -- STEP 4B: Now create student_profiles (foreign key will be satisfied)
    INSERT INTO public.student_profiles (
      id, xp, aura_points, current_level, streak, gold,
      level_name, rank_title
    ) VALUES (
      v_user_record.id, 0, 0, 1, 0, 0,
      'Beginner', 'Novice Learner'
    )
    ON CONFLICT (id) DO NOTHING;

    IF FOUND THEN
      v_inserted_students := v_inserted_students + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Created % user_profiles and % student_profiles for existing users', 
    v_inserted_profiles, v_inserted_students;
END;
$$;

-- ============================================================================
-- STEP 5: ADD HELPFUL COMMENT AND VERIFICATION
-- ============================================================================
COMMENT ON FUNCTION public.increment_student_profile_xp IS 
  'Safely increments XP in student_profiles, calculates level ups, and logs activity. Call this from services or edge functions.';

COMMENT ON FUNCTION public.reward_quest_completion IS 
  'Trigger function that automatically awards XP/gold when student completes a quest in student_mission_progress table.';

-- Verify tables exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'student_profiles') = 1,
    'ERROR: student_profiles table not found!';
    
  ASSERT (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'daily_missions') = 1,
    'ERROR: daily_missions table not found!';
    
  ASSERT (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'user_activities') = 1,
    'ERROR: user_activities table not found!';

  RAISE NOTICE '✅ Migration completed successfully - Real stats system ready!';
  RAISE NOTICE '📊 Functions created: increment_student_profile_xp, reward_quest_completion';
  RAISE NOTICE '🎯 Sample quests added for tomorrow';
  RAISE NOTICE '👥 Existing users initialized with default stats';
END;
$$;