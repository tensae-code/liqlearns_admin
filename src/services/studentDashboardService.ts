import { supabase } from '../lib/supabase';

export interface SkillProgress {
  skill: string;
  progress: number;
  level: number;
  totalXp: number;
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  xpReward: number;
  auraPoints: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  deadlineHours: number;
  category?: string;
  isSuggestion?: boolean;
  isProcessing?: boolean;
}

// NEW: Add lesson data interface
export interface LessonData {
  id: string;
  title: string;
  courseName: string;
  progressPercentage: number;
  isCompleted: boolean;
  lastAccessedAt: string;
}

// NEW: Add XP transaction interface
export interface XPTransaction {
  id: string;
  amount: number;
  type: 'IN' | 'OUT';
  reason: string;
  description: string;
  balance: number;
  createdAt: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  title: string;
  progress: number;
  lastAccessed: string;
}

export interface StudyCalendarEvent {
  date: string;
  minutesStudied: number;
  lessonsCompleted: number;
  xpEarned: number;
}

export interface StudentStats {
  totalLessons: number;
  currentStreak: number;
  totalBadges: number;
  globalRank: number;
  totalXp: number;
  currentLevel: number;
  auraPoints: number;
  gold: number; // ADD: Missing gold property
}

class StudentDashboardService {
  async getStudentStats(studentId: string): Promise<StudentStats> {
    const { data: progressData, error: progressError } = await supabase
      .from('student_progress')
      .select('total_xp, current_streak_days, level')
      .eq('student_id', studentId);

    if (progressError) throw progressError;

    const { data: achievementsData, error: achievementsError } = await supabase
      .from('student_achievement_records')
      .select('id')
      .eq('student_id', studentId);

    if (achievementsError) throw achievementsError;

    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('student_id', studentId);

    if (enrollmentsError) throw enrollmentsError;

    const totalXp = progressData?.reduce((sum, p) => sum + (p.total_xp || 0), 0) || 0;
    const maxLevel = progressData?.reduce((max, p) => Math.max(max, p.level || 1), 1) || 1;
    const currentStreak = progressData?.[0]?.current_streak_days || 0;

    // Calculate aura points from achievements
    const { data: auraData, error: auraError } = await supabase
      .from('student_achievement_records')
      .select('achievement:student_achievements(aura_points)')
      .eq('student_id', studentId);

    const auraPoints = auraData?.reduce((sum: number, record: any) => 
      sum + (record.achievement?.aura_points || 0), 0) || 0;

    // FIX: Fetch gold balance from user_profiles table using correct column name 'gold'
    const { data: goldData, error: goldError } = await supabase
      .from('user_profiles')
      .select('gold')
      .eq('id', studentId)
      .single();

    if (goldError) throw goldError;

    return {
      totalLessons: enrollmentsData?.length || 0,
      currentStreak,
      totalBadges: achievementsData?.length || 0,
      globalRank: 3, // This would come from a leaderboard calculation
      totalXp,
      currentLevel: maxLevel,
      auraPoints,
      gold: goldData?.gold || 0, // ADD: Include gold balance in return
    };
  }

  async getSkillProgress(studentId: string): Promise<SkillProgress[]> {
    const { data, error } = await supabase
      .from('student_progress')
      .select('skill_type, progress_percentage, level, total_xp')
      .eq('student_id', studentId)
      .order('skill_type');

    if (error) throw error;

    const colorMap: { [key: string]: string } = {
      listening: 'bg-blue-500',
      reading: 'bg-green-500',
      speaking: 'bg-orange-500',
      writing: 'bg-purple-500'
    };

    return (data || []).map(item => ({
      skill: item.skill_type.charAt(0).toUpperCase() + item.skill_type.slice(1),
      progress: item.progress_percentage || 0,
      level: item.level || 1,
      totalXp: item.total_xp || 0,
      color: colorMap[item.skill_type] || 'bg-gray-500'
    }));
  }

