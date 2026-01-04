import React from 'react';
import { Crown, TrendingUp, Users } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  referrals: number;
  xp: number;
  avatar?: string;
}

interface LeaderboardComponentProps {
  leaderboardData: LeaderboardEntry[];
}

export default function LeaderboardComponent({ leaderboardData }: LeaderboardComponentProps) {
  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getPodiumIcon = (rank: number) => {
    if (rank <= 3) {
      return <Crown className="h-4 w-4 text-white" />;
    }
    return <TrendingUp className="h-4 w-4 text-white" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Top Recruiters</h3>
          <p className="text-sm text-gray-500">This month's leaderboard</p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboardData?.slice(0, 10).map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
              entry.rank <= 3 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' :'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${getPodiumColor(entry.rank)} text-white font-bold text-sm shadow-md`}>
              {entry.rank <= 3 ? getPodiumIcon(entry.rank) : entry.rank}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{entry.username}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {entry.referrals} referrals
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {entry.xp} XP
                </span>
              </div>
            </div>

            {entry.rank <= 3 && (
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPodiumColor(entry.rank)} text-white text-xs font-bold shadow-sm`}>
                #{entry.rank}
              </div>
            )}
          </div>
        ))}
      </div>

      {(!leaderboardData || leaderboardData.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No leaderboard data available yet</p>
          <p className="text-sm">Start referring to climb the ranks!</p>
        </div>
      )}
    </div>
  );
}