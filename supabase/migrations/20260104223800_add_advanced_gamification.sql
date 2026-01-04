-- =====================================================
-- ADVANCED GAMIFICATION SYSTEM
-- Features: Daily Login Streaks, Seasonal Events, Team Guilds, Quest Variety
-- =====================================================

-- 1. Daily Login Streak System
CREATE TABLE IF NOT EXISTS public.login_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_login_date DATE,
    streak_rewards_earned INTEGER DEFAULT 0,
    seven_day_milestone_count INTEGER DEFAULT 0,
    thirty_day_milestone_count INTEGER DEFAULT 0,
    total_login_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Seasonal Events System
CREATE TABLE IF NOT EXISTS public.seasonal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'monthly_theme', 'holiday', 'special'
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reward_xp INTEGER DEFAULT 0,
    reward_gold INTEGER DEFAULT 0,
    special_badge_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    participation_requirement TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Event Participation Tracking
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.seasonal_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    reward_claimed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 4. Team/Guild System (leveraging MLM structure)
CREATE TABLE IF NOT EXISTS public.learning_guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_name VARCHAR(255) NOT NULL UNIQUE,
    guild_leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT,
    total_members INTEGER DEFAULT 1,
    total_xp BIGINT DEFAULT 0,
    guild_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Guild Membership
CREATE TABLE IF NOT EXISTS public.guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES public.learning_guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contribution_xp BIGINT DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 6. Guild Challenges
CREATE TABLE IF NOT EXISTS public.guild_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES public.learning_guilds(id) ON DELETE CASCADE,
    challenge_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_xp BIGINT NOT NULL,
    current_xp BIGINT DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    reward_gold INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Expanded Quest Types
CREATE TABLE IF NOT EXISTS public.quest_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_type VARCHAR(100) NOT NULL, -- 'watch_minutes', 'complete_assignment', 'help_teammate', 'daily_login', 'study_session'
    quest_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    gold_reward INTEGER DEFAULT 0,
    difficulty VARCHAR(50) DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'epic'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Achievement Unlock Animations Tracking
CREATE TABLE IF NOT EXISTS public.achievement_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL, -- 'badge', 'level', 'streak', 'event'
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    icon_url TEXT,
    shown BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Social Sharing Tracking
