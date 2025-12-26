import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

import Select from '../../../components/ui/Select';
import { ProgressChart, LevelDistribution, LanguageProgress, TimeRange } from '../types';

interface ProgressChartsProps {
  progressData: ProgressChart[];
  levelDistribution: LevelDistribution[];
  languageProgress: LanguageProgress[];
  className?: string;
}

const ProgressCharts = ({ 
  progressData, 
  levelDistribution, 
  languageProgress, 
  className = '' 
}: ProgressChartsProps) => {
  const [selectedChart, setSelectedChart] = useState<'progress' | 'levels' | 'languages'>('progress');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const chartOptions = [
    { value: 'progress', label: 'Learning Progress' },
    { value: 'levels', label: 'Level Distribution' },
    { value: 'languages', label: 'Language Progress' }
  ];

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-body text-sm text-popover-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-caption text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderProgressChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={progressData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="date" 
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="points" 
          stroke="var(--color-primary)" 
          strokeWidth={2}
          name="Points Earned"
        />
        <Line 
          type="monotone" 
          dataKey="exercises" 
          stroke="var(--color-accent)" 
          strokeWidth={2}
          name="Exercises Completed"
        />
        <Line 
          type="monotone" 
          dataKey="skillProgress" 
          stroke="var(--color-secondary)" 
          strokeWidth={2}
          name="Skill Progress %"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderLevelDistribution = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={levelDistribution}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="count"
          label={({ name, percentage }) => `${name}: ${percentage}%`}
        >
          {levelDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderLanguageProgress = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={languageProgress}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="language" 
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="learners" 
          fill="var(--color-primary)" 
          name="Active Learners"
        />
        <Bar 
          dataKey="averageProgress" 
          fill="var(--color-accent)" 
          name="Average Progress %"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (selectedChart) {
      case 'progress':
        return renderProgressChart();
      case 'levels':
        return renderLevelDistribution();
      case 'languages':
        return renderLanguageProgress();
      default:
        return renderProgressChart();
    }
  };

  const getChartDescription = () => {
    switch (selectedChart) {
      case 'progress':
        return 'Track learning velocity and skill development over time';
      case 'levels':
        return 'Distribution of learners across different learning levels';
      case 'languages':
        return 'Progress comparison across Ethiopian languages';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Progress Analytics
            </h3>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {getChartDescription()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              options={chartOptions}
              value={selectedChart}
              onChange={(value) => setSelectedChart(value as 'progress' | 'levels' | 'languages')}
              className="sm:w-40"
            />
            {selectedChart === 'progress' && (
              <Select
                options={timeRangeOptions}
                value={timeRange}
                onChange={(value) => setTimeRange(value as TimeRange)}
                className="sm:w-32"
              />
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Chart Legend/Stats */}
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        {selectedChart === 'progress' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="font-caption text-xs text-muted-foreground">Points Earned</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span className="font-caption text-xs text-muted-foreground">Exercises Completed</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full" />
              <span className="font-caption text-xs text-muted-foreground">Skill Progress</span>
            </div>
          </div>
        )}

        {selectedChart === 'levels' && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {levelDistribution.map((level) => (
              <div key={level.level} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: level.color }}
                />
                <span className="font-caption text-xs text-muted-foreground truncate">
                  {level.level}
                </span>
              </div>
            ))}
          </div>
        )}

        {selectedChart === 'languages' && (
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="font-caption text-xs text-muted-foreground">Active Learners</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span className="font-caption text-xs text-muted-foreground">Average Progress</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCharts;