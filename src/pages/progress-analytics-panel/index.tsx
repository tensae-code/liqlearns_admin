import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import UserProfileIndicator from '../../components/ui/UserProfileIndicator';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NotificationCenter from '../../components/ui/NotificationCenter';
import LearnerTable from './components/LearnerTable';
import SkillAssessmentCard from './components/SkillAssessmentCard';
import DailyLeaderboard from './components/DailyLeaderboard';
import ProgressCharts from './components/ProgressCharts';
import ActivityMetricsCard from './components/ActivityMetricsCard';
import LearnerDetailModal from './components/LearnerDetailModal';
import Icon from '../../components/AppIcon';
import {
  LearnerProgress,
  LeaderboardEntry,
  ProgressChart,
  LevelDistribution,
  LanguageProgress,
  ActivityMetrics } from
'./types';

const ProgressAnalyticsPanel = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<LearnerProgress | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data
  const mockLearners: LearnerProgress[] = [
  {
    id: '1',
    username: 'abebetech',
    fullName: 'Abebe Kebede',
    email: 'abebe.kebede@email.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11e8a20a5-1765003605182.png",
    alt: 'Professional Ethiopian man in blue shirt smiling at camera in office setting',
    selectedLanguages: ['Amharic', 'Tigrinya'],
    currentLevel: 'Advanced-sentences',
    dailyLoginStreak: 15,
    totalEarnedPoints: 2850,
    auraPoints: 450,
    userLevel: 'Team Leader',
    skillAssessments: {
      listening: 85,
      speaking: 78,
      writing: 82,
      reading: 88,
      overall: 83
    },
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    joinDate: new Date('2023-11-15'),
    completedExercises: 145,
    learningVelocity: 92,
    retentionRate: 87
  },
  {
    id: '2',
    username: 'maryamlearns',
    fullName: 'Maryam Ahmed',
    email: 'maryam.ahmed@email.com',
    avatar: "https://images.unsplash.com/photo-1600416978295-60397839c5c8",
    alt: 'Young Ethiopian woman with hijab smiling warmly in natural lighting',
    selectedLanguages: ['Oromifa', 'Amharic'],
    currentLevel: 'Pro-paragraphs',
    dailyLoginStreak: 23,
    totalEarnedPoints: 4200,
    auraPoints: 680,
    userLevel: 'Supervisor',
    skillAssessments: {
      listening: 92,
      speaking: 89,
      writing: 85,
      reading: 94,
      overall: 90
    },
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    joinDate: new Date('2023-10-08'),
    completedExercises: 198,
    learningVelocity: 95,
    retentionRate: 93
  },
  {
    id: '3',
    username: 'dawitstudy',
    fullName: 'Dawit Haile',
    email: 'dawit.haile@email.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb44758a-1763293761079.png",
    alt: 'Ethiopian man with glasses in casual shirt looking confident outdoors',
    selectedLanguages: ['Tigrinya'],
    currentLevel: 'Basic-words',
    dailyLoginStreak: 8,
    totalEarnedPoints: 1250,
    auraPoints: 180,
    userLevel: 'Trainee Seller',
    skillAssessments: {
      listening: 65,
      speaking: 58,
      writing: 62,
      reading: 70,
      overall: 64
    },
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    joinDate: new Date('2024-01-12'),
    completedExercises: 67,
    learningVelocity: 78,
    retentionRate: 72
  },
  {
    id: '4',
    username: 'hanamaster',
    fullName: 'Hana Tadesse',
    email: 'hana.tadesse@email.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11b5995fc-1763298953560.png",
    alt: 'Professional Ethiopian woman in business attire with warm smile in office environment',
    selectedLanguages: ['Amharic', 'Oromifa', 'Tigrinya'],
    currentLevel: 'Elite-advanced',
    dailyLoginStreak: 45,
    totalEarnedPoints: 7800,
    auraPoints: 1200,
    userLevel: 'Brand Ambassador',
    skillAssessments: {
      listening: 96,
      speaking: 94,
      writing: 92,
      reading: 98,
      overall: 95
    },
    lastActive: new Date(Date.now() - 15 * 60 * 1000),
    joinDate: new Date('2023-08-20'),
    completedExercises: 312,
    learningVelocity: 98,
    retentionRate: 96
  },
  {
    id: '5',
    username: 'samuellearn',
    fullName: 'Samuel Girma',
    email: 'samuel.girma@email.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb44758a-1763293761079.png",
    alt: 'Young Ethiopian man in casual wear with friendly expression in modern setting',
    selectedLanguages: ['Oromifa'],
    currentLevel: 'Beginner-letters',
    dailyLoginStreak: 3,
    totalEarnedPoints: 420,
    auraPoints: 65,
    userLevel: 'Student',
    skillAssessments: {
      listening: 45,
      speaking: 38,
      writing: 42,
      reading: 48,
      overall: 43
    },
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
    joinDate: new Date('2024-02-28'),
    completedExercises: 23,
    learningVelocity: 65,
    retentionRate: 58
  }];


  const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '4',
    username: 'hanamaster',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11b5995fc-1763298953560.png",
    alt: 'Professional Ethiopian woman in business attire with warm smile in office environment',
    points: 7800,
    streak: 45,
    level: 'Brand Ambassador',
    rank: 1,
    change: 2
  },
  {
    id: '2',
    username: 'maryamlearns',
    avatar: "https://images.unsplash.com/photo-1600416978295-60397839c5c8",
    alt: 'Young Ethiopian woman with hijab smiling warmly in natural lighting',
    points: 4200,
    streak: 23,
    level: 'Supervisor',
    rank: 2,
    change: 1
  },
  {
    id: '1',
    username: 'abebetech',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_11e8a20a5-1765003605182.png",
    alt: 'Professional Ethiopian man in blue shirt smiling at camera in office setting',
    points: 2850,
    streak: 15,
    level: 'Team Leader',
    rank: 3,
    change: -1
  },
  {
    id: '3',
    username: 'dawitstudy',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb44758a-1763293761079.png",
    alt: 'Ethiopian man with glasses in casual shirt looking confident outdoors',
    points: 1250,
    streak: 8,
    level: 'Trainee Seller',
    rank: 4,
    change: 0
  },
  {
    id: '5',
    username: 'samuellearn',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb44758a-1763293761079.png",
    alt: 'Young Ethiopian man in casual wear with friendly expression in modern setting',
    points: 420,
    streak: 3,
    level: 'Student',
    rank: 5,
    change: -2
  }];


  const mockProgressData: ProgressChart[] = [
  { date: '2024-01-01', points: 1200, exercises: 45, streakDays: 12, skillProgress: 68 },
  { date: '2024-01-02', points: 1350, exercises: 52, streakDays: 13, skillProgress: 70 },
  { date: '2024-01-03', points: 1480, exercises: 58, streakDays: 14, skillProgress: 72 },
  { date: '2024-01-04', points: 1620, exercises: 65, streakDays: 15, skillProgress: 74 },
  { date: '2024-01-05', points: 1780, exercises: 72, streakDays: 16, skillProgress: 76 },
  { date: '2024-01-06', points: 1950, exercises: 78, streakDays: 17, skillProgress: 78 },
  { date: '2024-01-07', points: 2100, exercises: 85, streakDays: 18, skillProgress: 80 }];


  const mockLevelDistribution: LevelDistribution[] = [
  { level: 'Student', count: 45, percentage: 35, color: '#94A3B8' },
  { level: 'Trainee Seller', count: 28, percentage: 22, color: '#3B82F6' },
  { level: 'Salesman', count: 22, percentage: 17, color: '#10B981' },
  { level: 'Team Leader', count: 18, percentage: 14, color: '#F59E0B' },
  { level: 'Supervisor', count: 10, percentage: 8, color: '#EF4444' },
  { level: 'Journeyman', count: 3, percentage: 2, color: '#8B5CF6' },
  { level: 'Brand Ambassador', count: 2, percentage: 2, color: '#EC4899' },
  { level: 'Ambassador', count: 0, percentage: 0, color: '#6B7280' }];


  const mockLanguageProgress: LanguageProgress[] = [
  { language: 'Amharic', learners: 85, averageProgress: 72, completionRate: 68 },
  { language: 'Tigrinya', learners: 52, averageProgress: 65, completionRate: 61 },
  { language: 'Oromifa', learners: 48, averageProgress: 69, completionRate: 64 }];


  const mockActivityMetrics: ActivityMetrics = {
    totalLearners: 128,
    activeLearners: 96,
    averageStreak: 12,
    totalPoints: 16520,
    completionRate: 64,
    engagementRate: 75
  };

  const handleLearnerSelect = (learner: LearnerProgress) => {
    setSelectedLearner(learner);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLearner(null);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Add this block - Mock breadcrumb items
  const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Progress Analytics', href: '/admin/analytics/progress' }];


  // Add this block - Mock notification handlers
  const handleNotificationClick = (notificationId: string) => {
    console.log('Notification clicked:', notificationId);
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Mark as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
  };

  // Add this block - Mock user profile handlers
  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const mockUserAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

  return (
    <>
      <Helmet>
        <title>Progress Analytics Panel - LiqLearns Admin</title>
        <meta name="description" content="Monitor individual learning progress, skill assessments, and gamification metrics across the Ethiopian language learning platform" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation Sidebar */}
        <NavigationSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar} />


        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
          {/* Top Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BreadcrumbNavigation items={breadcrumbItems} />
              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead} />

                <UserProfileIndicator
                  userAvatar={mockUserAvatar}
                  onLogout={handleLogout}
                  onProfileClick={handleProfileClick} />

              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="BarChart3" size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-heading font-bold text-2xl text-foreground">
                    Progress Analytics Panel
                  </h1>
                  <p className="font-body text-muted-foreground">
                    Monitor individual learning progress, skill assessments, and gamification metrics
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Metrics */}
            <div className="mb-8">
              <ActivityMetricsCard metrics={mockActivityMetrics} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Learner Table - Takes 2 columns */}
              <div className="xl:col-span-2">
                <LearnerTable
                  learners={mockLearners}
                  onLearnerSelect={handleLearnerSelect}
                  selectedLearner={selectedLearner} />

              </div>

              {/* Daily Leaderboard */}
              <div>
                <DailyLeaderboard entries={mockLeaderboard} />
              </div>
            </div>

            {/* Charts and Assessment Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Progress Charts - Takes 2 columns */}
              <div className="xl:col-span-2">
                <ProgressCharts
                  progressData={mockProgressData}
                  levelDistribution={mockLevelDistribution}
                  languageProgress={mockLanguageProgress} />

              </div>

              {/* Skill Assessment Card */}
              <div>
                {selectedLearner ?
                <SkillAssessmentCard
                  assessment={selectedLearner.skillAssessments}
                  learnerName={selectedLearner.fullName} /> :


                <div className="bg-card rounded-lg border border-border p-8 text-center">
                    <Icon name="UserCheck" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading font-medium text-lg text-foreground mb-2">
                      Select a Learner
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Click on any learner from the table to view their detailed skill assessment
                    </p>
                  </div>
                }
              </div>
            </div>
          </main>
        </div>

        {/* Learner Detail Modal */}
        <LearnerDetailModal
          learner={selectedLearner}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal} />

      </div>
    </>);

};

export default ProgressAnalyticsPanel;