import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Calendar, Gift } from 'lucide-react';
import { getLoginStreak, LoginStreak, updateLoginStreak } from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

const DailyStreakTracker: React.FC = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<LoginStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStreakBonus, setShowStreakBonus] = useState(false);

  useEffect(() => {
    const initializeStreak = async () => {
      if (!user?.id) return;

      try {
        // Update login streak for today
        const updatedStreak = await updateLoginStreak(user.id);
        
        // Fetch current streak data
        const streakData = await getLoginStreak(user.id);
        setStreak(streakData);

        // Show bonus animation if milestone reached
        if (streakData?.current_streak === 7 || streakData?.current_streak === 30) {
          setShowStreakBonus(true);
          setTimeout(() => setShowStreakBonus(false), 5000);
        }
      } catch (error) {
        console.error('Error initializing streak:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeStreak();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white animate-pulse">
        <div className="h-24"></div>
      </div>
    );
  }

  if (!streak) return null;

  const daysUntilNext7 = 7 - (streak.current_streak % 7);
  const daysUntilNext30 = 30 - (streak.current_streak % 30);

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Fire animation background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-400 via-orange-500 to-red-600 animate-pulse"></div>
      </div>

      {/* Streak Bonus Notification */}
      {showStreakBonus && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black text-center py-2 font-bold animate-bounce z-10">
          🎉 Streak Milestone! +{streak.current_streak === 7 ? '100 XP & 20 Gold' : '500 XP & 100 Gold'} 🎉
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Flame className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{streak.current_streak} Day Streak</h3>
              <p className="text-sm text-white/80">Keep the fire burning! 🔥</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-yellow-300 mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-lg font-bold">{streak.longest_streak}</span>
            </div>
            <p className="text-xs text-white/80">Longest Streak</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Next milestone in {daysUntilNext7} days</span>
            <span className="font-bold">{daysUntilNext7 === 1 ? '7-Day' : '30-Day'} Reward</span>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(streak.current_streak % 7) * 14.28}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
            <p className="text-2xl font-bold">{streak.total_login_days}</p>
            <p className="text-xs text-white/80">Total Days</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <Gift className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
            <p className="text-2xl font-bold">{streak.seven_day_milestone_count}</p>
            <p className="text-xs text-white/80">7-Day Milestones</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
            <p className="text-2xl font-bold">{streak.thirty_day_milestone_count}</p>
            <p className="text-xs text-white/80">30-Day Milestones</p>
          </div>
        </div>

        {/* Milestone Rewards Info */}
        <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <p className="text-sm font-semibold mb-2">🎁 Milestone Rewards:</p>
          <div className="space-y-1 text-xs">
            <p>• 7 Days: +100 XP, +20 Gold</p>
            <p>• 30 Days: +500 XP, +100 Gold</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStreakTracker;