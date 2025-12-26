import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Select from '../../../components/ui/Select';
import { LeaderboardEntry, TimeRange } from '../types';

interface DailyLeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const DailyLeaderboard = ({ entries, className = '' }: DailyLeaderboardProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Daily Leaderboard
            </h3>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Top performers and streak achievements
            </p>
          </div>
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={(value) => setTimeRange(value as TimeRange)}
            className="sm:w-40"
          />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-6">
        <div className="space-y-3">
          {entries.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-card ${
                entry.rank <= 3 ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(entry.rank)}`}>
                  {typeof getRankIcon(entry.rank) === 'string' && getRankIcon(entry.rank).length === 1 
                    ? getRankIcon(entry.rank) 
                    : entry.rank
                  }
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <Image
                    src={entry.avatar}
                    alt={entry.alt}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-body font-medium text-sm text-foreground">
                      {entry.username}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="font-caption text-xs text-muted-foreground">
                        {entry.level}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Icon name="Flame" size={12} className="text-orange-500" />
                        <span className="font-caption text-xs text-muted-foreground">
                          {entry.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Points */}
                <div className="text-right">
                  <p className="font-data font-medium text-sm text-foreground">
                    {entry.points.toLocaleString()}
                  </p>
                  <p className="font-caption text-xs text-muted-foreground">
                    points
                  </p>
                </div>

                {/* Change */}
                <div className={`flex items-center space-x-1 ${getChangeColor(entry.change)}`}>
                  <Icon name={getChangeIcon(entry.change)} size={14} />
                  <span className="font-caption text-xs font-medium">
                    {Math.abs(entry.change)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="font-heading font-medium text-lg text-foreground mb-2">
              No leaderboard data
            </h4>
            <p className="font-body text-sm text-muted-foreground">
              Leaderboard will appear once learners start earning points
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {entries.length > 0 && (
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-data text-lg font-bold text-foreground">
                {entries.reduce((sum, entry) => sum + entry.points, 0).toLocaleString()}
              </p>
              <p className="font-caption text-xs text-muted-foreground">
                Total Points
              </p>
            </div>
            <div>
              <p className="font-data text-lg font-bold text-foreground">
                {Math.round(entries.reduce((sum, entry) => sum + entry.streak, 0) / entries.length)}
              </p>
              <p className="font-caption text-xs text-muted-foreground">
                Avg Streak
              </p>
            </div>
            <div>
              <p className="font-data text-lg font-bold text-foreground">
                {entries.filter(entry => entry.change > 0).length}
              </p>
              <p className="font-caption text-xs text-muted-foreground">
                Improving
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLeaderboard;