import { supabase } from '../lib/supabase';

export interface UserStats {
  currentXP: number;
  currentLevel: number;
  totalGold: number;
  targetXP: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  referrals: number;
  xp: number;
  avatar?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  requirement?: number;
}

// New interfaces for advanced features
export interface LoginStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_login_date: string;
  streak_rewards_earned: number;
  seven_day_milestone_count: number;
  thirty_day_milestone_count: number;
  total_login_days: number;
}

export interface SeasonalEvent {
  id: string;
  event_name: string;
  event_type: 'monthly_theme' | 'holiday' | 'special';
  description: string;
  start_date: string;
  end_date: string;
  reward_xp: number;
  reward_gold: number;
  is_active: boolean;
  participation_requirement: string;
}

export interface EventParticipation {
  id: string;
  event_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  reward_claimed: boolean;
  event?: SeasonalEvent;
}

export interface LearningGuild {
  id: string;
  guild_name: string;
  guild_leader_id: string;
  description: string;
  total_members: number;
  total_xp: number;
  guild_level: number;
  leader_username?: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  contribution_xp: number;
  joined_at: string;
  username?: string;
  level?: number;
}

export interface GuildChallenge {
  id: string;
  guild_id: string;
  challenge_name: string;
  description: string;
  target_xp: number;
  current_xp: number;
  reward_xp: number;
  reward_gold: number;
  start_date: string;
  end_date: string;
  completed: boolean;
}

export interface QuestTemplate {
  id: string;
  quest_type: 'watch_minutes' | 'complete_assignment' | 'help_teammate' | 'daily_login' | 'study_session';
  quest_name: string;
  description: string;
  target_value: number;
  xp_reward: number;
  gold_reward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  is_active: boolean;
}

export interface AchievementNotification {
  id: string;
  user_id: string;
  achievement_type: 'badge' | 'level' | 'streak' | 'event';
  achievement_name: string;
  achievement_description: string;
  icon_url?: string;
  shown: boolean;
  created_at: string;
}

// Calculate level based on XP
export const calculateLevel = (xp: number): number => {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 2000) return 5;
  if (xp < 3500) return 6;
  if (xp < 5500) return 7;
  if (xp < 8000) return 8;
  if (xp < 11000) return 9;
  return 10;
};

// Calculate target XP for next level
export const calculateTargetXP = (level: number): number => {
  const xpThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000];
  return xpThresholds[level] || xpThresholds[xpThresholds.length - 1];
};

