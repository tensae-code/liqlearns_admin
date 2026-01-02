import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  gold_reward: number;
  student_mission_progress?: Array<{
    is_completed: boolean;
    completed_at: string | null;
  }>;
}

interface QuestBoardProps {
  className?: string;
}

const DailyQuestBoard: React.FC<QuestBoardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ xp: 0, gold: 0, streak: 0 });

  useEffect(() => {
    if (user?.id) {
      fetchQuests();
      fetchStats();
    }
  }, [user?.id]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-daily-quests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quests');
      }

      const data = await response.json();
      setQuests(data.quests || []);
    } catch (err: any) {
      console.error('Error fetching quests:', err);
      setError(err.message || 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error: statsError } = await supabase
        .from('student_profiles')
        .select('xp, gold, streak')
        .eq('id', user?.id)
        .single();

      if (statsError) throw statsError;
      if (data) {
        setStats({
          xp: data.xp || 0,
          gold: data.gold || 0,
          streak: data.streak || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const completeQuest = async (questId: string) => {
    try {
      setCompleting(questId);
      setError(null);

      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-quest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ missionId: questId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete quest');
      }

      const result = await response.json();
      
      // Update local quest state
      setQuests(prevQuests =>
        prevQuests.map(q =>
          q.id === questId
            ? {
                ...q,
                student_mission_progress: [
                  {
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                  },
                ],
              }
            : q
        )
      );

      // Update stats
      setStats({
        xp: result.profile.xp,
        gold: result.profile.gold,
        streak: result.rewards.streak,
      });
    } catch (err: any) {
      console.error('Error completing quest:', err);
      setError(err.message || 'Failed to complete quest');
    } finally {
      setCompleting(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'hard':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'education':
        return '📚';
      case 'social':
        return '🤝';
      case 'spiritual':
        return '🕉️';
      case 'health':
        return '💪';
      default:
        return '⭐';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Quests</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <span className="text-sm">⚡</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats.xp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{stats.gold} Gold</span>
          </div>
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <span className="text-sm">🔥</span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{stats.streak} Day Streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Quest List */}
      <div className="space-y-3">
        {quests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No quests available. Come back tomorrow!
          </div>
        ) : (
          quests.map((quest) => {
            const isCompleted = quest.student_mission_progress?.[0]?.is_completed || false;
            
            return (
              <div
                key={quest.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCategoryIcon(quest.category)}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{quest.title}</h4>
                    <span className={`text-xs font-medium uppercase ${getDifficultyColor(quest.difficulty_level)}`}>
                      {quest.difficulty_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{quest.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <span>⚡</span>
                      <span className="font-medium">+{quest.xp_reward} XP</span>
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <span>🪙</span>
                      <span className="font-medium">+{quest.gold_reward} Gold</span>
                    </span>
                  </div>
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">Completed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => completeQuest(quest.id)}
                    disabled={completing === quest.id}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completing === quest.id ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Claiming...</span>
                      </span>
                    ) : (
                      'Claim Reward'
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyQuestBoard;