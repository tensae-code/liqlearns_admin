export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  sponsor: string;
  currentLevel: UserLevel;
  auraPoints: number;
  accountStatus: AccountStatus;
  joinDate: Date;
  lastLogin: Date;
  totalEarnings: number;
  profileImage: string;
  profileImageAlt: string;
  phoneNumber: string;
  language: string;
  referralCode: string;
  isVerified: boolean;
  banReason?: string;
  banExpiryDate?: Date;
}

export interface MLMNode {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  level: UserLevel;
  auraPoints: number;
  profileImage: string;
  profileImageAlt: string;
  leg: 'A' | 'B' | 'C' | 'D';
  children: MLMNode[];
  totalDownline: number;
  monthlyVolume: number;
  isExpanded: boolean;
}

export interface UserMetrics {
  totalActiveUsers: number;
  pendingApprovals: number;
  dailyRegistrations: number;
  totalBannedUsers: number;
  monthlyGrowthRate: number;
}

export interface UserFilters {
  level: UserLevel | 'all';
  language: string;
  status: AccountStatus | 'all';
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface BanAction {
  userId: string;
  type: 'ban' | 'temporary_ban' | 'approve' | 'unban';
  reason?: string;
  duration?: number; // days for temporary ban
  adminId: string;
  timestamp: Date;
}

export interface UserProgress {
  userId: string;
  learningLevel: LearningLevel;
  skillScores: {
    listening: number;
    speaking: number;
    writing: number;
    reading: number;
  };
  streakDays: number;
  totalPoints: number;
  completedCourses: number;
  timeSpentLearning: number; // minutes
}

export type UserLevel = 
  | 'Student' |'Trainee Seller' |'Salesman' |'Team Leader' |'Supervisor' |'Journeyman' |'Brand Ambassador' |'Ambassador';

export type LearningLevel = 
  | 'Beginner' |'Basic' |'Advanced' |'Pro' |'Elite';

export type AccountStatus = 
  | 'active' |'pending' |'banned' |'temporary_ban' |'suspended';

export interface UserTableColumn {
  key: keyof User | 'actions';
  label: string;
  sortable: boolean;
  width?: string;
}

export interface SortConfig {
  key: keyof User;
  direction: 'asc' | 'desc';
}