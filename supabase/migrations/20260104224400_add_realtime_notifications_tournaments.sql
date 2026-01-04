-- =====================================================
-- Real-Time Notifications & Tournament System
-- =====================================================

-- Notifications table for real-time updates
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('xp_gain', 'level_up', 'badge_unlock', 'friend_activity', 'quest_complete', 'tournament_update', 'reward_earned')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Tournament system
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tournament_type TEXT NOT NULL CHECK (tournament_type IN ('weekly', 'monthly', 'seasonal', 'special')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    entry_fee INTEGER DEFAULT 0,
    prize_pool JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '{}'::jsonb,
    max_participants INTEGER,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tournaments_status_dates ON public.tournaments(status, start_date, end_date);

-- Tournament participants
CREATE TABLE IF NOT EXISTS public.tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    eliminated BOOLEAN DEFAULT FALSE,
    prizes_won JSONB DEFAULT '[]'::jsonb,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

CREATE INDEX idx_tournament_participants_tournament ON public.tournament_participants(tournament_id, score DESC);
CREATE INDEX idx_tournament_participants_user ON public.tournament_participants(user_id);

-- Loot boxes and rewards
CREATE TABLE IF NOT EXISTS public.loot_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    cost INTEGER NOT NULL,
    possible_rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
    drop_rates JSONB NOT NULL DEFAULT '{}'::jsonb,
    available_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_loot_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    loot_box_id UUID NOT NULL REFERENCES public.loot_boxes(id) ON DELETE CASCADE,
    opened BOOLEAN DEFAULT FALSE,
    rewards_received JSONB DEFAULT '[]'::jsonb,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ
);

CREATE INDEX idx_user_loot_boxes_user ON public.user_loot_boxes(user_id, opened);

-- Daily login bonuses
CREATE TABLE IF NOT EXISTS public.daily_login_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('xp', 'gold', 'gems', 'loot_box')),
    reward_amount INTEGER NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create immutable function for date extraction
CREATE OR REPLACE FUNCTION immutable_date_trunc(timestamp with time zone)
RETURNS date
IMMUTABLE
LANGUAGE sql
AS $$
    SELECT $1::date;
$$;

-- Use the immutable function in the unique index
CREATE UNIQUE INDEX idx_daily_login_bonuses_unique ON public.daily_login_bonuses(user_id, day_number, immutable_date_trunc(created_at));
CREATE INDEX idx_daily_login_bonuses_user ON public.daily_login_bonuses(user_id, claimed, expires_at);

-- Referral multipliers
CREATE TABLE IF NOT EXISTS public.referral_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_type TEXT NOT NULL CHECK (bonus_type IN ('xp_multiplier', 'gold_bonus', 'premium_currency')),
    multiplier DECIMAL(3,2) DEFAULT 1.00,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referrer_id, referee_id)
);

CREATE INDEX idx_referral_bonuses_referrer ON public.referral_bonuses(referrer_id, active);

-- Premium currency system
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS gems INTEGER DEFAULT 0 CHECK (gems >= 0),
ADD COLUMN IF NOT EXISTS premium_membership BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Skill trees and learning paths
CREATE TABLE IF NOT EXISTS public.skill_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tree_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_skill_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_tree_id UUID NOT NULL REFERENCES public.skill_trees(id) ON DELETE CASCADE,
    unlocked_nodes JSONB DEFAULT '[]'::jsonb,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_tree_id)
);

CREATE INDEX idx_user_skill_progress_user ON public.user_skill_progress(user_id);

-- Study groups
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_private BOOLEAN DEFAULT FALSE,
    topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_study_group_members_group ON public.study_group_members(group_id);
CREATE INDEX idx_study_group_members_user ON public.study_group_members(user_id);

-- Mentorship system
CREATE TABLE IF NOT EXISTS public.mentorship_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    match_score DECIMAL(3,2),
    topics JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

CREATE INDEX idx_mentorship_matches_mentor ON public.mentorship_matches(mentor_id, status);
CREATE INDEX idx_mentorship_matches_mentee ON public.mentorship_matches(mentee_id, status);

-- Peer challenges
CREATE TABLE IF NOT EXISTS public.peer_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenged_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('quiz', 'assignment', 'project', 'speed_run')),
    challenge_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    wager_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'declined')),
    winner_id UUID REFERENCES auth.users(id),
    results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_peer_challenges_participants ON public.peer_challenges(challenger_id, challenged_id, status);

