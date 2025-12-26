import React from 'react';
import Icon from '../../../components/AppIcon';
import { EventStats as EventStatsType } from '../types';

interface EventStatsProps {
  stats: EventStatsType;
  className?: string;
}

const EventStats = ({ stats, className = '' }: EventStatsProps) => {
  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: 'Calendar',
      color: 'text-primary bg-primary/10',
      trend: '+12%'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: 'Clock',
      color: 'text-accent bg-accent/10',
      trend: '+8%'
    },
    {
      title: 'Ongoing Events',
      value: stats.ongoingEvents,
      icon: 'Play',
      color: 'text-success bg-success/10',
      trend: '+5%'
    },
    {
      title: 'Completed Events',
      value: stats.completedEvents,
      icon: 'CheckCircle',
      color: 'text-muted-foreground bg-muted',
      trend: '+15%'
    },
    {
      title: 'Total Participants',
      value: stats.totalParticipants.toLocaleString(),
      icon: 'Users',
      color: 'text-warning bg-warning/10',
      trend: '+22%'
    },
    {
      title: 'Average Attendance',
      value: `${stats.averageAttendance}%`,
      icon: 'TrendingUp',
      color: 'text-success bg-success/10',
      trend: '+3%'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-6 hover:shadow-card transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <Icon name={stat.icon} size={20} />
            </div>
            <span className="font-body text-xs text-success bg-success/10 px-2 py-1 rounded-full">
              {stat.trend}
            </span>
          </div>

          <div className="space-y-1">
            <p className="font-heading font-bold text-2xl text-card-foreground">
              {stat.value}
            </p>
            <p className="font-body text-sm text-muted-foreground">
              {stat.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventStats;