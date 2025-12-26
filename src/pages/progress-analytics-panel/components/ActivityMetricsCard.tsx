import React from 'react';
import Icon from '../../../components/AppIcon';
import { ActivityMetrics } from '../types';

interface ActivityMetricsCardProps {
  metrics: ActivityMetrics;
  className?: string;
}

const ActivityMetricsCard = ({ metrics, className = '' }: ActivityMetricsCardProps) => {
  const metricItems = [
    {
      key: 'totalLearners',
      label: 'Total Learners',
      value: metrics.totalLearners.toLocaleString(),
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      key: 'activeLearners',
      label: 'Active Learners',
      value: metrics.activeLearners.toLocaleString(),
      icon: 'UserCheck',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      key: 'averageStreak',
      label: 'Average Streak',
      value: `${metrics.averageStreak} days`,
      icon: 'Flame',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      key: 'totalPoints',
      label: 'Total Points',
      value: metrics.totalPoints.toLocaleString(),
      icon: 'Star',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      key: 'completionRate',
      label: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      key: 'engagementRate',
      label: 'Engagement Rate',
      value: `${metrics.engagementRate}%`,
      icon: 'TrendingUp',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  const getChangeIndicator = (key: string) => {
    // Mock change data - in real app this would come from props
    const changes: Record<string, number> = {
      totalLearners: 12,
      activeLearners: 8,
      averageStreak: -2,
      totalPoints: 15,
      completionRate: 5,
      engagementRate: 3
    };

    const change = changes[key] || 0;
    if (change > 0) {
      return {
        icon: 'TrendingUp',
        color: 'text-success',
        value: `+${change}%`
      };
    } else if (change < 0) {
      return {
        icon: 'TrendingDown',
        color: 'text-error',
        value: `${change}%`
      };
    }
    return {
      icon: 'Minus',
      color: 'text-muted-foreground',
      value: '0%'
    };
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Activity Metrics
            </h3>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Platform engagement and learning statistics
            </p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="BarChart3" size={20} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricItems.map((item) => {
            const change = getChangeIndicator(item.key);
            return (
              <div
                key={item.key}
                className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor}`}>
                    <Icon name={item.icon} size={20} className={item.color} />
                  </div>
                  <div className={`flex items-center space-x-1 ${change.color}`}>
                    <Icon name={change.icon} size={14} />
                    <span className="font-caption text-xs font-medium">
                      {change.value}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="font-data text-2xl font-bold text-foreground mb-1">
                    {item.value}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="font-data text-lg font-bold text-foreground">
              {Math.round((metrics.activeLearners / metrics.totalLearners) * 100)}%
            </p>
            <p className="font-caption text-xs text-muted-foreground">
              Active Ratio
            </p>
          </div>
          <div className="text-center">
            <p className="font-data text-lg font-bold text-foreground">
              {Math.round(metrics.totalPoints / metrics.activeLearners)}
            </p>
            <p className="font-caption text-xs text-muted-foreground">
              Avg Points/User
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMetricsCard;