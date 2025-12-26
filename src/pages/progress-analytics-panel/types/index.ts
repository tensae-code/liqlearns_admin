export interface LearnerProgress {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  alt: string;
  selectedLanguages: string[];
  currentLevel: LearningLevel;
  dailyLoginStreak: number;
  totalEarnedPoints: number;
  auraPoints: number;
  userLevel: UserLevel;
  skillAssessments: SkillAssessment;
  lastActive: Date;
  joinDate: Date;
  completedExercises: number;
  learningVelocity: number;
  retentionRate: number;
}

export interface SkillAssessment {
  listening: number;
  speaking: number;
  writing: number;
  reading: number;
  overall: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  alt: string;
  points: number;
  streak: number;
  level: UserLevel;
  rank: number;
  change: number;
}

export interface ProgressChart {
  date: string;
  points: number;
  exercises: number;
  streakDays: number;
  skillProgress: number;
}

export interface LevelDistribution {
  level: UserLevel;
  count: number;
  percentage: number;
  color: string;
}

export interface LanguageProgress {
  language: string;
  learners: number;
  averageProgress: number;
  completionRate: number;
}

export interface ActivityMetrics {
  totalLearners: number;
  activeLearners: number;
  averageStreak: number;
  totalPoints: number;
  completionRate: number;
  engagementRate: number;
}

export type LearningLevel = 
  | 'Beginner-letters'
  | 'Basic-words' |'Advanced-sentences' |'Pro-paragraphs' |'Elite-advanced';

export type UserLevel = 
  | 'Student' |'Trainee Seller' |'Salesman' |'Team Leader' |'Supervisor' |'Journeyman' |'Brand Ambassador' |'Ambassador';

export type SkillType = 'listening' | 'speaking' | 'writing' | 'reading';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

export interface FilterOptions {
  language: string;
  level: LearningLevel | 'all';
  userLevel: UserLevel | 'all';
  timeRange: TimeRange;
  searchQuery: string;
}