-- Engagement analytics
CREATE TABLE IF NOT EXISTS public.engagement_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sessions_count INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    quests_completed INTEGER DEFAULT 0,
    courses_accessed INTEGER DEFAULT 0,
    social_interactions INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_engagement_metrics_user_date ON public.engagement_metrics(user_id, date DESC);

-- Learning patterns
CREATE TABLE IF NOT EXISTS public.learning_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_time_slots JSONB DEFAULT '[]'::jsonb,
    learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'mixed')),
    average_session_duration INTEGER,
    completion_rate DECIMAL(5,2),
    strengths JSONB DEFAULT '[]'::jsonb,
    areas_for_improvement JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    last_analyzed TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_login_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Tournaments policies
CREATE POLICY "Anyone can view active tournaments" ON public.tournaments FOR SELECT USING (status IN ('upcoming', 'active'));
CREATE POLICY "Admins can manage tournaments" ON public.tournaments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tournament participants policies
CREATE POLICY "Users can view tournament participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.tournament_participants FOR UPDATE USING (auth.uid() = user_id);

-- Loot boxes policies
CREATE POLICY "Anyone can view available loot boxes" ON public.loot_boxes FOR SELECT USING (available_until IS NULL OR available_until > NOW());
CREATE POLICY "Users can view own loot boxes" ON public.user_loot_boxes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own loot boxes" ON public.user_loot_boxes FOR UPDATE USING (auth.uid() = user_id);

-- Daily login bonuses policies
CREATE POLICY "Users can view own bonuses" ON public.daily_login_bonuses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim own bonuses" ON public.daily_login_bonuses FOR UPDATE USING (auth.uid() = user_id);

-- Referral bonuses policies
CREATE POLICY "Users can view own referral bonuses" ON public.referral_bonuses FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Skill trees policies
CREATE POLICY "Anyone can view skill trees" ON public.skill_trees FOR SELECT USING (true);
CREATE POLICY "Users can view own skill progress" ON public.user_skill_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own skill progress" ON public.user_skill_progress FOR ALL USING (auth.uid() = user_id);

-- Study groups policies
CREATE POLICY "Anyone can view public study groups" ON public.study_groups FOR SELECT USING (is_private = false);
CREATE POLICY "Members can view private groups" ON public.study_groups FOR SELECT USING (
    is_private = false OR 
    EXISTS (SELECT 1 FROM public.study_group_members WHERE group_id = study_groups.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create study groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can view group memberships" ON public.study_group_members FOR SELECT USING (true);
CREATE POLICY "Users can join study groups" ON public.study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave study groups" ON public.study_group_members FOR DELETE USING (auth.uid() = user_id);

-- Mentorship policies
CREATE POLICY "Users can view own mentorship matches" ON public.mentorship_matches FOR SELECT USING (
    auth.uid() = mentor_id OR auth.uid() = mentee_id
);
CREATE POLICY "Users can create mentorship requests" ON public.mentorship_matches FOR INSERT WITH CHECK (
    auth.uid() = mentor_id OR auth.uid() = mentee_id
);
CREATE POLICY "Users can update own mentorship" ON public.mentorship_matches FOR UPDATE USING (
    auth.uid() = mentor_id OR auth.uid() = mentee_id
);

-- Peer challenges policies
CREATE POLICY "Users can view own challenges" ON public.peer_challenges FOR SELECT USING (
    auth.uid() = challenger_id OR auth.uid() = challenged_id
);
CREATE POLICY "Users can create challenges" ON public.peer_challenges FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can respond to challenges" ON public.peer_challenges FOR UPDATE USING (
    auth.uid() = challenger_id OR auth.uid() = challenged_id
);

-- Engagement metrics policies
CREATE POLICY "Users can view own metrics" ON public.engagement_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert metrics" ON public.engagement_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update metrics" ON public.engagement_metrics FOR UPDATE USING (true);

-- Learning patterns policies
CREATE POLICY "Users can view own patterns" ON public.learning_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage patterns" ON public.learning_patterns FOR ALL USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update tournament rankings
CREATE OR REPLACE FUNCTION public.update_tournament_rankings(p_tournament_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.tournament_participants
    SET rank = ranked.new_rank
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC, joined_at ASC) as new_rank
        FROM public.tournament_participants
        WHERE tournament_id = p_tournament_id AND eliminated = false
    ) ranked
    WHERE tournament_participants.id = ranked.id
    AND tournament_participants.tournament_id = p_tournament_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to open loot box
