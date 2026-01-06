import { supabase } from '@/lib/supabase';

export interface DailyMission {
  id: string;
  title: string;
  description: string | null;
  category: 'spiritual' | 'health' | 'wealth' | 'service' | 'education' | 'family' | 'social';
  difficulty_level: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  gold_reward: number;
  mission_date: string;
  deadline_hours: number;
  is_active: boolean;
  created_at: string;
}

export interface MissionProgress {
  id: string;
  mission_id: string;
  student_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface QuestWithProgress extends DailyMission {
  progress?: MissionProgress | null;
  deadline: Date;
  timeRemaining: string;
}

/**
 * Fetches today's daily missions with progress for a student
 */
export const fetchTodayQuests = async (studentId: string): Promise<QuestWithProgress[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch active missions for today
    const { data: missions, error: missionsError } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('mission_date', today)
      .eq('is_active', true)
      .order('difficulty_level', { ascending: true });

    if (missionsError) throw missionsError;
    if (!missions || missions.length === 0) return [];

    // Fetch progress for these missions
    const missionIds = missions.map(m => m.id);
    const { data: progress, error: progressError } = await supabase
      .from('student_mission_progress')
      .select('*')
      .eq('student_id', studentId)
      .in('mission_id', missionIds);

    if (progressError) throw progressError;

    // Combine missions with progress
    const questsWithProgress: QuestWithProgress[] = missions.map(mission => {
      const missionProgress = progress?.find(p => p.mission_id === mission.id) || null;
      const deadline = new Date(mission.mission_date);
      deadline.setHours(deadline.getHours() + (mission.deadline_hours || 24));

      return {
        ...mission,
        progress: missionProgress,
        deadline,
        timeRemaining: calculateTimeRemaining(deadline)
      };
    });

    return questsWithProgress;
  } catch (error) {
    console.error('Error fetching quests:', error);
    throw error;
  }
};

/**
 * Starts tracking progress for a quest
 */
export const startQuestProgress = async (missionId: string, studentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('student_mission_progress')
      .insert({
        mission_id: missionId,
        student_id: studentId,
        is_completed: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error starting quest progress:', error);
    throw error;
  }
};

/**
 * Completes a quest and awards rewards
 */
export const completeQuest = async (missionId: string, studentId: string): Promise<{ xp: number; gold: number }> => {
  try {
    // Use edge function for quest completion (handles rewards)
    const { data, error } = await supabase.functions.invoke('complete-quest', {
      body: { questId: missionId, studentId }
    });

    if (error) throw error;

    return {
      xp: data?.xp_earned || 0,
      gold: data?.gold_earned || 0
    };
  } catch (error) {
    console.error('Error completing quest:', error);
    throw error;
  }
};

/**
 * Generates new daily quests (admin/system function)
 */
export const generateDailyQuests = async (): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('generate-daily-quests');
    if (error) throw error;
  } catch (error) {
    console.error('Error generating daily quests:', error);
    throw error;
  }
};

/**
 * Subscribes to real-time quest completion updates
 */
export const subscribeToQuestUpdates = (
  studentId: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel('quest-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'student_mission_progress',
        filter: `student_id=eq.${studentId}`
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Fetches quest completion statistics
 */
export const getQuestStats = async (studentId: string): Promise<{
  totalCompleted: number;
  weeklyStreak: number;
  totalXPEarned: number;
  totalGoldEarned: number;
}> => {
  try {
    const { data, error } = await supabase
      .from('student_mission_progress')
      .select('*, daily_missions!inner(xp_reward, gold_reward)')
      .eq('student_id', studentId)
      .eq('is_completed', true);

    if (error) throw error;

    const totalCompleted = data?.length || 0;
    const totalXPEarned = data?.reduce((sum, item) => sum + (item.daily_missions?.xp_reward || 0), 0) || 0;
    const totalGoldEarned = data?.reduce((sum, item) => sum + (item.daily_missions?.gold_reward || 0), 0) || 0;

    // Calculate weekly streak
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentCompletions = data?.filter(item => 
      new Date(item.completed_at || '') >= last7Days
    ) || [];

    const weeklyStreak = calculateStreak(recentCompletions);

    return {
      totalCompleted,
      weeklyStreak,
      totalXPEarned,
      totalGoldEarned
    };
  } catch (error) {
    console.error('Error fetching quest stats:', error);
    throw error;
  }
};

/**
 * Helper: Calculate time remaining until deadline
 */
function calculateTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }

  return `${hours}h ${minutes}m remaining`;
}

/**
 * Helper: Calculate completion streak
 */
function calculateStreak(completions: any[]): number {
  if (completions.length === 0) return 0;

  const sortedDates = completions
    .map(c => new Date(c.completed_at).toISOString().split('T')[0])
    .sort()
    .reverse();

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      streak++;
      currentDate = prevDate;
    } else if (dayDiff > 1) {
      break;
    }
  }

  return streak;
}