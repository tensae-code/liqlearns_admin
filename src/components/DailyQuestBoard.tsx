import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Sword, Share2, Users, RefreshCw } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  type: 'learn' | 'share' | 'recruit';
  reward_xp: number;
  reward_gold: number;
  is_completed: boolean;
  created_at: string;
}

interface DailyQuestBoardProps {
  userId: string;
  onStatsUpdate?: () => void;
}

const getQuestIcon = (type: string) => {
  switch (type) {
    case 'learn':
      return <Sword className="h-5 w-5 text-blue-500" />;
    case 'share':
      return <Share2 className="h-5 w-5 text-green-500" />;
    case 'recruit':
      return <Users className="h-5 w-5 text-purple-500" />;
    default:
      return <Sword className="h-5 w-5 text-gray-500" />;
  }
};

export default function DailyQuestBoard({ userId, onStatsUpdate }: DailyQuestBoardProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetchQuests();
  }, [userId]);

  const fetchQuests = async () => {
    try {
      setLoading(true);

      // Call edge function to generate or fetch today's quests
      const { data, error } = await supabase.functions.invoke('generate-quests', {
        body: { userId }
      });

      if (error) throw error;

      if (data && data.quests) {
        setQuests(data.quests);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeQuest = async (questId: string) => {
    try {
      setClaiming(questId);

      // Call edge function to complete quest
      const { data, error } = await supabase.functions.invoke('complete-quest', {
        body: { questId }
      });

      if (error) throw error;

      if (data && data.success) {
        // Update local state
        setQuests(prevQuests =>
          prevQuests.map(q =>
            q.id === questId ? { ...q, is_completed: true } : q
          )
        );

        // Notify parent to refresh stats
        if (onStatsUpdate) {
          onStatsUpdate();
        }
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-orange-500">⚔️</span> Daily Quests
          </h3>
          <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-orange-500">⚔️</span> Daily Quests
        </h3>
        <button
          onClick={fetchQuests}
          className="text-xs text-gray-500 hover:text-orange-500 transition-colors"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No quests available today</p>
          <button
            onClick={fetchQuests}
            className="mt-2 text-sm text-orange-500 hover:underline"
          >
            Refresh quests
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quests.map(quest => (
            <div
              key={quest.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                quest.is_completed
                  ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800' :'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {getQuestIcon(quest.type)}
                <div>
                  <p className={`font-medium ${quest.is_completed ? 'text-green-700 dark:text-green-400' : ''}`}>
                    {quest.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{quest.reward_xp} XP · +{quest.reward_gold} Gold
                  </p>
                </div>
              </div>

              {!quest.is_completed && (
                <button
                  onClick={() => completeQuest(quest.id)}
                  disabled={claiming === quest.id}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claiming === quest.id ? 'Claiming...' : 'Claim'}
                </button>
              )}

              {quest.is_completed && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-semibold">Completed!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        Quests refresh daily at midnight UTC
      </div>
    </div>
  );
}