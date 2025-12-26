import React from 'react';
import Icon from '../../../components/AppIcon';
import { UserMetrics } from '../types';

interface UserMetricsCardsProps {
  metrics: UserMetrics;
  className?: string;
}

const UserMetricsCards = ({ metrics, className = '' }: UserMetricsCardsProps) => {
  const metricCards = [
    {
      title: 'Total Active Users',
      value: metrics.totalActiveUsers.toLocaleString(),
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: `+${metrics.monthlyGrowthRate}%`,
      changeType: 'positive' as const
    },
    {
      title: 'Pending Approvals',
      value: metrics.pendingApprovals.toLocaleString(),
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: 'Requires Action',
      changeType: 'neutral' as const
    },
    {
      title: 'Daily Registrations',
      value: metrics.dailyRegistrations.toLocaleString(),
      icon: 'UserPlus',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: 'Today',
      changeType: 'neutral' as const
    },
    {
      title: 'Banned Users',
      value: metrics.totalBannedUsers.toLocaleString(),
      icon: 'UserX',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      change: 'Total',
      changeType: 'neutral' as const
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {metricCards.map((card, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-6 hover:shadow-card transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <Icon name={card.icon} size={24} className={card.color} />
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-bold text-foreground">
                {card.value}
              </p>
              <p className={`font-caption text-xs ${
                card.changeType === 'positive' ? 'text-success' : 
                card.changeType === 'negative'? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {card.change}
              </p>
            </div>
          </div>
          <h3 className="font-body font-medium text-sm text-muted-foreground">
            {card.title}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default UserMetricsCards;