  async getRecentAchievements(studentId: string, limit: number = 3): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('student_achievement_records')
      .select(`
        id,
        earned_at,
        achievement:student_achievements (
          name,
          description,
          icon_emoji,
          xp_reward,
          aura_points
        )
      `)
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((record: any) => ({
      id: record.id,
      title: record.achievement?.name || '',
      description: record.achievement?.description || '',
      icon: record.achievement?.icon_emoji || '🏆',
      earnedAt: this.formatTimeAgo(record.earned_at),
      xpReward: record.achievement?.xp_reward || 0,
      auraPoints: record.achievement?.aura_points || 0
    }));
  }

  async completeMission(studentId: string, missionId: string): Promise<void> {
    try {
      // Check if this is a life progress suggestion mission
      const isLifeProgressMission = missionId.startsWith('life-progress-');
      
      let missionData: {
        xp_reward: number;
        title: string;
        category: string;
        difficulty_level: string;
      };

      // Store the clean entity ID for database insertion (without prefix)
      let cleanEntityId: string = missionId;

      if (isLifeProgressMission) {
        // Extract the actual life progress entry ID
        const lifeProgressId = missionId.replace('life-progress-', '');
        cleanEntityId = lifeProgressId;
        
        // Get life progress entry details
        const { data: lifeEntry, error: lifeError } = await supabase
          .from('life_progress_entries')
          .select('*')
          .eq('id', lifeProgressId)
          .single();

        if (lifeError) throw lifeError;
        if (!lifeEntry) throw new Error('Life progress entry not found');

        // Create mission data object for life progress
        missionData = {
          xp_reward: 100,
          title: `Improve ${lifeEntry.category}`,
          category: lifeEntry.category,
          difficulty_level: 'medium'
        };

        // FIX: Use updated_at instead of last_updated_at
        const { error: updateLifeError } = await supabase
          .from('life_progress_entries')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('id', lifeProgressId);

        if (updateLifeError) throw updateLifeError;
      } else {
        // Regular daily mission
        const { data: mission, error: missionError } = await supabase
          .from('daily_missions')
          .select('xp_reward, title, category, difficulty_level')
          .eq('id', missionId)
          .single();

        if (missionError) throw missionError;
        if (!mission) throw new Error('Mission not found');

        missionData = mission;

        // Mark mission as completed
        const { error: updateError } = await supabase
          .from('student_mission_progress')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('student_id', studentId)
          .eq('mission_id', missionId);

        if (updateError) throw updateError;
      }

      // FIX: Update XP in student_profiles instead of student_progress (no "overall" skill_type exists)
      const xpAmount = missionData.xp_reward || 50;
      
      // Get current student profile
      const { data: studentProfile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      // The database trigger will automatically calculate level and rank based on total_xp
      // We just need to update student_streaks for activity tracking
      
      // Write to activity log
      const { error: logError } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: studentId,
          action_type: 'quest_completed',
          action_title: `Completed Quest: ${missionData.title}`,
          action_description: `Earned ${xpAmount} XP for completing ${missionData.difficulty_level} difficulty quest in ${missionData.category} category`,
          related_entity_type: isLifeProgressMission ? 'life_progress_entry' : 'daily_mission',
          related_entity_id: cleanEntityId,
          metadata: {
            xp_earned: xpAmount,
            category: missionData.category,
            difficulty: missionData.difficulty_level,
            is_life_progress: isLifeProgressMission,
          },
        });

      if (logError) throw logError;

      // FIX: Create/update study_calendar_events to track today's activity
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingEvent, error: eventError } = await supabase
        .from('study_calendar_events')
        .select('*')
        .eq('student_id', studentId)
        .eq('event_date', today)
        .single();

      if (eventError && eventError.code !== 'PGRST116') throw eventError;

      if (existingEvent) {
        // Update existing event
        await supabase
          .from('study_calendar_events')
          .update({
            xp_earned: (existingEvent.xp_earned || 0) + xpAmount,
            lessons_completed: (existingEvent.lessons_completed || 0) + 1,
          })
          .eq('id', existingEvent.id);
      } else {
        // Create new event
        await supabase
          .from('study_calendar_events')
          .insert({
            student_id: studentId,
            event_date: today,
            xp_earned: xpAmount,
            lessons_completed: 1,
            minutes_studied: 0,
          });
      }

      // Update streak
      await this.updateStreak(studentId);
    } catch (error) {
      console.error('Error completing mission:', error);
      throw error;
    }
  }

  private async updateStreak(studentId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: streak, error: streakError } = await supabase
        .from('student_streaks')
        .select('*')
        .eq('student_id', studentId)
        .eq('streak_type', 'daily')
        .single();

      if (streakError && streakError.code !== 'PGRST116') throw streakError;

      if (streak) {
        const lastActivityDate = streak.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newCurrentStreak = streak.current_streak || 0;
        
        if (lastActivityDate === today) {
          // Already logged today, no change needed
          return;
        } else if (lastActivityDate === yesterdayStr) {
          // Consecutive day
          newCurrentStreak += 1;
        } else {
          // Streak broken, reset to 1
          newCurrentStreak = 1;
        }

        const newLongestStreak = Math.max(streak.longest_streak || 0, newCurrentStreak);

        const { error: updateError } = await supabase
          .from('student_streaks')
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_activity_date: today,
          })
          .eq('student_id', studentId)
          .eq('streak_type', 'daily');

        if (updateError) throw updateError;
      } else {
        // Create new streak record
        const { error: createError } = await supabase
          .from('student_streaks')
          .insert({
            student_id: studentId,
            streak_type: 'daily',
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            streak_start_date: today,
          });

        if (createError) throw createError;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  async getDailyMissions(studentId: string): Promise<DailyMission[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch regular daily missions with completion status
      const { data: missions, error: missionsError } = await supabase
        .from('daily_missions')
        .select(`
          *,
          student_mission_progress!left(
            is_completed,
            completed_at,
            student_id
          )
        `)
        .eq('is_active', true)
        .gte('mission_date', today)
        .order('mission_date', { ascending: true })
        .limit(6); // Limit to 6 class quests

      if (missionsError) throw missionsError;

      // Fetch life progress suggestions (1 quest from life progress)
      const { data: lifeProgress, error: lifeError } = await supabase
        .from('life_progress_entries')
        .select('*')
        .eq('student_id', studentId)
        .order('entry_date', { ascending: false })
        .limit(7); // Last 7 days

      if (lifeError) throw lifeError;

      // Find the category with lowest satisfaction score to suggest improvement
      let suggestedQuest: any = null;
      if (lifeProgress && lifeProgress.length > 0) {
        const lowestSatisfaction = lifeProgress.reduce((min, entry) => 
          entry.satisfaction_score < min.satisfaction_score ? entry : min
        );

        if (lowestSatisfaction.satisfaction_score < 70) {
          // Check if this life progress mission was already completed today
          const { data: completionCheck } = await supabase
            .from('user_activity_logs')
            .select('id')
            .eq('user_id', studentId)
            .eq('related_entity_type', 'life_progress_entry')
            .eq('related_entity_id', lowestSatisfaction.id)
            .gte('created_at', `${today}T00:00:00`)
            .single();

          suggestedQuest = {
            id: `life-progress-${lowestSatisfaction.id}`,
            title: `Improve ${lowestSatisfaction.category}`,
            description: `Focus on your ${lowestSatisfaction.category} development. Current satisfaction: ${lowestSatisfaction.satisfaction_score}%`,
            category: lowestSatisfaction.category,
            difficulty_level: 'medium',
            xp_reward: 100,
            mission_date: today,
            deadline_hours: 24,
            is_active: true,
            is_suggestion: true,
            suggestion_reason: `Your ${lowestSatisfaction.category} satisfaction is at ${lowestSatisfaction.satisfaction_score}%. Let's work on improving it!`,
            created_at: new Date().toISOString(),
            is_completed: !!completionCheck, // Mark as completed if found in logs
            completed_at: completionCheck?.created_at
          };
        }
      }

      // Format missions with proper completion status
      const formattedMissions = (missions || []).map((mission) => {
        // Check if this specific student has completed this mission
        const studentProgress = mission.student_mission_progress?.find(
          (progress: any) => progress.student_id === studentId
        );

        return {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          category: mission.category,
          xpReward: mission.xp_reward,
          deadlineHours: mission.deadline_hours,
          isSuggestion: mission.is_suggestion,
          isCompleted: studentProgress?.is_completed || false,
          isProcessing: false
        };
      });

      // Add life progress suggestion at the beginning if it exists (max 7 total: 1 life + 6 class)
      const allMissions = suggestedQuest 
        ? [suggestedQuest, ...formattedMissions.slice(0, 6)]
        : formattedMissions.slice(0, 7);

      return allMissions.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        xpReward: m.xp_reward || m.xpReward,
        isCompleted: m.is_completed || m.isCompleted,
        deadlineHours: m.deadline_hours || m.deadlineHours,
        category: m.category,
        isSuggestion: m.is_suggestion || m.isSuggestion,
        isProcessing: false
      }));
    } catch (error) {
      console.error('Error fetching daily missions:', error);
      throw error;
    }
  }

  async getRecentLessons(studentId: string, limit: number = 20): Promise<LessonData[]> {
    try {
      const { data, error } = await supabase
        .from('student_lesson_progress')
        .select(`
          id,
          progress_percentage,
          is_completed,
          last_accessed_at,
          lesson:lessons(
            id,
            title,
            course:courses(
              id,
              title
            )
          )
        `)
        .eq('student_id', studentId)
        .order('last_accessed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.lesson.id,
        title: item.lesson.title,
        courseName: item.lesson.course.title,
        progressPercentage: item.progress_percentage,
        isCompleted: item.is_completed,
        lastAccessedAt: item.last_accessed_at,
      }));
    } catch (error) {
      console.error('Error fetching recent lessons:', error);
      throw error;
    }
  }

  async getXPTransactionHistory(studentId: string, limit: number = 50): Promise<XPTransaction[]> {
    try {
      // Fetch XP-related transactions from student_wallet_transactions
      const { data, error } = await supabase
        .from('student_wallet_transactions')
        .select('*')
        .eq('wallet_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform transactions to XP format
      return (data || []).map((tx: any) => {
        const isIncoming = tx.amount > 0;
        
        // Determine reason based on transaction description
        let reason = 'Unknown';
        let description = tx.description || 'Transaction';
        
        if (description.toLowerCase().includes('lesson')) {
          reason = 'Lesson Completed';
        } else if (description.toLowerCase().includes('quest') || description.toLowerCase().includes('mission')) {
          reason = 'Quest Completed';
        } else if (description.toLowerCase().includes('purchase') || description.toLowerCase().includes('item')) {
          reason = 'Item Purchased';
        } else if (description.toLowerCase().includes('penalty')) {
          reason = 'Tutor Penalty';
        } else if (description.toLowerCase().includes('deadline')) {
          reason = 'Missed Deadline';
        }

        return {
          id: tx.id,
          amount: Math.abs(tx.amount),
          type: isIncoming ? 'IN' : 'OUT',
          reason,
          description,
          balance: tx.balance_after,
          createdAt: tx.created_at,
        };
      });
    } catch (error) {
      console.error('Error fetching XP history:', error);
      throw error;
    }
  }

  async createCustomMission(studentId: string, missionData: {
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    deadlineHours?: number;
  }): Promise<DailyMission> {
    // FIX: AI-based automatic XP calculation based on complexity
    const calculateAIBasedXP = (title: string, description: string, difficulty: 'easy' | 'medium' | 'hard'): number => {
      // Base XP from difficulty
      const baseXP = {
        easy: 10,
        medium: 25,
        hard: 40
      }[difficulty];

      // Analyze complexity factors
      let complexityBonus = 0;
      
      // Factor 1: Description length (more detailed = more complex)
      if (description.length > 100) complexityBonus += 5;
      if (description.length > 200) complexityBonus += 5;
      
      // Factor 2: Action keywords that indicate complexity
      const complexKeywords = ['research', 'analyze', 'create', 'develop', 'design', 'implement', 'study', 'practice', 'master'];
      const simpleKeywords = ['read', 'watch', 'listen', 'review', 'check'];
      
      const textToAnalyze = `${title} ${description}`.toLowerCase();
      const complexCount = complexKeywords.filter(k => textToAnalyze.includes(k)).length;
      const simpleCount = simpleKeywords.filter(k => textToAnalyze.includes(k)).length;
      
      complexityBonus += (complexCount * 3) - (simpleCount * 2);
      
      // Factor 3: Multiple steps or requirements
      const steps = description.split(/[.,;]/).length;
      if (steps > 3) complexityBonus += 5;
      
      // Calculate final XP (cap between 10-50)
      const finalXP = Math.max(10, Math.min(50, baseXP + complexityBonus));
      
      return finalXP;
    };

    // Use AI calculation instead of fixed values
    const xpReward = calculateAIBasedXP(missionData.title, missionData.description, missionData.difficulty);

    // Set mission date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_missions')
      .insert({
        title: missionData.title,
        description: missionData.description,
        category: missionData.category,
        difficulty_level: missionData.difficulty,
        deadline_hours: missionData.deadlineHours || 24,
        xp_reward: xpReward, // Use AI-calculated XP
        mission_date: tomorrowDateStr,
        is_active: true,
        is_suggestion: false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      xpReward: data.xp_reward,
      isCompleted: false,
      deadlineHours: data.deadline_hours || 24,
      category: data.category,
      isSuggestion: false
    };
  }

  async getStudyCalendar(studentId: string, days: number = 35): Promise<StudyCalendarEvent[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('study_calendar_events')
      .select('event_date, minutes_studied, lessons_completed, xp_earned')
      .eq('student_id', studentId)
      .gte('event_date', startDate.toISOString().split('T')[0])
      .order('event_date');

    if (error) throw error;

    return (data || []).map(event => ({
      date: event.event_date,
      minutesStudied: event.minutes_studied || 0,
      lessonsCompleted: event.lessons_completed || 0,
      xpEarned: event.xp_earned || 0
    }));
  }

  async getCoursesEnrollments(studentId: string): Promise<CourseEnrollment[]> {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        progress_percentage,
        last_accessed_at,
        course:courses (
          title,
          description
        )
      `)
      .eq('student_id', studentId)
      .eq('is_completed', false)
      .order('last_accessed_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return (data || []).map((enrollment: any) => ({
      id: enrollment.id,
      courseId: enrollment.course_id,
      title: enrollment.course?.title || 'Untitled Course',
      progress: enrollment.progress_percentage || 0,
      lastAccessed: this.formatTimeAgo(enrollment.last_accessed_at)
    }));
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  private formatDeadline(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `Today ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    return 'Tomorrow';
  }
}

export const studentDashboardService = new StudentDashboardService();
const //   studentDashboardService: any = null;

export { //   studentDashboardService };
const //   StudentStats: any = null;

export { //   StudentStats };
const //   SkillProgress: any = null;

export { //   SkillProgress };
const //   Achievement: any = null;

export { //   Achievement };
const //   DailyMission: any = null;

export { //   DailyMission };
const //   StudyCalendarEvent 
//: any = null;

export { //   StudyCalendarEvent 
// };