CREATE TABLE IF NOT EXISTS public.achievement_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'facebook', 'linkedin', 'copy_link'
    share_url TEXT,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_login_streaks_user ON public.login_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_login_streaks_current ON public.login_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_active ON public.seasonal_events(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild ON public.guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user ON public.guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_challenges_guild ON public.guild_challenges(guild_id);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_user ON public.achievement_notifications(user_id, shown);
CREATE INDEX IF NOT EXISTS idx_quest_templates_active ON public.quest_templates(is_active, quest_type);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Login Streaks Policies
ALTER TABLE public.login_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login streak"
    ON public.login_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own login streak"
    ON public.login_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own login streak"
    ON public.login_streaks FOR UPDATE
    USING (auth.uid() = user_id);

-- Seasonal Events Policies
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active events"
    ON public.seasonal_events FOR SELECT
    USING (is_active = TRUE);

-- Event Participants Policies
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event participation"
    ON public.event_participants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own event participation"
    ON public.event_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own event participation"
    ON public.event_participants FOR UPDATE
    USING (auth.uid() = user_id);

-- Learning Guilds Policies
ALTER TABLE public.learning_guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view guilds"
    ON public.learning_guilds FOR SELECT
    USING (TRUE);

CREATE POLICY "Guild leaders can update their guild"
    ON public.learning_guilds FOR UPDATE
    USING (auth.uid() = guild_leader_id);

-- Guild Members Policies
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view guild members"
    ON public.guild_members FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can insert own guild membership"
    ON public.guild_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Guild Challenges Policies
ALTER TABLE public.guild_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view guild challenges"
    ON public.guild_challenges FOR SELECT
    USING (TRUE);

-- Quest Templates Policies
ALTER TABLE public.quest_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active quest templates"
    ON public.quest_templates FOR SELECT
    USING (is_active = TRUE);

-- Achievement Notifications Policies
ALTER TABLE public.achievement_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievement notifications"
    ON public.achievement_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement notifications"
    ON public.achievement_notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Achievement Shares Policies
ALTER TABLE public.achievement_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares"
    ON public.achievement_shares FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shares"
    ON public.achievement_shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample Quest Templates
INSERT INTO public.quest_templates (quest_type, quest_name, description, target_value, xp_reward, gold_reward, difficulty) VALUES
    ('watch_minutes', 'Video Learner', 'Watch 30 minutes of course videos', 30, 50, 10, 'easy'),
    ('watch_minutes', 'Dedicated Viewer', 'Watch 120 minutes of course videos', 120, 150, 30, 'hard'),
    ('complete_assignment', 'Assignment Master', 'Complete 3 assignments', 3, 100, 20, 'medium'),
    ('help_teammate', 'Team Helper', 'Help 2 teammates with their questions', 2, 80, 15, 'medium'),
    ('study_session', 'Study Marathon', 'Complete 5 study sessions', 5, 200, 40, 'hard'),
    ('daily_login', 'Daily Dedication', 'Login for 7 consecutive days', 7, 150, 25, 'medium');

-- Sample Seasonal Event (New Year 2026)
INSERT INTO public.seasonal_events (event_name, event_type, description, start_date, end_date, reward_xp, reward_gold, is_active, participation_requirement) VALUES
    ('New Year Learning Challenge 2026', 'holiday', 'Complete 10 quests during January to earn exclusive rewards!', '2026-01-01', '2026-01-31', 500, 100, TRUE, 'Complete 10 quests in January 2026');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update login streak
CREATE OR REPLACE FUNCTION public.update_login_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_last_login DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_seven_day_count INTEGER;
    v_thirty_day_count INTEGER;
    v_new_streak INTEGER;
BEGIN
    -- Get current streak data
    SELECT last_login_date, current_streak, longest_streak, seven_day_milestone_count, thirty_day_milestone_count
    INTO v_last_login, v_current_streak, v_longest_streak, v_seven_day_count, v_thirty_day_count
    FROM public.login_streaks
    WHERE user_id = p_user_id;

    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.login_streaks (user_id, current_streak, longest_streak, last_login_date, total_login_days)
        VALUES (p_user_id, 1, 1, CURRENT_DATE, 1);
        RETURN;
    END IF;

    -- Check if already logged in today
    IF v_last_login = CURRENT_DATE THEN
        RETURN;
    END IF;

    -- Calculate new streak
    IF v_last_login = CURRENT_DATE - INTERVAL '1 day' THEN
        v_new_streak := v_current_streak + 1;
    ELSE
        v_new_streak := 1;
    END IF;

    -- Check for milestone rewards
    IF v_new_streak = 7 THEN
        v_seven_day_count := v_seven_day_count + 1;
        -- Award 7-day streak bonus
        UPDATE public.user_profiles
        SET xp = xp + 100, gold = gold + 20
        WHERE user_id = p_user_id;
    END IF;

    IF v_new_streak = 30 THEN
        v_thirty_day_count := v_thirty_day_count + 1;
        -- Award 30-day streak bonus
        UPDATE public.user_profiles
        SET xp = xp + 500, gold = gold + 100
        WHERE user_id = p_user_id;
    END IF;

    -- Update streak record
    UPDATE public.login_streaks
    SET current_streak = v_new_streak,
        longest_streak = GREATEST(v_longest_streak, v_new_streak),
        last_login_date = CURRENT_DATE,
        seven_day_milestone_count = v_seven_day_count,
        thirty_day_milestone_count = v_thirty_day_count,
        total_login_days = total_login_days + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create guild from referral network
CREATE OR REPLACE FUNCTION public.create_guild_from_network(p_leader_id UUID, p_guild_name VARCHAR)
RETURNS UUID AS $$
DECLARE
    v_guild_id UUID;
    v_total_xp BIGINT;
BEGIN
    -- Calculate total XP from referral network
    SELECT COALESCE(SUM(up.xp), 0)
    INTO v_total_xp
    FROM public.user_profiles up
    WHERE up.referred_by = p_leader_id;

    -- Create guild
    INSERT INTO public.learning_guilds (guild_name, guild_leader_id, total_xp, total_members)
    VALUES (p_guild_name, p_leader_id, v_total_xp, 1)
    RETURNING id INTO v_guild_id;

    -- Add leader as member
    INSERT INTO public.guild_members (guild_id, user_id, contribution_xp)
    SELECT v_guild_id, p_leader_id, xp
    FROM public.user_profiles
    WHERE user_id = p_leader_id;

    -- Add referred users as members
    INSERT INTO public.guild_members (guild_id, user_id, contribution_xp)
    SELECT v_guild_id, user_id, xp
    FROM public.user_profiles
    WHERE referred_by = p_leader_id;

    -- Update total members count
    UPDATE public.learning_guilds
    SET total_members = (SELECT COUNT(*) FROM public.guild_members WHERE guild_id = v_guild_id)
    WHERE id = v_guild_id;

    RETURN v_guild_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER TO AUTO-UPDATE GUILD XP
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_guild_xp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update guild total XP when member earns XP
    UPDATE public.learning_guilds lg
    SET total_xp = (
        SELECT COALESCE(SUM(gm.contribution_xp), 0)
        FROM public.guild_members gm
        WHERE gm.guild_id = lg.id
    ),
    guild_level = FLOOR((
        SELECT COALESCE(SUM(gm.contribution_xp), 0)
        FROM public.guild_members gm
        WHERE gm.guild_id = lg.id
    ) / 1000.0) + 1
    WHERE EXISTS (
        SELECT 1 FROM public.guild_members gm
        WHERE gm.user_id = NEW.user_id AND gm.guild_id = lg.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_guild_xp
AFTER UPDATE OF xp ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_guild_xp();

DO $$
BEGIN
    RAISE NOTICE '✅ Advanced gamification system created successfully';
    RAISE NOTICE '✅ Daily login streaks, seasonal events, guilds, and quest variety ready';
END $$;