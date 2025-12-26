import React from 'react';
import Icon from '../../../components/AppIcon';
import { ContentStats as ContentStatsType } from '../types';

interface ContentStatsProps {
  stats: ContentStatsType;
  className?: string;
}

const ContentStats = ({ stats, className = '' }: ContentStatsProps) => {
  const statCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: 'FileText',
      color: 'bg-primary',
      textColor: 'text-primary-foreground'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingApproval,
      icon: 'Clock',
      color: 'bg-warning',
      textColor: 'text-warning-foreground'
    },
    {
      title: 'Approved',
      value: stats.approvedContent,
      icon: 'CheckCircle',
      color: 'bg-success',
      textColor: 'text-success-foreground'
    },
    {
      title: 'Rejected',
      value: stats.rejectedContent,
      icon: 'XCircle',
      color: 'bg-error',
      textColor: 'text-error-foreground'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: 'Eye',
      color: 'bg-accent',
      textColor: 'text-accent-foreground'
    },
    {
      title: 'Total Downloads',
      value: stats.totalDownloads.toLocaleString(),
      icon: 'Download',
      color: 'bg-secondary',
      textColor: 'text-secondary-foreground'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {statCards.map((stat, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
              <Icon name={stat.icon} size={20} color="white" />
            </div>
            <div>
              <p className="font-body text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="font-caption text-xs text-muted-foreground">
                {stat.title}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentStats;