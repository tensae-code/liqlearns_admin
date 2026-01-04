import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Coins, Flame, Trophy } from 'lucide-react';

interface GameStats {
  xp: number;
  gold: number;
  streak: number;
}

interface GameHUDProps {
  userId: string;
}

export default function GameHUD({ userId }: GameHUDProps) {
  const [stats, setStats] = useState<GameStats>({ xp: 0, gold: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('xp, gold, streak')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setStats({
          xp: data.xp || 0,
          gold: data.gold || 0,
          streak: data.streak || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-2 animate-pulse">
        <div className="h-6 w-24 bg-orange-200 dark:bg-orange-800 rounded"></div>
        <div className="h-6 w-24 bg-yellow-200 dark:bg-yellow-800 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-6 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">XP</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">{stats.xp}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Gold</span>
            <span className="font-bold text-yellow-600 dark:text-yellow-400">{stats.gold}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Streak</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{stats.streak} days</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
        Keep grinding to level up! 🎮
      </div>
    </div>
  );
}