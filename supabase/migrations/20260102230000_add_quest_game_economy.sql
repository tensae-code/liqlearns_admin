-- ================================================================
-- PHASE 1: RPG GAME ECONOMY - XP/GOLD/QUESTS SYSTEM
-- FIXED: Removed generated column, using trigger instead
-- ================================================================

-- Step 1: Add game economy columns to user_profiles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'xp') THEN
    ALTER TABLE public.user_profiles ADD COLUMN xp INT DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'gold') THEN
    ALTER TABLE public.user_profiles ADD COLUMN gold INT DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'streak') THEN
    ALTER TABLE public.user_profiles ADD COLUMN streak INT DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_quest_date') THEN
    ALTER TABLE public.user_profiles ADD COLUMN last_quest_date DATE DEFAULT NULL;
  END IF;
  
  RAISE NOTICE '✅ Game economy columns added to user_profiles';
END $$;

-- Step 2: Create quests table WITHOUT generated column
-- SOLUTION: Use regular DATE column + trigger to set it (avoids immutability issues)
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('learn', 'share', 'recruit')),
  reward_xp INT DEFAULT 100,
  reward_gold INT DEFAULT 50,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  -- FIX: Regular DATE column (not generated) - will be set by trigger
  quest_date DATE NOT NULL
);

-- Step 2a: Create trigger to auto-populate quest_date on insert
CREATE OR REPLACE FUNCTION set_quest_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Set quest_date to the date portion of created_at
  NEW.quest_date := (NEW.created_at AT TIME ZONE 'UTC')::date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DROP TRIGGER IF EXISTS trigger_set_quest_date ON public.quests;
CREATE TRIGGER trigger_set_quest_date
  BEFORE INSERT ON public.quests
  FOR EACH ROW
  EXECUTE FUNCTION set_quest_date();

-- Create indexes using the regular column (no immutability issues)
CREATE INDEX IF NOT EXISTS idx_quests_user_date ON public.quests(user_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_quests_completed ON public.quests(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_quests_type ON public.quests(type);

-- Step 3: Enable RLS on quests table
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own quests" ON public.quests;
DROP POLICY IF EXISTS "Users can insert their own quests" ON public.quests;
DROP POLICY IF EXISTS "Users can update their own quests" ON public.quests;

-- RLS Policies for quests
CREATE POLICY "Users can view their own quests"
  ON public.quests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quests"
  ON public.quests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quests"
  ON public.quests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 4: Create function to update user stats when quest completed
-- This trigger automatically updates XP/Gold when quest is marked complete
CREATE OR REPLACE FUNCTION update_user_stats_on_quest_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if quest is being marked as completed (not already complete)
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    UPDATE public.user_profiles
    SET 
      xp = COALESCE(xp, 0) + NEW.reward_xp,
      gold = COALESCE(gold, 0) + NEW.reward_gold,
      last_quest_date = CURRENT_DATE
    WHERE id = NEW.user_id;
    
    -- Set completed_at timestamp
    NEW.completed_at := NOW();
    
    RAISE NOTICE 'User % earned +% XP and +% Gold', NEW.user_id, NEW.reward_xp, NEW.reward_gold;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for quest completion
DROP TRIGGER IF EXISTS trigger_update_stats_on_quest_completion ON public.quests;
CREATE TRIGGER trigger_update_stats_on_quest_completion
  BEFORE UPDATE ON public.quests
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_quest_completion();

-- Step 5: Create leaderboard view for top recruiters
-- FIX: Use mlm_network instead of sponsor_referrals (which doesn't exist)
CREATE OR REPLACE VIEW public.top_recruiters AS
SELECT 
  up.id,
  up.full_name,
  up.username,
  COUNT(mn.id) as total_referrals,
  up.xp,
  up.gold,
  up.streak
FROM public.user_profiles up
LEFT JOIN public.mlm_network mn ON up.id = mn.sponsor_id
GROUP BY up.id, up.full_name, up.username, up.xp, up.gold, up.streak
ORDER BY total_referrals DESC, up.xp DESC
LIMIT 10;

-- Grant access to authenticated users
GRANT SELECT ON public.top_recruiters TO authenticated;

-- Step 6: Add helpful comments
COMMENT ON COLUMN public.quests.quest_date IS 'Date extracted from created_at via trigger - used for efficient daily quest queries';
COMMENT ON FUNCTION set_quest_date() IS 'Automatically populates quest_date column on quest insert';
COMMENT ON FUNCTION update_user_stats_on_quest_completion() IS 'Automatically updates user XP/Gold when quest is completed';
COMMENT ON VIEW public.top_recruiters IS 'Shows top 10 users by referral count and XP for leaderboard display';

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RPG Game Economy Migration Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Quest system tables created';
  RAISE NOTICE '✅ Quest date trigger installed (no immutability issues)';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Auto-reward trigger installed';
  RAISE NOTICE '✅ Leaderboard view created';
  RAISE NOTICE '========================================';
END $$;