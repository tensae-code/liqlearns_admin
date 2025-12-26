import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { LearnerProgress, ProgressChart } from '../types';

interface LearnerDetailModalProps {
  learner: LearnerProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

const LearnerDetailModal = ({ learner, isOpen, onClose }: LearnerDetailModalProps) => {
  if (!isOpen || !learner) return null;

  // Mock detailed progress data
  const detailedProgress: ProgressChart[] = [
    { date: '2024-01-01', points: 120, exercises: 5, streakDays: 1, skillProgress: 45 },
    { date: '2024-01-02', points: 180, exercises: 8, streakDays: 2, skillProgress: 48 },
    { date: '2024-01-03', points: 220, exercises: 12, streakDays: 3, skillProgress: 52 },
    { date: '2024-01-04', points: 280, exercises: 15, streakDays: 4, skillProgress: 55 },
    { date: '2024-01-05', points: 350, exercises: 20, streakDays: 5, skillProgress: 58 },
    { date: '2024-01-06', points: 420, exercises: 25, streakDays: 6, skillProgress: 62 },
    { date: '2024-01-07', points: 480, exercises: 28, streakDays: 7, skillProgress: 65 }
  ];

  const achievements = [
    { id: '1', title: 'First Steps', description: 'Completed first lesson', date: '2024-01-01', icon: 'Award' },
    { id: '2', title: 'Streak Master', description: '7-day learning streak', date: '2024-01-07', icon: 'Flame' },
    { id: '3', title: 'Word Wizard', description: 'Learned 100 new words', date: '2024-01-15', icon: 'BookOpen' },
    { id: '4', title: 'Speaking Star', description: 'Completed speaking assessment', date: '2024-01-20', icon: 'Mic' }
  ];

  const recentActivities = [
    { id: '1', activity: 'Completed Amharic Lesson 15', time: '2 hours ago', points: 25 },
    { id: '2', activity: 'Practiced pronunciation exercises', time: '4 hours ago', points: 15 },
    { id: '3', activity: 'Took listening comprehension quiz', time: '1 day ago', points: 30 },
    { id: '4', activity: 'Reviewed vocabulary flashcards', time: '2 days ago', points: 10 }
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Image
              src={learner.avatar}
              alt={learner.alt}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="font-heading font-semibold text-xl text-foreground">
                {learner.fullName}
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                @{learner.username} • {learner.userLevel}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {learner.totalEarnedPoints.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  {learner.dailyLoginStreak}
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {learner.completedExercises}
                </div>
                <div className="text-sm text-muted-foreground">Exercises</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {learner.skillAssessments.overall}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                Learning Progress (Last 7 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detailedProgress}>
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
                      name="Points"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="skillProgress" 
                      stroke="var(--color-accent)" 
                      strokeWidth={2}
                      name="Skill Progress %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievements */}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Recent Achievements
                </h3>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name={achievement.icon} size={16} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-body font-medium text-sm text-foreground">
                          {achievement.title}
                        </p>
                        <p className="font-caption text-xs text-muted-foreground">
                          {achievement.description} • {achievement.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Recent Activities
                </h3>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground">
                          {activity.activity}
                        </p>
                        <p className="font-caption text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-data text-sm font-medium text-primary">
                          +{activity.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                Skill Assessment Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(learner.skillAssessments).filter(([key]) => key !== 'overall').map(([skill, score]) => (
                  <div key={skill} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 relative">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--color-muted)"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeWidth="2"
                          strokeDasharray={`${score}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">{score}%</span>
                      </div>
                    </div>
                    <p className="font-body text-sm text-foreground capitalize">
                      {skill}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDetailModal;