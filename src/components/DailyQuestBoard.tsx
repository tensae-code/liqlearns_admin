import { useEffect, useState } from 'react';

import { CheckCircle, Sword, Trophy, Clock, Flame, RefreshCw, TrendingUp } from 'lucide-react';
import { 
  fetchTodayQuests, 
  completeQuest, 
  subscribeToQuestUpdates, 
  getQuestStats,
  type QuestWithProgress 
} from '@/services/questService';

interface DailyQuestBoardProps {
  userId: string;
  onStatsUpdate?: () => void;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    spiritual: '🙏',
    health: '💪',
    wealth: '💰',
    service: '🤝',
    education: '📚',
    family: '👨‍👩‍👧',
    social: '🌍'
  };
  return icons[category] || '⚔️';
};

const getDifficultyColor = (level: string) => {
  const colors: Record<string, string> = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  };
  return colors[level] || colors.easy;
};

export default function DailyQuestBoard({ userId, onStatsUpdate }: DailyQuestBoardProps) {
  const [quests, setQuests] = useState<QuestWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showReward, setShowReward] = useState<{ xp: number; gold: number } | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    weeklyStreak: 0,
    totalXPEarned: 0,
    totalGoldEarned: 0
  });

  useEffect(() => {
    loadQuests();
    loadStats();

    // Subscribe to real-time quest updates
    const unsubscribe = subscribeToQuestUpdates(userId, () => {
      loadQuests();
      loadStats();
    });

    return unsubscribe;
  }, [userId]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const fetchedQuests = await fetchTodayQuests(userId);
      setQuests(fetchedQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const questStats = await getQuestStats(userId);
      setStats(questStats);
    } catch (error) {
      console.error('Error loading quest stats:', error);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      setCompleting(questId);

      const rewards = await completeQuest(questId, userId);

      // Show reward animation
      setShowReward(rewards);
      setTimeout(() => setShowReward(null), 3000);

      // Refresh quests and stats
      await loadQuests();
      await loadStats();

      // Notify parent to refresh stats
      if (onStatsUpdate) {
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-orange-500">⚔️</span> Daily Quest Board
          </h3>
          <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const completedQuests = quests.filter(q => q.progress?.is_completed);
  const activeQuests = quests.filter(q => !q.progress?.is_completed);

  return (
    <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 p-6 shadow-sm">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-orange-500">⚔️</span> Daily Quest Board
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete quests to earn XP and Gold
          </p>
        </div>
        <button
          onClick={loadQuests}
          className="text-orange-500 hover:text-orange-600 transition-colors"
          disabled={loading}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Quest Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Completed</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalCompleted}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.weeklyStreak}d</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">XP Earned</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalXPEarned}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💰</span>
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Gold Earned</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.totalGoldEarned}</p>
        </div>
      </div>

      {/* Reward Animation */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl p-6 shadow-2xl animate-bounce">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-2" />
              <p className="text-2xl font-bold">Quest Complete!</p>
              <p className="text-lg mt-2">+{showReward.xp} XP · +{showReward.gold} Gold</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sword className="h-5 w-5 text-orange-500" />
            Active Quests ({activeQuests.length})
          </h4>
          <div className="space-y-3">
            {activeQuests.map(quest => (
              <div
                key={quest.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{getCategoryIcon(quest.category)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100">{quest.title}</h5>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(quest.difficulty_level)}`}>
                        {quest.difficulty_level}
                      </span>
                    </div>
                    {quest.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{quest.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        +{quest.xp_reward} XP
                      </span>
                      <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
                        💰 +{quest.gold_reward} Gold
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {quest.timeRemaining}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCompleteQuest(quest.id)}
                  disabled={completing === quest.id}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completing === quest.id ? 'Completing...' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Completed Today ({completedQuests.length})
          </h4>
          <div className="space-y-2">
            {completedQuests.map(quest => (
              <div
                key={quest.id}
                className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl opacity-50">{getCategoryIcon(quest.category)}</span>
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-300 line-through">{quest.title}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Earned: +{quest.xp_reward} XP · +{quest.gold_reward} Gold
                    </p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Quests Available */}
      {quests.length === 0 && (
        <div className="text-center py-12">
          <Sword className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No quests available today</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Check back tomorrow for new challenges</p>
          <button
            onClick={loadQuests}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Refresh Quests
          </button>
        </div>
      )}

      {/* Quest Refresh Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          🌅 New quests available every day at midnight UTC • Complete quests before deadline to earn maximum rewards
        </p>
      </div>
    </div>
  );
}