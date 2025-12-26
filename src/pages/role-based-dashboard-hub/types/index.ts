export interface UserRole {
  type: 'admin' | 'student' | 'teacher' | 'support' | 'ceo';
  name: string;
  email: string;
  avatar?: string;
  id?: string;
  department?: string;
  joinDate?: string;
}

export interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: UserRole['type'][];
  badge?: number;
  isActive?: boolean;
}

export interface DashboardStats {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export interface LearningProgress {
  skill: string;
  progress: number;
  total: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'learning' | 'achievement' | 'social' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface DashboardPermissions {
  canViewUsers: boolean;
  canManageContent: boolean;
  canViewFinancials: boolean;
  canManageStore: boolean;
  canViewAnalytics: boolean;
  canManageSupport: boolean;
  canViewReports: boolean;
}

export interface StudentMetrics {
  xp: number;
  level: number;
  streak: number;
  auraPoints: number;
  completedCourses: number;
  rank: string;
  skillProgress: LearningProgress[];
}

export interface TeacherMetrics {
  studentsCount: number;
  coursesCreated: number;
  averageProgress: number;
  upcomingClasses: number;
  pendingAssignments: number;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  systemHealth: number;
  revenue: number;
}

export interface SupportMetrics {
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: string;
  satisfaction: number;
}

export interface CEOMetrics {
  totalRevenue: number;
  userGrowth: number;
  platformHealth: number;
  keyMetrics: DashboardStats[];
}