CREATE OR REPLACE FUNCTION public.open_loot_box(p_user_loot_box_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_loot_box public.loot_boxes;
    v_rewards JSONB;
BEGIN
    -- Get loot box details
    SELECT lb.* INTO v_loot_box
    FROM public.user_loot_boxes ulb
    JOIN public.loot_boxes lb ON lb.id = ulb.loot_box_id
    WHERE ulb.id = p_user_loot_box_id AND ulb.opened = false;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loot box not found or already opened';
    END IF;
    
    -- Simulate reward generation (simplified)
    v_rewards := v_loot_box.possible_rewards->0;
    
    -- Update loot box as opened
    UPDATE public.user_loot_boxes
    SET opened = true, 
        rewards_received = v_rewards,
        opened_at = NOW()
    WHERE id = p_user_loot_box_id;
    
    RETURN v_rewards;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track engagement
CREATE OR REPLACE FUNCTION public.track_engagement(
    p_user_id UUID,
    p_activity_type TEXT,
    p_duration_minutes INTEGER DEFAULT 0
) RETURNS void AS $$
BEGIN
    INSERT INTO public.engagement_metrics (
        user_id, 
        date,
        sessions_count,
        total_time_minutes,
        quests_completed,
        courses_accessed,
        social_interactions
    ) VALUES (
        p_user_id,
        CURRENT_DATE,
        CASE WHEN p_activity_type = 'session' THEN 1 ELSE 0 END,
        p_duration_minutes,
        CASE WHEN p_activity_type = 'quest' THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type = 'course' THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type = 'social' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        sessions_count = engagement_metrics.sessions_count + EXCLUDED.sessions_count,
        total_time_minutes = engagement_metrics.total_time_minutes + EXCLUDED.total_time_minutes,
        quests_completed = engagement_metrics.quests_completed + EXCLUDED.quests_completed,
        courses_accessed = engagement_metrics.courses_accessed + EXCLUDED.courses_accessed,
        social_interactions = engagement_metrics.social_interactions + EXCLUDED.social_interactions,
        engagement_score = (
            (engagement_metrics.sessions_count + EXCLUDED.sessions_count) * 2 +
            (engagement_metrics.total_time_minutes + EXCLUDED.total_time_minutes) / 10.0 +
            (engagement_metrics.quests_completed + EXCLUDED.quests_completed) * 5 +
            (engagement_metrics.courses_accessed + EXCLUDED.courses_accessed) * 3 +
            (engagement_metrics.social_interactions + EXCLUDED.social_interactions) * 1.5
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data
DO $$
BEGIN
    -- Sample tournament
    INSERT INTO public.tournaments (name, description, tournament_type, start_date, end_date, prize_pool, max_participants, status)
    VALUES 
    ('Weekly XP Challenge', 'Compete for the highest XP gains this week!', 'weekly', NOW(), NOW() + INTERVAL '7 days', 
     '[{"rank": 1, "reward": "1000 gems"}, {"rank": 2, "reward": "500 gems"}, {"rank": 3, "reward": "250 gems"}]'::jsonb, 
     100, 'active')
    ON CONFLICT DO NOTHING;
    
    -- Sample loot boxes
    INSERT INTO public.loot_boxes (name, rarity, cost, possible_rewards, drop_rates)
    VALUES 
    ('Bronze Box', 'common', 50, '[{"type": "xp", "amount": 100}, {"type": "gold", "amount": 50}]'::jsonb, '{"xp": 0.7, "gold": 0.3}'::jsonb),
    ('Silver Box', 'rare', 150, '[{"type": "xp", "amount": 300}, {"type": "gold", "amount": 150}, {"type": "gems", "amount": 10}]'::jsonb, '{"xp": 0.5, "gold": 0.3, "gems": 0.2}'::jsonb),
    ('Gold Box', 'epic', 500, '[{"type": "xp", "amount": 1000}, {"type": "gold", "amount": 500}, {"type": "gems", "amount": 50}]'::jsonb, '{"xp": 0.4, "gold": 0.3, "gems": 0.3}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- Sample skill tree
    INSERT INTO public.skill_trees (name, description, tree_data)
    VALUES 
    ('Programming Mastery', 'Master the art of programming from basics to advanced', 
     '{"nodes": [{"id": "basics", "name": "Programming Basics", "unlocked": true}, {"id": "oop", "name": "OOP", "requires": ["basics"]}, {"id": "algorithms", "name": "Algorithms", "requires": ["oop"]}]}'::jsonb)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Real-time notifications, tournaments, rewards, skill trees, and community features migration completed successfully!';
END $$;