// Fetch user stats for gamification
export const fetchUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('xp, gold')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const currentXP = profile?.xp || 0;
    const currentLevel = calculateLevel(currentXP);
    const targetXP = calculateTargetXP(currentLevel);
    const totalGold = profile?.gold || 0;

    return {
      currentXP,
      currentLevel,
      totalGold,
      targetXP
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

// Fetch leaderboard data
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // Use top_recruiters table which has the total_referrals data
    const { data, error } = await supabase
      .from('top_recruiters')
      .select('id, username, full_name, total_referrals, xp')
      .order('xp', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data?.map((entry, index) => ({
      rank: index + 1,
      username: entry.username || entry.full_name || 'Anonymous',
      referrals: Number(entry.total_referrals) || 0,
      xp: entry.xp || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

// Fetch user badges
export const fetchUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    // Fetch badge progress with achievement and tier details
    const { data: badgeProgress, error: progressError } = await supabase
      .from('student_badge_progress')
      .select(`
        id,
        is_unlocked,
        unlocked_at,
        current_progress,
        badge_tier_id,
        badge_tiers (
          id,
          tier_name,
          requirement_value,
          tier,
          achievement_id,
          student_achievements (
            id,
            name,
            description,
            icon_emoji
          )
        )
      `)
      .eq('student_id', userId);

    if (progressError) throw progressError;

    // Fetch all available achievements to show locked badges
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('student_achievements')
      .select(`
        id,
        name,
        description,
        icon_emoji,
        requirement_value,
        is_active
      `)
      .eq('is_active', true);

    if (achievementsError) throw achievementsError;

    // Transform progress data into Badge format
    const unlockedBadges: Badge[] = (badgeProgress || [])
      .filter(p => p.is_unlocked)
      .map(progress => ({
        id: progress.badge_tier_id,
        name: progress.badge_tiers?.student_achievements?.name || 'Unknown Badge',
        description: progress.badge_tiers?.student_achievements?.description || '',
        icon: progress.badge_tiers?.student_achievements?.icon_emoji || '🏆',
        unlocked: true,
        unlockedAt: progress.unlocked_at || undefined,
        progress: progress.current_progress || 0,
        requirement: progress.badge_tiers?.requirement_value || 0
      }));

    // Get locked badges from achievements that user hasn't unlocked yet
    const unlockedAchievementIds = new Set(
      (badgeProgress || [])
        .filter(p => p.is_unlocked)
        .map(p => p.badge_tiers?.achievement_id)
    );

    const lockedBadges: Badge[] = (allAchievements || [])
      .filter(achievement => !unlockedAchievementIds.has(achievement.id))
      .map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon_emoji || '🏆',
        unlocked: false,
        progress: 0,
        requirement: achievement.requirement_value
      }));

    return [...unlockedBadges, ...lockedBadges];
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
};

// Award XP and Gold to user
export const awardQuestReward = async (
  userId: string, 
  xpAmount: number, 
  goldAmount: number
): Promise<boolean> => {
  try {
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('xp, gold')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const oldXP = currentProfile?.xp || 0;
    const oldLevel = calculateLevel(oldXP);
    const newXP = oldXP + xpAmount;
    const newLevel = calculateLevel(newXP);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        xp: newXP,
        gold: (currentProfile?.gold || 0) + goldAmount
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Check if user leveled up
    const leveledUp = newLevel > oldLevel;

    return leveledUp;
  } catch (error) {
    console.error('Error awarding quest reward:', error);
    return false;
  }
};

// =====================================================
// DAILY LOGIN STREAK FUNCTIONS
// =====================================================

export async function updateLoginStreak(userId: string): Promise<LoginStreak | null> {
  try {
    // Call the database function to update streak
    const { error } = await supabase.rpc('update_login_streak', {
      p_user_id: userId
    });

    if (error) throw error;

    // Fetch updated streak data
    const { data, error: fetchError } = await supabase
      .from('login_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    return data;
  } catch (error) {
    console.error('Error updating login streak:', error);
    throw error;
  }
}

export async function getLoginStreak(userId: string): Promise<LoginStreak | null> {
  try {
    const { data, error } = await supabase
      .from('login_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data;
  } catch (error) {
    console.error('Error fetching login streak:', error);
    throw error;
  }
}

export async function getTopStreaks(limit: number = 10): Promise<LoginStreak[]> {
  try {
    const { data, error } = await supabase
      .from('login_streaks')
      .select('*, user_profiles!inner(username, avatar_url)')
      .order('current_streak', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching top streaks:', error);
    throw error;
  }
}

// =====================================================
// SEASONAL EVENTS FUNCTIONS
// =====================================================

export async function getActiveEvents(): Promise<SeasonalEvent[]> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('seasonal_events')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching active events:', error);
    throw error;
  }
}

export async function joinEvent(userId: string, eventId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_participants')
      .insert({
        user_id: userId,
        event_id: eventId,
        progress: 0,
        completed: false,
        reward_claimed: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
}

export async function getUserEventProgress(userId: string): Promise<EventParticipation[]> {
  try {
    const { data, error } = await supabase
      .from('event_participants')
      .select('*, seasonal_events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching user event progress:', error);
    throw error;
  }
}

export async function updateEventProgress(userId: string, eventId: string, progress: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_participants')
      .update({ 
        progress,
        completed: progress >= 100,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating event progress:', error);
    throw error;
  }
}

export async function claimEventReward(userId: string, eventId: string): Promise<void> {
  try {
    // Get event details
    const { data: eventData, error: eventError } = await supabase
      .from('seasonal_events')
      .select('reward_xp, reward_gold')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    // Award rewards
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        xp: supabase.raw(`xp + ${eventData.reward_xp}`),
        gold: supabase.raw(`gold + ${eventData.reward_gold}`)
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Mark as claimed
    const { error: claimError } = await supabase
      .from('event_participants')
      .update({ reward_claimed: true })
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (claimError) throw claimError;
  } catch (error) {
    console.error('Error claiming event reward:', error);
    throw error;
  }
}

// =====================================================
// LEARNING GUILD FUNCTIONS
// =====================================================

export async function createGuild(leaderId: string, guildName: string, description?: string): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('create_guild_from_network', {
      p_leader_id: leaderId,
      p_guild_name: guildName
    });

    if (error) throw error;

    // Update guild description if provided
    if (description && data) {
      await supabase
        .from('learning_guilds')
        .update({ description })
        .eq('id', data);
    }

    return data;
  } catch (error) {
    console.error('Error creating guild:', error);
    throw error;
  }
}

export async function getGuildDetails(guildId: string): Promise<LearningGuild | null> {
  try {
    const { data, error } = await supabase
      .from('learning_guilds')
      .select('*, user_profiles!learning_guilds_guild_leader_id_fkey(username)')
      .eq('id', guildId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching guild details:', error);
    throw error;
  }
}

export async function getGuildMembers(guildId: string): Promise<GuildMember[]> {
  try {
    const { data, error } = await supabase
      .from('guild_members')
      .select('*, user_profiles(username, level, avatar_url)')
      .eq('guild_id', guildId)
      .order('contribution_xp', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching guild members:', error);
    throw error;
  }
}

export async function getTopGuilds(limit: number = 10): Promise<LearningGuild[]> {
  try {
    const { data, error } = await supabase
      .from('learning_guilds')
      .select('*, user_profiles!learning_guilds_guild_leader_id_fkey(username)')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching top guilds:', error);
    throw error;
  }
}

export async function getUserGuild(userId: string): Promise<LearningGuild | null> {
  try {
    const { data, error } = await supabase
      .from('guild_members')
      .select('learning_guilds(*, user_profiles!learning_guilds_guild_leader_id_fkey(username))')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data?.learning_guilds || null;
  } catch (error) {
    console.error('Error fetching user guild:', error);
    throw error;
  }
}

export async function getGuildChallenges(guildId: string): Promise<GuildChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('guild_challenges')
      .select('*')
      .eq('guild_id', guildId)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching guild challenges:', error);
    throw error;
  }
}

// =====================================================
// EXPANDED QUEST SYSTEM FUNCTIONS
// =====================================================

export async function getQuestTemplates(difficulty?: string): Promise<QuestTemplate[]> {
  try {
    let query = supabase
      .from('quest_templates')
      .select('*')
      .eq('is_active', true);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query.order('difficulty');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching quest templates:', error);
    throw error;
  }
}

export async function assignDailyQuestsFromTemplates(userId: string): Promise<void> {
  try {
    // Get random quest templates
    const { data: templates, error: templatesError } = await supabase
      .from('quest_templates')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (templatesError) throw templatesError;

    // Create daily quests from templates
    const questsToInsert = templates?.map(template => ({
      student_id: userId,
      quest_name: template.quest_name,
      description: template.description,
      xp_reward: template.xp_reward,
      gold_reward: template.gold_reward,
      target_value: template.target_value,
      current_progress: 0,
      completed: false,
      quest_date: new Date().toISOString().split('T')[0]
    }));

    if (questsToInsert && questsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('student_quest_progress')
        .insert(questsToInsert);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error assigning daily quests:', error);
    throw error;
  }
}

// =====================================================
// ACHIEVEMENT NOTIFICATION FUNCTIONS
// =====================================================

export async function createAchievementNotification(
  userId: string,
  achievementType: 'badge' | 'level' | 'streak' | 'event',
  achievementName: string,
  achievementDescription: string,
  iconUrl?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('achievement_notifications')
      .insert({
        user_id: userId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        achievement_description: achievementDescription,
        icon_url: iconUrl,
        shown: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating achievement notification:', error);
    throw error;
  }
}

export async function getUnshownNotifications(userId: string): Promise<AchievementNotification[]> {
  try {
    const { data, error } = await supabase
      .from('achievement_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('shown', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching unshown notifications:', error);
    throw error;
  }
}

export async function markNotificationAsShown(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('achievement_notifications')
      .update({ shown: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as shown:', error);
    throw error;
  }
}

// =====================================================
// SOCIAL SHARING FUNCTIONS
// =====================================================

export async function trackAchievementShare(
  userId: string,
  achievementType: string,
  achievementName: string,
  platform: 'twitter' | 'facebook' | 'linkedin' | 'copy_link',
  shareUrl: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('achievement_shares')
      .insert({
        user_id: userId,
        achievement_type: achievementType,
        achievement_name: achievementName,
        platform,
        share_url: shareUrl
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking achievement share:', error);
    throw error;
  }
}

export function generateShareUrl(achievementType: string, achievementName: string, username: string): string {
  const baseUrl = window.location.origin;
  const message = encodeURIComponent(`I just unlocked "${achievementName}" on LiqLearns! 🎉`);
  return `${baseUrl}/share?achievement=${achievementType}&name=${encodeURIComponent(achievementName)}&user=${encodeURIComponent(username)}`;
}

export function generateTwitterShareUrl(achievementName: string, username: string): string {
  const text = `I just unlocked "${achievementName}" on @LiqLearns! 🎉 #gamification #learning`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function generateFacebookShareUrl(shareUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

export function generateLinkedInShareUrl(shareUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
}

// Real-Time Notifications
export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: any) => void
) => {
  const channel = supabase.channel(`notifications:${userId}`);

  // Set up the postgres_changes event handler
  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('📨 New notification received:', payload);
      onNotification(payload.new);
    }
  );

  // Subscribe and return the channel for proper cleanup
  // The subscribe callback receives the status which we can use for connection monitoring
  channel.subscribe((status) => {
    console.log('🔔 Realtime channel status:', status);
  });

  return channel;
};

export const fetchNotifications = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
};

// Tournament System
export const fetchActiveTournaments = async () => {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['upcoming', 'active'])
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const joinTournament = async (tournamentId: string, userId: string) => {
  const { data, error } = await supabase
    .from('tournament_participants')
    .insert({
      tournament_id: tournamentId,
      user_id: userId,
      score: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchTournamentLeaderboard = async (tournamentId: string) => {
  const { data, error } = await supabase
    .from('tournament_participants')
    .select(`
      *,
      user:user_id (
        user_profiles (username, avatar_url)
      )
    `)
    .eq('tournament_id', tournamentId)
    .eq('eliminated', false)
    .order('score', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
};

export const updateTournamentScore = async (
  participantId: string,
  scoreIncrease: number
) => {
  const { data, error } = await supabase.rpc('update_tournament_rankings', {
    p_tournament_id: participantId,
  });

  if (error) throw error;
  return data;
};

// Loot Box System
export const fetchAvailableLootBoxes = async () => {
  const { data, error } = await supabase
    .from('loot_boxes')
    .select('*')
    .or('available_until.is.null,available_until.gt.now()');

  if (error) throw error;
  return data;
};

export const purchaseLootBox = async (userId: string, lootBoxId: string) => {
  // First check user's gold balance
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('gold')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  const { data: lootBox, error: lootBoxError } = await supabase
    .from('loot_boxes')
    .select('cost')
    .eq('id', lootBoxId)
    .single();

  if (lootBoxError) throw lootBoxError;

  if (profile.gold < lootBox.cost) {
    throw new Error('Insufficient gold');
  }

  // Deduct gold
  await supabase
    .from('user_profiles')
    .update({ gold: profile.gold - lootBox.cost })
    .eq('user_id', userId);

  // Create user loot box
  const { data, error } = await supabase
    .from('user_loot_boxes')
    .insert({
      user_id: userId,
      loot_box_id: lootBoxId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const openLootBox = async (userLootBoxId: string) => {
  const { data, error } = await supabase.rpc('open_loot_box', {
    p_user_loot_box_id: userLootBoxId,
  });

  if (error) throw error;
  return data;
};

export const fetchUserLootBoxes = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_loot_boxes')
    .select(`
      *,
      loot_box:loot_box_id (*)
    `)
    .eq('user_id', userId)
    .order('acquired_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Daily Login Bonuses
export const fetchDailyLoginBonus = async (userId: string) => {
  const { data, error } = await supabase
    .from('daily_login_bonuses')
    .select('*')
    .eq('user_id', userId)
    .eq('claimed', false)
    .gte('expires_at', new Date().toISOString())
    .order('day_number', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const claimDailyLoginBonus = async (bonusId: string) => {
  const { data, error } = await supabase
    .from('daily_login_bonuses')
    .update({ claimed: true, claimed_at: new Date().toISOString() })
    .eq('id', bonusId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Referral System
export const fetchReferralBonuses = async (userId: string) => {
  const { data, error } = await supabase
    .from('referral_bonuses')
    .select(`
      *,
      referee:referee_id (
        user_profiles (username, avatar_url)
      )
    `)
    .eq('referrer_id', userId)
    .eq('active', true);

  if (error) throw error;
  return data;
};

export const getReferralMultiplier = async (userId: string) => {
  const { data, error } = await supabase
    .from('referral_bonuses')
    .select('multiplier')
    .eq('referrer_id', userId)
    .eq('active', true)
    .eq('bonus_type', 'xp_multiplier');

  if (error) throw error;

  const totalMultiplier = data.reduce(
    (sum, bonus) => sum + parseFloat(bonus.multiplier),
    1.0
  );
  return totalMultiplier;
};

// Skill Trees
export const fetchSkillTrees = async () => {
  const { data, error } = await supabase.from('skill_trees').select('*');

  if (error) throw error;
  return data;
};

export const fetchUserSkillProgress = async (
  userId: string,
  skillTreeId: string
) => {
  const { data, error } = await supabase
    .from('user_skill_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('skill_tree_id', skillTreeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const unlockSkillNode = async (
  userId: string,
  skillTreeId: string,
  nodeId: string
) => {
  const { data: progress, error: fetchError } = await supabase
    .from('user_skill_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('skill_tree_id', skillTreeId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  const unlockedNodes = progress?.unlocked_nodes || [];
  if (!unlockedNodes.includes(nodeId)) {
    unlockedNodes.push(nodeId);

    const { data, error } = await supabase
      .from('user_skill_progress')
      .upsert({
        user_id: userId,
        skill_tree_id: skillTreeId,
        unlocked_nodes: unlockedNodes,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return progress;
};

// Study Groups
export const fetchStudyGroups = async () => {
  const { data, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      creator:creator_id (
        user_profiles (username, avatar_url)
      ),
      study_group_members (count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createStudyGroup = async (groupData: {
  name: string;
  description?: string;
  creatorId: string;
  maxMembers?: number;
  isPrivate?: boolean;
  topics?: string[];
}) => {
  const { data, error } = await supabase
    .from('study_groups')
    .insert({
      name: groupData.name,
      description: groupData.description,
      creator_id: groupData.creatorId,
      max_members: groupData.maxMembers || 10,
      is_private: groupData.isPrivate || false,
      topics: groupData.topics || [],
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-join creator
  await supabase.from('study_group_members').insert({
    group_id: data.id,
    user_id: groupData.creatorId,
    role: 'creator',
  });

  return data;
};

export const joinStudyGroup = async (groupId: string, userId: string) => {
  const { data, error } = await supabase
    .from('study_group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      role: 'member',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const leaveStudyGroup = async (groupId: string, userId: string) => {
  const { error } = await supabase
    .from('study_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;
};

// Mentorship
export const findMentors = async (topics?: string[]) => {
  let query = supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'tutor')
    .limit(20);

  if (topics && topics.length > 0) {
    query = query.contains('expertise', topics);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const requestMentorship = async (
  mentorId: string,
  menteeId: string,
  topics: string[]
) => {
  const { data, error } = await supabase
    .from('mentorship_matches')
    .insert({
      mentor_id: mentorId,
      mentee_id: menteeId,
      topics,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const acceptMentorship = async (matchId: string) => {
  const { data, error } = await supabase
    .from('mentorship_matches')
    .update({
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Peer Challenges
export const createPeerChallenge = async (challengeData: {
  challengerId: string;
  challengedId: string;
  challengeType: string;
  challengeData: any;
  wagerAmount?: number;
}) => {
  const { data, error } = await supabase
    .from('peer_challenges')
    .insert({
      challenger_id: challengeData.challengerId,
      challenged_id: challengeData.challengedId,
      challenge_type: challengeData.challengeType,
      challenge_data: challengeData.challengeData,
      wager_amount: challengeData.wagerAmount || 0,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const acceptChallenge = async (challengeId: string) => {
  const { data, error } = await supabase
    .from('peer_challenges')
    .update({ status: 'accepted' })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserChallenges = async (userId: string) => {
  const { data, error } = await supabase
    .from('peer_challenges')
    .select(`
      *,
      challenger:challenger_id (
        user_profiles (username, avatar_url)
      ),
      challenged:challenged_id (
        user_profiles (username, avatar_url)
      )
    `)
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Engagement Analytics
export const trackEngagement = async (
  userId: string,
  activityType: string,
  durationMinutes = 0
) => {
  const { error } = await supabase.rpc('track_engagement', {
    p_user_id: userId,
    p_activity_type: activityType,
    p_duration_minutes: durationMinutes,
  });

  if (error) throw error;
};

export const fetchEngagementMetrics = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('engagement_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchLearningPatterns = async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_patterns')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getPersonalizedRecommendations = async (userId: string) => {
  const patterns = await fetchLearningPatterns(userId);

  if (!patterns) {
    return {
      courses: [],
      studyGroups: [],
      challenges: [],
      tips: ['Start by completing your first quest!'],
    };
  }

  return {
    courses: patterns.recommendations || [],
    tips: [
      'Your best learning time is during your preferred time slots',
      `Focus on improving: ${patterns.areas_for_improvement?.join(', ') || 'N/A'}`,
      `Your strengths: ${patterns.strengths?.join(', ') || 'N/A'}`,
    ],
  };
};

export default {
  calculateLevel,
  calculateTargetXP,
  fetchUserStats,
  fetchLeaderboard,
  fetchUserBadges,
  awardQuestReward,
  updateLoginStreak,
  getLoginStreak,
  getTopStreaks,
  getActiveEvents,
  joinEvent,
  getUserEventProgress,
  updateEventProgress,
  claimEventReward,
  createGuild,
  getGuildDetails,
  getGuildMembers,
  getTopGuilds,
  getUserGuild,
  getGuildChallenges,
  getQuestTemplates,
  assignDailyQuestsFromTemplates,
  createAchievementNotification,
  getUnshownNotifications,
  markNotificationAsShown,
  trackAchievementShare,
  generateShareUrl,
  generateTwitterShareUrl,
  generateFacebookShareUrl,
  generateLinkedInShareUrl,
  subscribeToNotifications,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchActiveTournaments,
  joinTournament,
  fetchTournamentLeaderboard,
  updateTournamentScore,
  fetchAvailableLootBoxes,
  purchaseLootBox,
  openLootBox,
  fetchUserLootBoxes,
  fetchDailyLoginBonus,
  claimDailyLoginBonus,
  fetchReferralBonuses,
  getReferralMultiplier,
  fetchSkillTrees,
  fetchUserSkillProgress,
  unlockSkillNode,
  fetchStudyGroups,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  findMentors,
  requestMentorship,
  acceptMentorship,
  createPeerChallenge,
  acceptChallenge,
  fetchUserChallenges,
  trackEngagement,
  fetchEngagementMetrics,
  fetchLearningPatterns,
  getPersonalizedRecommendations
};