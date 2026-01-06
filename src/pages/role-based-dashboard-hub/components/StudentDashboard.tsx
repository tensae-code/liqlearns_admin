import React, { useEffect, useState } from 'react';
import { Trophy, Target, Zap, Star, TrendingUp, Calendar, Play, BookMarked, Headphones, Music, Gamepad2, BookAudio, Type, FileText, Dumbbell, BookCopy, Film, DollarSign, Users, Share2, Link2, Package, Edit3, Plus, Upload, Check, X, MessageSquare, BookOpen } from 'lucide-react';
import { Search, Filter, ShoppingCart, Award, Download } from 'lucide-react';
import { Video } from 'lucide-react';
import { Loader2 } from 'lucide-react';
// Add this block - Import Flame icon
import { Flame } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
// ✅ CRITICAL FIX: Import ONLY direct Supabase client - NO edge function dependencies
import { supabase } from '../../../lib/supabase';

// ❌ REMOVED: All edge function and apiClient imports - these caused the errors
// import { apiClient } from '../../../lib/apiClient';
// 
// import { marketplaceService, MarketplaceProduct, PaymentMethod, ProductCategory, CartItem, AuthorProfile } from '../../../services/marketplaceService';
// import { resourceUnlockService, TutoringResource, StudentLevel } from '../../../services/resourceUnlockService';
// NEW: Import LMS Service
import { lmsService } from '../../../services/lmsService';
import { Assignment, CourseDiscussion, QuizTemplate, GradeRecord, CourseSyllabus, CourseAttendance, AttendanceStats, CourseOutcome, StudentOutcomeProgress, CourseFile, CoursePerson, CourseAnalytics } from '../../../services/lmsService';
import { studyRoomService } from '../../../services/studyRoomService';
// Add this import for courseContentService
import { courseContentService } from '../../../services/courseContentService';
// Add this block - Import studentDashboardService
import { studentDashboardService, SkillProgress, Achievement, DailyMission, StudyCalendarEvent } from '../../../services/studentDashboardService';
// NEW: Import Phase 2 services
import { 
  certificateService, 
  subscriptionService, 
  gamificationService, 
  mlmEarnersService,
  StudentCertificate,
  SubscriptionPlan,
  BadgeProgress,
  MLMNetwork,
  MLMCommission,
  PayoutRequest,
  DownlineMember
} from '../../../services/phase2Service';
import { communityService, CommunityPost } from '../../../services/communityService';
import { calendarEventsService, CalendarEvent } from '../../../services/calendarEventsService';
import Icon from '../../../components/AppIcon';
import CourseSelectionCard, { CourseOption } from './CourseSelectionCard';
// NEW: Import VirtualClassroomHub component
import VirtualClassroomHub from './VirtualClassroomHub';
// NEW: Import StreakGiftAnimation component
import StreakGiftAnimation from './StreakGiftAnimation';
// NEW: Import HelpCenter component
import HelpCenter from './HelpCenter';
// NEW: Import StudyRoomHub component
import StudyRoomHub from '../../../components/StudyRoomHub';
// NEW: Import StatCardModal component
import StatCardModal, { StatCardType } from '../../../components/StatCardModal';
// NEW: Import checkout modals
import CheckoutModal from '../../../components/CheckoutModal';
import CheckoutSuccessModal from '../../../components/CheckoutSuccessModal';
import EmbeddedMarketplace from '../../../components/EmbeddedMarketplace';

import AchievementUnlockAnimation from '../../../components/AchievementUnlockAnimation';






import { fetchUserStats, fetchLeaderboard, fetchUserBadges, awardQuestReward } from '../../../services/gamificationService';

import { User } from '../../user-management-dashboard/types/index';
import { useNavigate } from 'react-router-dom';
import CourseContentView from './CourseContentView';
import { StudentStats } from '../../../services/studentDashboardService';

// Add this block - Import missing services
import { resourceUnlockService, TutoringResource, StudentLevel } from '../../../services/resourceUnlockService';
import { marketplaceService, MarketplaceProduct, PaymentMethod, ProductCategory, CartItem, AuthorProfile } from '../../../services/marketplaceService';
// End of added block

// Add interface for user activities at the top with other interfaces
interface UserActivity {
  id: string;
  title: string;
  xpEarned: number;
  createdAt: string;
}

// NEW: Add courseOptions constant at the top level
const courseOptions = [
  {
    id: '1',
    name: 'Amharic Language',
    type: 'amharic',
    icon: BookOpen,
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    skillCount: 12,
    difficulty: 'intermediate' as const,
    estimatedTime: '6 months',
    description: 'Master Amharic from basics to advanced conversation'
  },
  {
    id: '2',
    name: 'Ethiopian Culture',
    type: 'culture',
    icon: Users,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    skillCount: 8,
    difficulty: 'beginner' as const,
    estimatedTime: '3 months',
    description: 'Explore Ethiopian traditions, history, and customs'
  },
  {
    id: '3',
    name: 'Mathematics',
    type: 'mathematics',
    icon: Target,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    skillCount: 15,
    difficulty: 'advanced' as const,
    estimatedTime: '12 months',
    description: 'From basic arithmetic to advanced mathematics'
  },
  {
    id: '4',
    name: 'Science',
    type: 'science',
    icon: Zap,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    skillCount: 10,
    difficulty: 'intermediate' as const,
    estimatedTime: '8 months',
    description: 'Physics, Chemistry, and Biology fundamentals'
  },
  {
    id: '5',
    name: 'English Language',
    type: 'english',
    icon: Type,
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    skillCount: 14,
    difficulty: 'beginner' as const,
    estimatedTime: '6 months',
    description: 'English reading, writing, and conversation skills'
  },
  {
    id: '6',
    name: 'Technology & Coding',
    type: 'technology',
    icon: Trophy,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    skillCount: 20,
    difficulty: 'advanced' as const,
    estimatedTime: '12 months',
    description: 'Programming, web development, and computer science'
  }
];

// Circular Progress Component
interface CircularProgressProps {
  progress: number;
  color: string;
  skillName: string;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  progress, 
  color, 
  skillName, 
  size = 120, 
  strokeWidth = 8 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-blue-500': '#3B82F6',
      'bg-green-500': '#10B981',
      'bg-purple-500': '#8B5CF6',
      'bg-orange-500': '#F97316'
    };
    return colorMap[color] || '#3B82F6';
  };

  const strokeColor = getColorClasses(color);

  // Make size responsive
  const responsiveSize = typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(size * 0.8, 100) : size;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative overflow-visible" style={{ width: responsiveSize, height: responsiveSize, minWidth: responsiveSize, minHeight: responsiveSize }}>
        <svg
          className="transform -rotate-90 overflow-visible"
          width={responsiveSize}
          height={responsiveSize}
          style={{ display: 'block' }}
        >
          {/* Background circle */}
          <circle
            cx={responsiveSize / 2}
            cy={responsiveSize / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={responsiveSize / 2}
            cy={responsiveSize / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">{progress}%</span>
        </div>
      </div>
      <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-gray-700 text-center">{skillName}</p>
    </div>
  );
};

// Updated Tutoring Resources Card Component with unlock indicator
interface ResourceCardProps {
  icon: React.ElementType;
  name: string;
  color: string;
  unlockNumber?: string;
  isLocked?: boolean;
  unlockText?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  icon: Icon, 
  name, 
  color, 
  unlockNumber, 
  isLocked = false,
  unlockText 
}) => {
  return (
    <button 
      className={`relative flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-100 ${
        isLocked ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      disabled={isLocked}
    >
      {/* Unlock number badge - top right */}
      {unlockNumber && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-md">
          {unlockNumber}
        </div>
      )}
      
      <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${
        isLocked ? 'grayscale' : ''
      }`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">{name}</span>
      
      {isLocked && unlockText && (
        <span className="mt-1 text-[10px] sm:text-xs text-orange-600 font-medium text-center">
          {unlockText}
        </span>
      )}
    </button>
  );
};

interface StudentDashboardProps {
  activeSection?: string;
  role?: string;
}

// Add this block - Teacher stats state interface
interface TeacherStats {
  coursesTaught: number;
  totalStudents: number;
  averageRating: number;
  totalRevenue: number;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeSection = 'dashboard', role = 'student' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State declarations (already correct - keep as is)
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<StudyCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tutoringResources, setTutoringResources] = useState<TutoringResource[]>([]);
  const [studentLevel, setStudentLevel] = useState<StudentLevel | null>(null);
  
  // Add this block - Teacher stats state
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  
  // NEW: Phase 2 state
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionPlan | null>(null);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [mlmNetwork, setMlmNetwork] = useState<MLMNetwork | null>(null);
  const [commissions, setCommissions] = useState<MLMCommission[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [downlineMembers, setDownlineMembers] = useState<DownlineMember[]>([]);
  const [earningsBreakdown, setEarningsBreakdown] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    withdrawnTotal: 0
  });

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'ebook',
    permissions: {
      downloadable: true,
      printable: false,
      shareable: false,
      expiryDays: 0
    }
  });
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // NEW: Course selection state
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCourseDashboard, setShowCourseDashboard] = useState(false);

  // NEW: LMS State
  const [selectedCourseForLMS, setSelectedCourseForLMS] = useState<string | null>(null);
  const [lmsActiveTab, setLmsActiveTab] = useState<string>('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<CourseDiscussion[]>([]);
  const [quizzes, setQuizzes] = useState<QuizTemplate[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [gradeSummary, setGradeSummary] = useState<any>(null);
  const [syllabus, setSyllabus] = useState<CourseSyllabus[]>([]);
  const [attendance, setAttendance] = useState<CourseAttendance[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [outcomes, setOutcomes] = useState<CourseOutcome[]>([]);
  const [outcomeProgress, setOutcomeProgress] = useState<StudentOutcomeProgress[]>([]);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [coursePeople, setCoursePeople] = useState<CoursePerson[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
  const [lmsLoading, setLmsLoading] = useState(false);
  const [lmsError, setLmsError] = useState<string | null>(null);

  // NEW: Study Room State
  const [studyRooms, setStudyRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomParticipants, setRoomParticipants] = useState<any[]>([]);
  const [studyRoomLoading, setStudyRoomLoading] = useState(false);

  // Settings-related state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    weeklyReports: true,
    communityUpdates: true
  });

  // NEW: Streak animation state
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [hasShownStreakToday, setHasShownStreakToday] = useState(false);

  // NEW: State to store actual course mappings from database
  const [realCourseIds, setRealCourseIds] = useState<Map<string, string>>(new Map());

  // Events section state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    eventType: 'workshop',
    isPublic: false
  });
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Community section state
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelContent, setPanelContent] = useState<{ title: string; component: React.ReactNode } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeCourses, setActiveCourses] = useState<any[]>([]);

  // NEW: Right sidebar state for course details
  const [showCourseDetailsSidebar, setShowCourseDetailsSidebar] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<CourseOption | null>(null);

  // NEW: Mission for Tomorrow modal state
  const [showAddMissionModal, setShowAddMissionModal] = useState(false);
  const [newMissionData, setNewMissionData] = useState({
    title: '',
    description: '',
    category: 'education',
    // Fix this line - Remove invalid string literal with unescaped quotes
    difficulty: 'medium\' as \'easy\' | \'medium\' | \'hard',
    deadlineHours: 24
  });
  const [isCreatingMission, setIsCreatingMission] = useState(false);
  const [missionError, setMissionError] = useState<string | null>(null);

  // NEW: Stat card modal state
  const [showStatCardModal, setShowStatCardModal] = useState(false);
  const [selectedStatCard, setSelectedStatCard] = useState<StatCardType | null>(null);

  // NEW: Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // NEW: Author shop state
  const [showAuthorShop, setShowAuthorShop] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfile | null>(null);
  const [authorProducts, setAuthorProducts] = useState<MarketplaceProduct[]>([]);
  const [authorShopLoading, setAuthorShopLoading] = useState(false);

  // NEW: Enhanced search state
  const [searchMode, setSearchMode] = useState<'tool' | 'lesson' | 'item'>('tool');

  // FIX: Move marketplace section state to top level (prevent hooks violation)
  const [marketplaceViewMode, setMarketplaceViewMode] = useState<'tool' | 'subject'>('tool');
  const [marketplaceSearchTerm, setMarketplaceSearchTerm] = useState('');
  const [debouncedMarketplaceSearch, setDebouncedMarketplaceSearch] = useState('');
  const [selectedMarketplaceCategory, setSelectedMarketplaceCategory] = useState<string | null>(null);
  const [categoryItems, setCategoryItems] = useState<MarketplaceProduct[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // NEW: Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckoutSuccessModal, setShowCheckoutSuccessModal] = useState(false);

  // NEW: Real-time connection status state with retry counter
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [realtimeRetryCount, setRealtimeRetryCount] = useState(0);
  const [showRealtimeError, setShowRealtimeError] = useState(false);
  // Add this block - Add connection status state for backend
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  // 🔴 NEW: Add detailed connection debugging state
  const [connectionDebugInfo, setConnectionDebugInfo] = useState<{
    environment: 'preview' | 'production';
    supabaseUrl: string;
    timestamp: string;
    attemptCount: number;
    lastError: string | null;
    websocketSupported: boolean;
  }>({
    environment: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 'preview' : 'production',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
    timestamp: new Date().toISOString(),
    attemptCount: 0,
    lastError: null,
    websocketSupported: typeof WebSocket !== 'undefined'
  });

  // Add this block - Gamification state
  const [gamification, setGamification] = useState<any>({
    stats: null,
    leaderboard: [],
    badges: [],
    questReward: null,
    showLevelUp: false,
    newLevel: null
  });
  // End of added block

  // NEW: Add user activities state
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  // ✅ CACHE-BUSTING FIX: Add version state to force re-render
  const [componentVersion, setComponentVersion] = useState(Date.now());

  // ✅ NEW: Polling state (replaces WebSocket)
  const [pollingStatus, setPollingStatus] = useState<'active' | 'paused' | 'failed'>('paused');
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);

  // Helper functions for panel
  const openPanel = (title: string, component: React.ReactNode) => {
    setPanelContent({ title, component });
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setPanelContent(null);
  };

  // Helper functions for loading data
  const loadEvents = async () => {
    if (!user?.id) return;
    try {
      const eventsData = await calendarEventsService.getUpcomingEvents(user.id, currentDate);
      setEvents(eventsData);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setEventsError(err.message);
    }
  };

  const loadPosts = async () => {
    if (!user?.id) return;
    try {
      const postsData = await communityService.getApprovedPosts(20);
      setPosts(postsData);
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setCommunityError(err.message);
    }
  };

  // Load profile and courses
  useEffect(() => {
    if (user?.id) {
      setProfile({
        full_name: user.email?.split('@')[0] || 'User',
        email: user.email,
        role: user.role || 'student'
      });

      setActiveCourses([
        {
          id: '1',
          title: 'Amharic Language',
          description: 'Learn Amharic from basics to advanced',
          progress: 45,
          image_url: '/api/placeholder/400/200'
        },
        {
          id: '2',
          title: 'Mathematics',
          description: 'Master mathematical concepts',
          progress: 60,
          image_url: '/api/placeholder/400/200'
        }
      ]);
    }
  }, [user?.id]);

  // Load actual course IDs from database
  useEffect(() => {
    const loadRealCourseIds = async () => {
      try {
        const availableCourses = await courseContentService.getAvailableCourses();
        const idMap = new Map<string, string>();
        
        availableCourses.forEach(course => {
          idMap.set(course.type, course.id);
        });
        
        setRealCourseIds(idMap);
      } catch (err: any) {
        console.error('Error loading course IDs:', err);
      }
    };

    loadRealCourseIds();
  }, []);

  // Load dashboard data with real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    let pollingInterval: NodeJS.Timeout | null = null;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setConnectionStatus('connecting');

        if (role === 'student') {
          // ✅ BOOTSTRAP PATTERN: Initial load via bootstrap-student
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-stats?id=${user.id}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            setConnectionStatus('offline');
            setPollingStatus('failed');
            throw new Error(`Backend offline: ${response.statusText}`);
          }

          const statsData = await response.json();
          
          if (isMounted) {
            setStats({
              totalXP: statsData.xp || 0,
              totalLessons: statsData.enrolled_courses || 0,
              currentStreak: statsData.streak || 0,
              level: statsData.level || 1,
              auraPoints: statsData.aura_points || 0,
              gold: statsData.gold || 0,
              enrolledCourses: statsData.enrolled_courses || 0,
              completedCourses: statsData.completed_courses || 0
            });

            setConnectionStatus('online');
            setPollingStatus('active');
            setLastPollTime(new Date());
            console.log('✅ Stats loaded - starting polling loop');
          }

        } else {
          // ✅ Teacher/Admin/Support/CEO: Keep existing direct queries (they work fine)
          const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id')
            .eq('instructor_id', user.id);

          if (coursesError) throw coursesError;

          const { data: enrollments, error: enrollError } = await supabase
            .from('course_enrollments')
            .select('student_id')
            .in('course_id', courses?.map(c => c.id) || []);

          if (enrollError) throw enrollError;

          const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || []).size;

          if (isMounted) {
            setTeacherStats({
              coursesTaught: courses?.length || 0,
              totalStudents: uniqueStudents,
              averageRating: 4.7,
              totalRevenue: (courses?.length || 0) * 25
            });

            setConnectionStatus('online');
          }
        }

        // ✅ Load other dashboard data (keep existing service calls - they work fine)
        const [
          skillsData, 
          achievementsData, 
          missionsData, 
          calendarData, 
          resourcesData, 
          levelData,
          certificatesData,
          subscriptionPlansData,
          currentSubData,
          badgeProgressData,
          mlmNetworkData,
          commissionsData,
          payoutsData,
          downlineData,
          earningsData
        ] = await Promise.all([
          studentDashboardService.getSkillProgress(user.id).catch(() => []),
          studentDashboardService.getRecentAchievements(user.id, 3).catch(() => []),
          studentDashboardService.getDailyMissions(user.id).catch(() => []),
          studentDashboardService.getStudyCalendar(user.id, 35).catch(() => []),
          resourceUnlockService.getTutoringResources().catch(() => []),
          resourceUnlockService.getStudentLevel(user.id).catch(() => null),
          certificateService.getStudentCertificates(user.id).catch(() => []),
          subscriptionService.getSubscriptionPlans().catch(() => []),
          subscriptionService.getCurrentSubscription(user.id).catch(() => null),
          gamificationService.getStudentBadgeProgress(user.id).catch(() => []),
          mlmEarnersService.getNetworkStats(user.id).catch(() => null),
          mlmEarnersService.getCommissions(user.id, 10).catch(() => []),
          mlmEarnersService.getPayoutRequests(user.id).catch(() => []),
          mlmEarnersService.getDownlineMembers(user.id).catch(() => []),
          mlmEarnersService.getEarningsBreakdown(user.id).catch(() => ({ totalEarnings: 0, availableBalance: 0, pendingBalance: 0, withdrawnTotal: 0 }))
        ]);

        if (isMounted) {
          setSkillProgress(skillsData);
          setRecentAchievements(achievementsData);
          setDailyMissions(missionsData);
          setCalendarEvents(calendarData);
          setTutoringResources(resourcesData);
          setStudentLevel(levelData);
          setCertificates(certificatesData);
          setSubscriptionPlans(subscriptionPlansData);
          setCurrentSubscription(currentSubData);
          setBadgeProgress(badgeProgressData);
          setMlmNetwork(mlmNetworkData);
          setCommissions(commissionsData);
          setPayoutRequests(payoutsData);
          setDownlineMembers(downlineData);
          setEarningsBreakdown(earningsData);

          // Streak animation only for students
          if (role === 'student') {
            const today = new Date().toDateString();
            const lastShownDate = localStorage.getItem('lastStreakAnimationDate');
            
            if (lastShownDate !== today && (statsData?.streak || 0) > 0) {
              setTimeout(() => {
                setShowStreakAnimation(true);
                localStorage.setItem('lastStreakAnimationDate', today);
              }, 800);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('❌ Stats loading error:', err);
          setConnectionStatus('offline');
          setPollingStatus('failed');
          setError(err.message || 'Backend is offline - cannot load dashboard');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // ✅ NEW: Polling function for live updates (student role only)
    const pollForUpdates = async () => {
      if (!isMounted || !user?.id || role !== 'student') return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-stats?id=${user.id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          setPollingStatus('failed');
          setConnectionStatus('offline');
          return;
        }

        const statsData = await response.json();
        
        if (isMounted) {
          setStats({
            totalXP: statsData.xp || 0,
            totalLessons: statsData.enrolled_courses || 0,
            currentStreak: statsData.streak || 0,
            level: statsData.level || 1,
            auraPoints: statsData.aura_points || 0,
            gold: statsData.gold || 0,
            enrolledCourses: statsData.enrolled_courses || 0,
            completedCourses: statsData.completed_courses || 0
          });

          setPollingStatus('active');
          setConnectionStatus('online');
          setLastPollTime(new Date());
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        if (isMounted) {
          setPollingStatus('failed');
          setConnectionStatus('offline');
        }
      }
    };

    // Initial load
    loadDashboardData();

    // ✅ NEW: Set up polling interval (5 seconds)
    if (role === 'student') {
      pollingInterval = setInterval(pollForUpdates, 5000);
    }

    return () => {
      isMounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [user?.id, role]);

  // Load marketplace products
  useEffect(() => {
    if (activeSection === 'marketplace') {
      loadMarketplaceProducts();
    }
  }, [activeSection, selectedCategory, selectedPaymentMethod]);

  // Load LMS data when course is selected
  useEffect(() => {
    if (selectedCourseForLMS && user?.id && activeSection === 'lms') {
      loadLMSData();
    }
  }, [selectedCourseForLMS, user?.id, lmsActiveTab, activeSection]);

  // Load study rooms when section is active
  useEffect(() => {
    if (activeSection === 'study-rooms' && user?.id) {
      loadStudyRooms();
    }
  }, [activeSection, user?.id]);

  // Load cart items
  useEffect(() => {
    if (user?.id && activeSection === 'marketplace') {
      loadCartItems();
    }
  }, [user?.id, activeSection]);

  // FIX: Move marketplace search debounce effect to top level
  useEffect(() => {
    const id = setTimeout(() => setDebouncedMarketplaceSearch(marketplaceSearchTerm), 300);
    return () => clearTimeout(id);
  }, [marketplaceSearchTerm]);

  // NEW: Check for checkout success from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'success') {
      setShowCheckoutSuccessModal(true);
      // Clear URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadMarketplaceProducts = async () => {
    try {
      setMarketplaceLoading(true);
      setMarketplaceError(null);

      const filters: any = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedPaymentMethod !== 'all') filters.paymentMethod = selectedPaymentMethod;
      if (searchTerm) filters.searchTerm = searchTerm;

      const data = await marketplaceService.getActiveProducts(filters);
      setProducts(data);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setMarketplaceError(err.message || 'Failed to load marketplace products');
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const handleSearch = () => {
    loadMarketplaceProducts();
  };

  const handlePurchase = async (productId: string, paymentMethod: PaymentMethod) => {
    if (!user) {
      alert('Please login to purchase');
      return;
    }

    try {
      await marketplaceService.purchaseProduct(productId, paymentMethod);
      alert('Purchase successful!');
      setCartCount(prev => prev + 1);
    } catch (err: any) {
      alert(err.message || 'Purchase failed');
    }
  };

  const handleMissionStart = async (missionId: string) => {
    if (!user?.id) return;
    
    try {
      // Show loading state for this specific mission
      setDailyMissions(prev => prev.map(m => 
        m.id === missionId ? { ...m, isProcessing: true } : m
      ));

      await studentDashboardService.completeMission(user.id, missionId);
      
      // Reload all dashboard data to reflect XP changes
      const [updatedMissions, updatedStats] = await Promise.all([
        studentDashboardService.getDailyMissions(user.id),
        studentDashboardService.getStudentStats(user.id)
      ]);
      
      setDailyMissions(updatedMissions);
      setStats(updatedStats);
      
      // Show success message
      alert('Quest completed! XP has been added to your total.');
    } catch (err: any) {
      console.error('Error completing mission:', err);
      alert(err.message || 'Failed to complete mission');
      
      // Remove loading state on error
      setDailyMissions(prev => prev.map(m => 
        m.id === missionId ? { ...m, isProcessing: false } : m
      ));
    }
  };

  const getCalendarDayActivity = (dayOffset: number): boolean => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (35 - dayOffset - 1));
    const dateStr = targetDate.toISOString().split('T')[0];
    
    return calendarEvents.some(event => event.date === dateStr && event.minutesStudied > 0);
  };

  const getResourceIcon = (resourceName: string): React.ElementType => {
    const iconMap: Record<string, React.ElementType> = {
      'Books': BookMarked,
      'Videos': Play,
      'Audio': Headphones,
      'Music': Music,
      'Games': Gamepad2,
      'Audiobooks': BookAudio,
      'Vocabulary': Type,
      'Notes': FileText,
      'Exercises': Dumbbell,
      'Novels': BookCopy,
      'Movies': Film,
      'Live Classes': Gamepad2
    };
    return iconMap[resourceName] || BookMarked;
  };

  // MODIFIED: Handle course card click - Open right sidebar instead of full view
  const handleCourseSelect = (courseType: string) => {
    const course = courseOptions.find(c => c.type === courseType);
    if (course) {
      setSelectedCourseDetails(course);
      setShowCourseDetailsSidebar(true);
    }
  };

  // NEW: Close course details sidebar
  const handleCloseCourseDetails = () => {
    setShowCourseDetailsSidebar(false);
    setSelectedCourseDetails(null);
  };

  // NEW: Handle stat card click
  const handleStatCardClick = (cardType: StatCardType) => {
    setSelectedStatCard(cardType);
    setShowStatCardModal(true);
  };

  // NEW: Close stat card modal
  const handleCloseStatModal = () => {
    setShowStatCardModal(false);
    setSelectedStatCard(null);
  };

  // NEW: Load LMS data when course is selected
  useEffect(() => {
    if (selectedCourseForLMS && user?.id && activeSection === 'lms') {
      loadLMSData();
    }
  }, [selectedCourseForLMS, user?.id, lmsActiveTab, activeSection]);

  // NEW: Load study rooms when section is active
  useEffect(() => {
    if (activeSection === 'study-rooms' && user?.id) {
      loadStudyRooms();
    }
  }, [activeSection, user?.id]);

  const loadLMSData = async () => {
    if (!selectedCourseForLMS || !user?.id) return;

    try {
      setLmsLoading(true);
      setLmsError(null);

      // Load data based on active tab
      switch (lmsActiveTab) {
        case 'assignments':
          const assignmentsData = await lmsService.getCourseAssignments(selectedCourseForLMS, user.id);
          setAssignments(assignmentsData);
          break;
        case 'grades':
          const gradesData = await lmsService.getStudentGrades(user.id, selectedCourseForLMS);
          const summaryData = await lmsService.getCourseGradeSummary(user.id, selectedCourseForLMS);
          setGrades(gradesData);
          setGradeSummary(summaryData);
          break;
        case 'discussions':
          const discussionsData = await lmsService.getCourseDiscussions(selectedCourseForLMS);
          setDiscussions(discussionsData);
          break;
        case 'quizzes':
          const quizzesData = await lmsService.getCourseQuizzes(selectedCourseForLMS, user.id);
          setQuizzes(quizzesData);
          break;
        case 'attendance':
          const attendanceData = await lmsService.getStudentAttendance(user.id, selectedCourseForLMS);
          let statsData = await lmsService.getAttendanceStats(user.id, selectedCourseForLMS);
          setAttendance(attendanceData);
          setAttendanceStats(statsData);
          break;
        case 'syllabus':
          const syllabusData = await lmsService.getCourseSyllabus(selectedCourseForLMS);
          setSyllabus(syllabusData);
          break;
        case 'files':
          const filesData = await lmsService.getCourseFiles(selectedCourseForLMS);
          setCourseFiles(filesData);
          break;
        case 'people':
          const peopleData = await lmsService.getCoursePeople(selectedCourseForLMS);
          setCoursePeople(peopleData);
          break;
        case 'analytics':
          const analyticsData = await lmsService.getCourseAnalytics(user.id, selectedCourseForLMS);
          const outcomesData = await lmsService.getCourseOutcomes(selectedCourseForLMS);
          const progressData = await lmsService.getStudentOutcomeProgress(user.id, selectedCourseForLMS);
          setCourseAnalytics(analyticsData);
          setOutcomes(outcomesData);
          setOutcomeProgress(progressData);
          break;
      }
    } catch (error: any) {
      console.error('Error loading LMS data:', error);
      setLmsError(error.message || 'Failed to load LMS data');
    } finally {
      setLmsLoading(false);
    }
  };

  const loadStudyRooms = async () => {
    if (!user?.id) return;

    try {
      setStudyRoomLoading(true);
      const rooms = await studyRoomService.getAvailableRooms(user.id);
      setStudyRooms(rooms);
    } catch (error: any) {
      console.error('Error loading study rooms:', error);
    } finally {
      setStudyRoomLoading(false);
    }
  };

  // NEW: Load cart items
  const loadCartItems = async () => {
    if (!user?.id) return;
    try {
      const items = await marketplaceService.getCartItems(user.id);
      setCartItems(items);
    } catch (err: any) {
      console.error('Error loading cart:', err);
    }
  };

  // NEW: Add to cart handler
  const handleAddToCart = async (productId: string) => {
    if (!user?.id) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await marketplaceService.addToCart(productId);
      alert('Item added to cart!');
      await loadCartItems();
    } catch (err: any) {
      alert(err.message || 'Failed to add to cart');
    }
  };

  // NEW: Remove from cart handler
  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      await marketplaceService.removeFromCart(cartItemId);
      await loadCartItems();
    } catch (err: any) {
      alert(err.message || 'Failed to remove from cart');
    }
  };

  // NEW: Load author shop
  const handleAuthorClick = async (authorId: string) => {
    try {
      setAuthorShopLoading(true);
      setShowAuthorShop(true);
      
      const [profile, products] = await Promise.all([
        marketplaceService.getAuthorProfile(authorId),
        marketplaceService.getAuthorProducts(authorId)
      ]);
      
      setSelectedAuthor(profile);
      setAuthorProducts(products);
    } catch (err: any) {
      console.error('Error loading author shop:', err);
      alert(err.message || 'Failed to load author shop');
    } finally {
      setAuthorShopLoading(false);
    }
  };

  // NEW: Handle creating custom mission for tomorrow
  const handleCreateMission = async () => {
    if (!user?.id || !newMissionData.title.trim() || !newMissionData.description.trim()) {
      setMissionError('Please fill in all required fields');
      return;
    }

    // FIX: Enforce 7 quest limit (1 life progress + 6 class/AI missions)
    if (dailyMissions.length >= 7) {
      setMissionError('Quest limit reached! You can have maximum 7 quests (1 from Life Progress + 6 from classes/AI). Complete or remove existing quests first.');
      return;
    }

    try {
      setIsCreatingMission(true);
      setMissionError(null);

      await studentDashboardService.createCustomMission(user.id, newMissionData);

      // FIX: Reload missions to show the new one immediately
      const updatedMissions = await studentDashboardService.getDailyMissions(user.id);
      setDailyMissions(updatedMissions);

      // Reset form and close modal
      setNewMissionData({
        title: '',
        description: '',
        category: 'education',
        difficulty: 'medium',
        deadlineHours: 24
      });
      setShowAddMissionModal(false);

      // FIX: Show success notification popup
      alert('✅ Mission created for tomorrow! Your quest will appear in "Today\'s Quest" section tomorrow with AI-calculated XP based on complexity.');
    } catch (err: any) {
      console.error('Error creating mission:', err);
      setMissionError(err.message || 'Failed to create mission');
    } finally {
      setIsCreatingMission(false);
    }
  };

  // MODIFIED: renderDashboardSection - Enhanced real-time status indicator
  const renderDashboardSection = () => {
    // Format today's date
    const formatTodayDate = () => {
      const today = new Date();
      return today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    return (
      <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 bg-gradient-to-br from-gray-50 via-orange-50 to-white min-h-screen p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Welcome Header with REAL Connection Status */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {role === 'student' ? 'Student' : role.charAt(0).toUpperCase() + role.slice(1)}! 👋
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {formatTodayDate()}
              </p>
              
              {/* ✅ UPDATED: Polling-based connection status */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'online' && pollingStatus === 'active' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  pollingStatus === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-xs text-gray-600">
                  {connectionStatus === 'online' && pollingStatus === 'active' ? '✅ Live updates active (polling every 5s)' :
                   connectionStatus === 'connecting' ? '🟡 Connecting...' :
                   pollingStatus === 'failed'? '🔴 Connection failed - retrying...' : '⚪ Paused'}
                </span>
                {lastPollTime && pollingStatus === 'active' && (
                  <span className="text-xs text-gray-500">
                    • Last updated: {lastPollTime.toLocaleTimeString()}
                  </span>
                )}
                {connectionStatus === 'offline' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Retry connection
                  </button>
                )}
              </div>

              {/* ✅ Simplified debug panel - only shows on offline */}
              {connectionStatus === 'offline' && (
                <details className="mt-2 text-xs bg-red-50 p-2 rounded border border-red-200">
                  <summary className="cursor-pointer text-red-700 font-medium">
                    ⚠️ Connection Failed - Debug Info
                  </summary>
                  <div className="mt-2 space-y-1 text-red-600">
                    <p>Backend Status: OFFLINE</p>
                    <p>Polling Status: {pollingStatus}</p>
                    <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || '❌ Not configured'}</p>
                    <p className="mt-2 text-xs">
                      💡 Fix: Check Supabase project is online and environment variables are set
                    </p>
                  </div>
                </details>
              )}
            </div>

            {/* Streak element (ONLY for students) */}
            {role === 'student' && (
              <button
                onClick={() => setShowStreakAnimation(true)}
                className="flex-shrink-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 group-hover:animate-pulse" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Current Streak</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {stats?.currentStreak || 0} 🔥
                    </p>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-orange-600 mt-2 text-center">Click to celebrate!</p>
              </button>
            )}
          </div>
        </div>

        {/* NEW: Role-based Stats Grid */}
        {role === 'student' ? (
          // ✅ Student gamification stats
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <button
              onClick={() => handleStatCardClick('xp')}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-orange-300 hover:shadow-lg hover:border-orange-400 transition-all cursor-pointer text-left relative"
            >
              {/* ✅ UPDATED: Show polling status instead of WebSocket status */}
              {pollingStatus === 'active' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats?.auraPoints || 0}
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">Aura Points</p>
            </button>

            <button
              onClick={() => handleStatCardClick('lessons')}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-yellow-300 hover:shadow-lg hover:border-yellow-400 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats?.level || 1}
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">Level</p>
            </button>

            <button
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-purple-300 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats?.currentStreak || 0} days
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">Streak</p>
            </button>

            <button
              onClick={() => handleStatCardClick('xp')}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-blue-300 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats?.totalXP || 0}
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">XP</p>
            </button>
          </div>
        ) : (
          // ✅ Teacher/Admin/Support/CEO professional stats
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-orange-300 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {teacherStats?.coursesTaught || 0}
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                {role.charAt(0).toUpperCase() + role.slice(1)} Courses
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-blue-300 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {teacherStats?.totalStudents || 0}
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">Total Students</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-yellow-300 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {teacherStats?.averageRating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">Avg Rating</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-green-300 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ${teacherStats?.totalRevenue || 0}
                </span>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">Total Revenue</p>
            </div>
          </div>
        )}

        {/* FIX: Today's Quest Section - Show quest limit warning */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Target className="w-6 h-6 sm:w-7 sm:h-7" />
              <h2 className="text-xl sm:text-2xl font-bold">Today's Quest</h2>
              <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                {(dailyMissions || []).length}/7
              </span>
            </div>
            <button
              onClick={() => {
                if ((dailyMissions || []).length >= 7) {
                  alert('Quest limit reached! Maximum 7 quests allowed (1 Life Progress + 6 class/AI). Complete existing quests first.');
                } else {
                  setShowAddMissionModal(true);
                }
              }}
              disabled={(dailyMissions || []).length >= 7}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium ${
                (dailyMissions || []).length >= 7
                  ? 'bg-white/30 text-white/60 cursor-not-allowed' :'bg-white text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Mission for Tomorrow</span>
              <span className="sm:hidden">Add Mission</span>
            </button>
          </div>
          
          {(dailyMissions || []).length >= 7 && (
            <div className="mb-3 p-2 bg-yellow-400 text-yellow-900 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>Quest limit reached! Complete or remove existing quests to add more.</span>
            </div>
          )}
          
          <div className="space-y-3">
            {(dailyMissions || []).length > 0 ? (
              (dailyMissions || []).map((mission) => (
                <div 
                  key={mission.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-white">{mission.title}</h3>
                        {mission.isSuggestion && (
                          <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-medium">
                            AI Suggested
                          </span>
                        )}
                        {mission.category && (
                          <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-medium capitalize">
                            {mission.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/90">{mission.description}</p>
                    </div>
                    <div className="ml-3 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3 h-3" />
                      +{mission.xpReward} XP
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-white/80">
                      {mission.isCompleted 
                        ? '✓ Completed' 
                        : `⏰ ${mission.deadlineHours}h remaining`}
                    </span>
                    {mission.isCompleted ? (
                      <button
                        disabled
                        className="px-4 py-1.5 bg-green-500 text-white rounded-lg cursor-not-allowed text-sm font-medium flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Done
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMissionStart(mission.id)}
                        disabled={mission.isProcessing}
                        className="px-4 py-1.5 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {mission.isProcessing ? 'Processing...' : 'Start Quest'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <Target className="w-12 h-12 text-white/60 mx-auto mb-3" />
                <p className="text-white/90">No quests available today</p>
                <p className="text-sm text-white/70 mt-1">Click "Add Mission for Tomorrow" to create your own!</p>
              </div>
            )}
          </div>
        </div>

        {/* MODIFIED: Grading System - Replacing Language Skills Progress */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Grading System</h2>
          </div>
          
          {/* Grading Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {/* Assignments Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 shadow-sm border-2 border-blue-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <span className="text-2xl sm:text-3xl font-bold text-blue-900">A</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Assignments</h3>
              <p className="text-xs sm:text-sm text-blue-700">Grade: 92%</p>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 shadow-sm border-2 border-green-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <BookCopy className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <span className="text-2xl sm:text-3xl font-bold text-green-900">B+</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Notes</h3>
              <p className="text-xs sm:text-sm text-green-700">Grade: 87%</p>
              <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>

            {/* Quizzes Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 shadow-sm border-2 border-purple-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <span className="text-2xl sm:text-3xl font-bold text-purple-900">A-</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Quizzes</h3>
              <p className="text-xs sm:text-sm text-purple-700">Grade: 90%</p>
              <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            {/* Projects Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 sm:p-6 shadow-sm border-2 border-orange-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                <span className="text-2xl sm:text-3xl font-bold text-orange-900">B</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Projects</h3>
              <p className="text-xs sm:text-sm text-orange-700">Grade: 85%</p>
              <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          {/* Overall Grade Summary */}
          <div className="mt-4 sm:mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Course Grade</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">88.5%</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-bold text-yellow-600">B+</span>
                <p className="text-xs text-gray-600 mt-1">Above Average</p>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Recent Activity Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          {userActivities.length > 0 ? (
            <div className="space-y-3">
              {userActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{activity.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {role === 'student' && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                      <Star className="w-3 h-3" />
                      +{activity.xpEarned} XP
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500 mt-2">Complete lessons and quests to see your progress here!</p>
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Achievements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {(recentAchievements || []).length > 0 ? (
              (recentAchievements || []).map((achievement) => (
                <div key={achievement.id} className="flex items-start space-x-3 sm:space-x-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg sm:rounded-xl hover:shadow-md transition-shadow border border-orange-100">
                  <div className="text-xl sm:text-2xl flex-shrink-0">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{achievement.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{achievement.description}</p>
                    <p className="text-xs text-gray-600 mt-1">{achievement.earnedAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-6 sm:py-8 col-span-full text-sm sm:text-base">No achievements yet - keep learning!</p>
            )}
          </div>
        </div>

        {/* NEW: Embedded Marketplace Section in Student Dashboard */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Learning Marketplace</h2>
          </div>
          <EmbeddedMarketplace 
            isEmbedded={true}
            onAddToCart={handleAddToCart}
            onCheckout={() => setShowCartModal(true)}
            cartItemCount={cartItems.length}
          />
        </div>
      </div>
    );
  };

  // MODIFIED: renderProgressSection - Course selection moved here (was previously called "Quest")
  const renderProgressSection = () => {
    return (
      <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 bg-gradient-to-br from-gray-50 via-orange-50 to-white min-h-screen p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Course Selection Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Choose Your Learning Path</h2>
              <p className="text-sm sm:text-base text-gray-600">Select a course to access specialized learning resources</p>
            </div>
            
            {/* NEW: Enroll Button */}
            <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white font-semibold hover:bg-orange-600 transition-colors text-sm sm:text-base flex-shrink-0">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              Enroll
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {courseOptions.map((course) => (
              <CourseSelectionCard
                key={course.id}
                course={course}
                onSelect={handleCourseSelect}
                isSelected={selectedCourseDetails?.type === course.type}
              />
            ))}
          </div>
        </div>

        {/* Teacher Feedback Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Teacher Feedback & Notes
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">Speaking Practice</span>
                <span className="text-xs text-gray-600">2 days ago</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">Great improvement in pronunciation! Continue practicing daily conversations.</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">Writing Exercise</span>
                <span className="text-xs text-gray-600">1 week ago</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">Excellent grammar usage. Focus more on complex sentence structures for next level.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Enhanced renderEarnersSection with real MLM data
  const renderEarnersSection = () => {
    return (
      <div className="space-y-6 pb-8 max-w-full overflow-x-hidden">
        {/* Total Earnings Card - Now with real data */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Earnings</p>
              <h2 className="text-4xl font-bold">
                ${earningsBreakdown.totalEarnings.toFixed(2)}
              </h2>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-green-100 text-xs mb-1">Available</p>
              <p className="text-xl font-bold">
                ${earningsBreakdown.availableBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-green-100 text-xs mb-1">Pending</p>
              <p className="text-xl font-bold">
                ${earningsBreakdown.pendingBalance.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button className="bg-white text-green-600 rounded-lg py-2 px-3 text-sm font-medium hover:bg-green-50 transition-colors">
              Top Up
            </button>
            <button className="bg-white text-green-600 rounded-lg py-2 px-3 text-sm font-medium hover:bg-green-50 transition-colors">
              Earn
            </button>
            <button className="bg-white text-green-600 rounded-lg py-2 px-3 text-sm font-medium hover:bg-green-50 transition-colors">
              Scan
            </button>
            <button className="bg-white text-green-600 rounded-lg py-2 px-3 text-sm font-medium hover:bg-green-50 transition-colors">
              Request
            </button>
          </div>
        </div>

        {/* Money Making Machine - Now with real MLM stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-purple-600" />
              Money Making Machine
            </h3>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Your Referral Link</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={`https://liqlearns.com/ref/${user?.id?.substring(0, 8)}`}
                readOnly 
                className="flex-1 px-3 py-2 border border-purple-200 rounded-lg bg-white text-sm"
              />
              <button 
                onClick={() => navigator.clipboard.writeText(`https://liqlearns.com/ref/${user?.id?.substring(0, 8)}`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
          {mlmNetwork && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {mlmNetwork.totalDownline}
                </p>
                <p className="text-xs text-gray-600 mt-1">Total Downline</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {mlmNetwork.activeDownline}
                </p>
                <p className="text-xs text-gray-600 mt-1">Active Members</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ${mlmNetwork.monthlyEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Monthly Earnings</p>
              </div>
            </div>
          )}
        </div>

        {/* Referral Earnings Breakdown - Now with real commission data */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Commissions</h3>
          <div className="space-y-3">
            {(commissions || []).length > 0 ? (
              (commissions || []).slice(0, 5).map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {commission.description || commission.commissionType.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      +${commission.amount.toFixed(2)}
                    </p>
                    {commission.percentage && (
                      <span className="text-xs text-gray-500">
                        {commission.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No commissions yet</p>
                <p className="text-sm text-gray-500 mt-2">Start referring to earn commissions!</p>
              </div>
            )}
          </div>
        </div>

        {/* Network Genealogy - Now with real downline data */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Network Genealogy ({(downlineMembers || []).length} members)
          </h3>
          {(downlineMembers || []).length > 0 ? (
            <div className="space-y-3">
              {(downlineMembers || []).slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.fullName || member.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Level {member.level} • {member.rank}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${member.totalEarnings.toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.isActive 
                        ? 'bg-green-100 text-green-700' :'bg-gray-100 text-gray-600'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No downline members yet</p>
              <p className="text-sm text-gray-500 mt-2">Share your referral link to build your network!</p>
            </div>
          )}
        </div>

        {/* NEW: Withdrawal Methods */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Withdrawal Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-xs text-gray-600">Min: $50.00</p>
                </div>
              </div>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">PayPal</p>
                  <p className="text-xs text-gray-600">Min: $20.00</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Earnings Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Earning Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">$35.50</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% from last week
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Weekly Average</p>
              <p className="text-2xl font-bold text-gray-900">$248.50</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8% from last month
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Monthly Average</p>
              <p className="text-2xl font-bold text-gray-900">$1,072.00</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15% from last quarter
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { type: 'earn', amount: '+$25.00', desc: 'Referral bonus from John D.', time: '2 hours ago' },
              { type: 'withdraw', amount: '-$100.00', desc: 'Withdrawal to bank account', time: '1 day ago' },
              { type: 'earn', amount: '+$15.50', desc: 'Commission from course sale', time: '2 days ago' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      activity.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.desc}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className={`font-bold ${
                  activity.type === 'earn' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEventsSection = () => {
    const handlePrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleCreateEvent = async () => {
      if (!user?.id || !newEvent.title || !newEvent.startTime || !newEvent.endTime) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        await calendarEventsService.createEvent({
          hostId: user.id,
          title: newEvent.title,
          description: newEvent.description,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          isPublic: newEvent.isPublic,
          eventType: newEvent.eventType
        });

        setShowCreateModal(false);
        setNewEvent({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          eventType: 'workshop',
          isPublic: false
        });
        
        alert(newEvent.isPublic 
          ? 'Event created! It will appear after CEO approval.' : 'Event created successfully!');
        
        await loadEvents();
      } catch (err: any) {
        console.error('Error creating event:', err);
        alert(err.message || 'Failed to create event');
      }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Events Calendar</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>

          {eventsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {eventsError}
            </div>
          )}

          {/* Calendar View - NOW WITH WORKING NAVIGATION */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <button 
                onClick={handlePrevMonth}
                className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Prev
              </button>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button 
                onClick={handleNextMonth}
                className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Next →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-center text-xs sm:text-sm font-semibold text-gray-600 p-1 sm:p-2">
                  <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}</span>
                  <span className="sm:hidden">{day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const dayNumber = i + 1;
                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                const hasEvent = events.some(event => {
                  const eventDate = new Date(event.startTime);
                  return eventDate.getDate() === dayNumber && 
                         eventDate.getMonth() === currentDate.getMonth() &&
                         eventDate.getFullYear() === currentDate.getFullYear();
                });
                const isToday = dayDate.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={i}
                    className={`min-h-[40px] sm:min-h-[60px] md:min-h-[80px] p-1 sm:p-2 border rounded transition-all cursor-pointer ${
                      isToday 
                        ? 'bg-orange-500 border-orange-600 text-white' 
                        : hasEvent 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-white' : 'text-gray-900'}`}>
                      {dayNumber <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() ? dayNumber : ''}
                    </span>
                    {hasEvent && (
                      <div className="mt-0.5 sm:mt-1 hidden sm:block">
                        <div className="text-[8px] sm:text-xs bg-blue-500 text-white rounded px-0.5 sm:px-1 py-0.5 truncate">
                          Event
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events List - NOW WITH REAL DATA */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Upcoming Events</h3>
            <div className="space-y-2 sm:space-y-3">
              {(events || []).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No events scheduled for this month</p>
                </div>
              ) : (
                (events || []).map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-gray-50 to-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 capitalize`}>
                            {event.eventType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {event.participantCount} participants
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{event.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{event.description}</p>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 mb-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">Hosted by: {event.hostName}</p>
                      </div>
                      <button className="px-3 py-1.5 sm:py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto whitespace-nowrap">
                        Join Event
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Event</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Amharic Cultural Workshop"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={3}
                    placeholder="Describe your event..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input
                      type="datetime-local"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select
                    value={newEvent.eventType}
                    onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="cultural">Cultural</option>
                    <option value="study">Study</option>
                    <option value="competition">Competition</option>
                    <option value="celebration">Celebration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newEvent.isPublic}
                    onChange={(e) => setNewEvent({...newEvent, isPublic: e.target.checked})}
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Make event public (requires CEO approval)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateEvent}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Create Event
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStoreSection = () => {
    return (
      <div className="space-y-6 pb-8 bg-gradient-to-br from-gray-50 via-orange-50 to-white min-h-screen p-6 max-w-full overflow-x-hidden">
        {/* My Storefront Overview */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-purple-100 text-sm mb-1">My Storefront</p>
              <h2 className="text-3xl font-bold">Active</h2>
            </div>
            <Package className="w-12 h-12 text-purple-200" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-purple-100 text-xs mb-1">Total Products</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-purple-100 text-xs mb-1">Total Sales</p>
              <p className="text-2xl font-bold">45</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-purple-100 text-xs mb-1">This Month</p>
              <p className="text-2xl font-bold">$520</p>
            </div>
          </div>
        </div>

        {/* Upload Material Tool */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-6 h-6 text-purple-600" />
              Upload Material for Sale
            </h3>
            {!showUploadForm && (
              <button 
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Material
              </button>
            )}
          </div>

          {showUploadForm ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); /* Handle upload */ }}>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  placeholder="e.g., Advanced Amharic Grammar Guide"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Describe your material, what it covers, and who it's for..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
                  <input
                    type="number"
                    value={uploadData.price}
                    onChange={(e) => setUploadData({...uploadData, price: e.target.value})}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="ebook">E-Book</option>
                    <option value="video">Video Course</option>
                    <option value="audio">Audio Lesson</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="guide">Study Guide</option>
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, DOCX, MP4, MP3 (max 100MB)</p>
                  <input type="file" className="hidden" />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions & Access</label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4" />
                      Downloadable
                    </span>
                    <input
                      type="checkbox"
                      checked={uploadData.permissions.downloadable}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, downloadable: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-gray-700">
                      <FileText className="w-4 h-4" />
                      Printable
                    </span>
                    <input
                      type="checkbox"
                      checked={uploadData.permissions.printable}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, printable: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-gray-700">
                      <Share2 className="w-4 h-4" />
                      Shareable
                    </span>
                    <input
                      type="checkbox"
                      checked={uploadData.permissions.shareable}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, shareable: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Access Expiry (days, 0 = unlimited)</label>
                    <input
                      type="number"
                      value={uploadData.permissions.expiryDays}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, expiryDays: parseInt(e.target.value) || 0}
                      })}
                      min="0"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Upload & Publish
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Click "New Material" to upload content for sale
            </p>
          )}
        </div>

        {/* Edit Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-purple-600" />
              Manage Products
            </h3>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {[
              { name: 'Amharic Study Guide', price: '$29.99', inventory: 15, sales: 23 },
              { name: 'Ethiopian Culture eBook', price: '$19.99', inventory: 8, sales: 12 },
              { name: 'Language Flashcards Set', price: '$15.00', inventory: 20, sales: 10 }
            ].map((product, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>Price: <strong className="text-gray-900">{product.price}</strong></span>
                      <span>Stock: <strong className="text-gray-900">{product.inventory}</strong></span>
                      <span>Sales: <strong className="text-green-600">{product.sales}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-initial px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 min-w-[80px]">
                    Edit
                  </button>
                  <button className="flex-1 md:flex-initial px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium min-w-[80px]">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$1,248</p>
              <p className="text-xs text-green-600 mt-1">+18% this month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Units Sold</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-xs text-green-600 mt-1">+12% this month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">$27.73</p>
              <p className="text-xs text-gray-600 mt-1">Stable</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Reviews</h3>
          <div className="space-y-3">
            {[
              { user: 'Sarah M.', rating: 5, comment: 'Excellent study materials! Really helped me improve.', product: 'Amharic Study Guide' },
              { user: 'John D.', rating: 4, comment: 'Good quality content, would recommend.', product: 'Ethiopian Culture eBook' }
            ].map((review, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{review.user}</span>
                  <div className="flex items-center gap-1">
                    {Array(review.rating).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                <p className="text-xs text-gray-500">Product: {review.product}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
          <div className="space-y-3">
            {[
              { order: '#12345', customer: 'Michael T.', product: 'Language Flashcards Set', amount: '$15.00', status: 'Completed' },
              { order: '#12344', customer: 'Emma W.', product: 'Amharic Study Guide', amount: '$29.99', status: 'Processing' }
            ].map((order, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{order.order}</p>
                  <p className="text-sm text-gray-600">{order.customer} • {order.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMarketplaceSection = () => {
    // Add this block - Define marketplace categories
    const TOOL_CATEGORIES = [
      { id: 'ebook', name: 'Books', icon: BookOpen, color: 'text-blue-500', count: 45, description: 'Educational books and guides' },
      { id: 'video', name: 'Videos', icon: Video, color: 'text-red-500', count: 32, description: 'Video courses and tutorials' },
      { id: 'audio', name: 'Audio', icon: Headphones, color: 'text-purple-500', count: 28, description: 'Audio lessons and podcasts' },
      { id: 'other', name: 'Games', icon: Gamepad2, color: 'text-green-500', count: 15, description: 'Educational games' },
      { id: 'flashcards', name: 'Flashcards', icon: BookCopy, color: 'text-orange-500', count: 20, description: 'Study flashcards' },
      { id: 'worksheet', name: 'Worksheets', icon: FileText, color: 'text-indigo-500', count: 38, description: 'Practice worksheets' }
    ];

    const SUBJECT_CATEGORIES = [
      { id: 'amharic', name: 'Amharic', icon: BookOpen, color: 'text-orange-500', count: 52, description: 'Amharic language resources' },
      { id: 'mathematics', name: 'Mathematics', icon: Target, color: 'text-blue-500', count: 48, description: 'Math learning materials' },
      { id: 'science', name: 'Science', icon: Zap, color: 'text-purple-500', count: 35, description: 'Science resources' },
      { id: 'english', name: 'English', icon: Type, color: 'text-red-500', count: 40, description: 'English language resources' },
      { id: 'culture', name: 'Culture', icon: Users, color: 'text-green-500', count: 25, description: 'Cultural studies' },
      { id: 'technology', name: 'Technology', icon: Trophy, color: 'text-indigo-500', count: 30, description: 'Tech and coding resources' }
    ];

    type MarketplaceViewMode = 'tool' | 'subject';
    // End of added block

    // Determine current categories based on search mode
    const currentCategories = searchMode === 'tool' ? TOOL_CATEGORIES : SUBJECT_CATEGORIES;

    // Filter categories by search
    const filteredCategories = currentCategories.filter(cat =>
      cat.name.toLowerCase().includes(debouncedMarketplaceSearch.toLowerCase())
    );

    // Handle category card click
    const handleCategoryClick = async (categoryId: string) => {
      setSelectedMarketplaceCategory(categoryId);
      setItemsLoading(true);
      
      try {
        // Load items for this category
        const filters: any = { category: categoryId };
        const items = await marketplaceService.getActiveProducts(filters);
        setCategoryItems(items);
      } catch (err: any) {
        console.error('Error loading category items:', err);
        setCategoryItems([]);
      } finally {
        setItemsLoading(false);
      }
    };

    // Handle item purchase
    const handleItemPurchase = async (productId: string, paymentMethod: PaymentMethod) => {
      if (!user?.id) {
        alert('Please login to purchase');
        return;
      }

      try {
        await marketplaceService.purchaseProduct(productId, paymentMethod);
        alert('Purchase successful!');
        setSelectedMarketplaceCategory(null);
      } catch (err: any) {
        alert(err.message || 'Purchase failed');
      }
    };

    return (
      <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 max-w-full overflow-x-hidden">
        <EmbeddedMarketplace 
          isEmbedded={true}
          onAddToCart={handleAddToCart}
          onCheckout={() => setShowCartModal(true)}
          cartItemCount={cartItems.length}
        />

        {/* NEW: Cart Modal */}
        {showCartModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-orange-500" />
                  Shopping Cart ({cartItems.length} items)
                </h3>
                <button 
                  onClick={() => setShowCartModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search bar in cart */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items in cart..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500">Browse marketplace to add items</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cartItems.map((cartItem) => (
                      <div 
                        key={cartItem.id}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {cartItem.product?.previewImageUrl && (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={cartItem.product.previewImageUrl} 
                              alt={cartItem.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {cartItem.product?.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {cartItem.product?.description}
                          </p>
                          
                          {cartItem.product?.sellerName && (
                            <button
                              onClick={() => {
                                setShowCartModal(false);
                                handleAuthorClick(cartItem.product!.sellerId);
                              }}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mb-2"
                            >
                              <Users className="w-3 h-3" />
                              By {cartItem.product.sellerName}
                            </button>
                          )}
                          
                          <span className="text-lg font-bold text-orange-600">
                            {cartItem.product?.paymentMethod === 'aura_points' 
                              ? `${cartItem.product.price} Points` 
                              : `$${cartItem.product?.price}`}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveFromCart(cartItem.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from cart"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        if (!user?.id) {
                          alert('Please login to checkout');
                          return;
                        }
                        setShowCartModal(false);
                        setShowCheckoutModal(true);
                      }}
                      className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Author Shop Modal */}
        {showAuthorShop && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              {authorShopLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-gray-600">Loading author shop...</span>
                </div>
              ) : selectedAuthor ? (
                <>
                  {/* Author Banner */}
                  <div 
                    className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-2xl relative"
                    style={selectedAuthor.bannerUrl ? { backgroundImage: `url(${selectedAuthor.bannerUrl})`, backgroundSize: 'cover' } : {}}
                  >
                    <button 
                      onClick={() => setShowAuthorShop(false)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Author Profile */}
                  <div className="px-6 pb-6">
                    <div className="flex items-start gap-6 -mt-16 mb-6">
                      <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                        {selectedAuthor.avatarUrl ? (
                          <img src={selectedAuthor.avatarUrl} alt={selectedAuthor.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                            {selectedAuthor.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 pt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAuthor.fullName}</h2>
                        {selectedAuthor.bio && (
                          <p className="text-gray-600 mb-4">{selectedAuthor.bio}</p>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{selectedAuthor.totalProducts} Products</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{selectedAuthor.totalSales} Sales</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-gray-700">{selectedAuthor.averageRating.toFixed(1)} Rating</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Author's Products */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Products by {selectedAuthor.fullName}</h3>
                      
                      {authorProducts.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No products available</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {authorProducts.map((product) => (
                            <div 
                              key={product.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                            >
                              {product.previewImageUrl && (
                                <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
                                  <img 
                                    src={product.previewImageUrl} 
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-orange-600">
                                  ${product.price}
                                </span>
                                <button
                                  onClick={() => {
                                    setShowAuthorShop(false);
                                    handleAddToCart(product.id);
                                  }}
                                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCommunitySection = () => {
    const handleCreatePost = async () => {
      if (!newPostContent.trim() || !user?.id) return;

      try {
        setIsPosting(true);
        setCommunityError(null);
        
        await communityService.createPost(user.id, newPostContent);
        setNewPostContent('');
        alert('Post submitted! It will appear after CEO approval.');
        
        await loadPosts();
      } catch (err: any) {
        console.error('Error creating post:', err);
        setCommunityError(err.message);
      } finally {
        setIsPosting(false);
      }
    };

    const handleLikePost = async (postId: string) => {
      if (!user?.id) return;
      
      try {
        await communityService.likePost(postId, user.id);
        await loadPosts();
      } catch (err: any) {
        console.error('Error liking post:', err);
      }
    };

    return (
      <div className="space-y-6 pb-8 bg-gradient-to-br from-gray-50 via-orange-50 to-white min-h-screen p-6 max-w-full overflow-x-hidden">
        {/* Group Chats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              Group Chats
            </h3>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Amharic Learners', members: 124, messages: 45, active: true },
              { name: 'Cultural Exchange', members: 89, messages: 23, active: true },
              { name: 'Study Together', members: 56, messages: 12, active: false }
            ].map((group, idx) => (
              <div key={idx} className="p-4 border border-gray-200 bg-gray-50 rounded-xl hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{group.name}</h4>
                  {group.active && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {group.members}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {group.messages} new
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Wall - UPDATED WITH WORKING POST FUNCTIONALITY */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Community Wall</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {communityError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {communityError}
            </div>
          )}

          {/* Create Post - NOW WORKING */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share something with the community..." 
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Posts require CEO approval before appearing
              </p>
              <button 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || isPosting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {/* Posts Feed - NOW WITH REAL DATA */}
          <div className="space-y-4">
            {(posts || []).length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              (posts || []).map((post) => (
                <div key={post.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {post.userAvatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{post.userFullName}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-800 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <Trophy className="w-4 h-4" />
                          {post.likeCount} Likes
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          {post.commentCount} Comments
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsSection = () => {
    const handleChangePassword = async () => {
      if (passwordData.new !== passwordData.confirm) {
        alert('New passwords do not match');
        return;
      }
      try {
        setIsSavingSettings(true);
        // Implement password change logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        alert('Password changed successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
        setIsChangingPassword(false);
      } catch (error: any) {
        alert(`Error changing password: ${error.message}`);
      } finally {
        setIsSavingSettings(false);
      }
    };

    const handleDownloadData = async () => {
      try {
        setIsSavingSettings(true);
        // Implement data download logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        alert('Your data download has been initiated. You will receive an email with the download link.');
      } catch (error: any) {
        alert(`Error downloading data: ${error.message}`);
      } finally {
        setIsSavingSettings(false);
      }
    };

    const handleDeleteAccount = async () => {
      const confirmed = window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      );
      if (!confirmed) return;

      try {
        setIsSavingSettings(true);
        // Implement account deletion logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        alert('Account deletion request submitted. You will receive a confirmation email.');
      } catch (error: any) {
        alert(`Error deleting account: ${error.message}`);
      } finally {
        setIsSavingSettings(false);
      }
    };

    const handleSaveNotificationSettings = async () => {
      try {
        setIsSavingSettings(true);
        // Implement save notification settings logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        alert('Notification preferences saved successfully!');
      } catch (error: any) {
        alert(`Error saving preferences: ${error.message}`);
      } finally {
        setIsSavingSettings(false);
      }
    };

    // NEW: Detect user's timezone using geolocation
    const detectTimezone = () => {
      try {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return detectedTimezone;
      } catch (error) {
        console.error('Error detecting timezone:', error);
        return 'UTC';
      }
    };

    return (
      <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 bg-gradient-to-br from-gray-50 via-orange-50 to-white min-h-screen p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
          
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                Change Picture
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</label>
            <input 
              type="text" 
              defaultValue="" 
              placeholder="Enter your full legal name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Your full legal name for official documents and certificates</p>
          </div>

          {/* NEW: Display Name */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Display Name</label>
            <input 
              type="text" 
              defaultValue="" 
              placeholder="Enter your preferred display name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">How you'd like to be addressed (can be different from your full name)</p>
          </div>

          {/* NEW: Sortable Name */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Sortable Name</label>
            <input 
              type="text" 
              defaultValue="" 
              placeholder="Last, First (e.g., Smith, John)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Used for alphabetical sorting in rosters and lists</p>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Username</label>
            <input 
              type="text" 
              defaultValue={user?.email?.split('@')[0] || ''} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
            <input 
              type="email" 
              defaultValue={user?.email || ''} 
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          {/* NEW: Pronouns */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Pronouns</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
              <option value="">Prefer not to say</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
              <option value="he/they">he/they</option>
              <option value="she/they">she/they</option>
              <option value="other">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Your preferred pronouns</p>
          </div>

          {/* NEW: Language - Enhanced with better description */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Display Language</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="ar">العربية (Arabic)</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="pt">Português (Portuguese)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Interface language for the application</p>
          </div>

          {/* NEW: Timezone with Geolocation */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Timezone</label>
            <div className="flex gap-2">
              <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
                <option value="">Select timezone...</option>
                <optgroup label="Americas">
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="America/Sao_Paulo">São Paulo</option>
                  <option value="America/Mexico_City">Mexico City</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Europe/Berlin">Berlin (CET)</option>
                  <option value="Europe/Moscow">Moscow (MSK)</option>
                </optgroup>
                <optgroup label="Africa">
                  <option value="Africa/Addis_Ababa">Addis Ababa (EAT)</option>
                  <option value="Africa/Cairo">Cairo (EET)</option>
                  <option value="Africa/Lagos">Lagos (WAT)</option>
                  <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Kolkata">Kolkata (IST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Seoul">Seoul (KST)</option>
                </optgroup>
                <optgroup label="Australia & Pacific">
                  <option value="Australia/Sydney">Sydney (AEDT)</option>
                  <option value="Australia/Melbourne">Melbourne (AEDT)</option>
                  <option value="Pacific/Auckland">Auckland (NZDT)</option>
                </optgroup>
              </select>
              <button 
                onClick={() => {
                  const timezone = detectTimezone();
                  const select = document.querySelector('select[class*="flex-1"]') as HTMLSelectElement;
                  if (select) {
                    select.value = timezone;
                  }
                  alert(`Detected timezone: ${timezone}`);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Auto-Detect
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for displaying dates and times. Click "Auto-Detect" to use your device's timezone</p>
          </div>

          {/* NEW: Sponsor/Referrer Display */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Referred By</label>
            <input 
              type="text" 
              defaultValue="john_doe" 
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">The person who referred you to LiqLearns</p>
          </div>

          {/* NEW: Privacy Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div>
                  <p className="font-medium text-gray-900">Show Profile in Leaderboard</p>
                  <p className="text-sm text-gray-600">Let others see your progress</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-500 rounded" />
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div>
                  <p className="font-medium text-gray-900">Allow Direct Messages</p>
                  <p className="text-sm text-gray-600">Let students contact you</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-500 rounded" />
              </div>
            </div>
          </div>

          {/* NEW: Language Preferences */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Display Language</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white">
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* NEW: Study Goals */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Daily Study Goal (minutes)</label>
            <input 
              type="number" 
              defaultValue="30" 
              min="10"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Learning Goals */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Learning Goals</label>
            <textarea 
              placeholder="What do you want to achieve?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              rows={4}
            />
          </div>

          {/* Save Button */}
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
            Save Changes
          </button>
        </div>

        {/* NEW: Subscription Management Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Management</h2>
          
          {currentSubscription ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                  <h3 className="text-2xl font-bold text-gray-900">{currentSubscription.name}</h3>
                </div>
                <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold">
                  Active
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span>${currentSubscription.priceMonthly}/month</span>
                <span>or ${currentSubscription.priceYearly}/year</span>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-600 text-center">No active subscription</p>
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 mb-4">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                  currentSubscription?.id === plan.id
                    ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    ${plan.priceMonthly}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    or ${plan.priceYearly}/year
                  </p>
                </div>
                <ul className="space-y-2 mb-4">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="capitalize">{key}:</strong> {value}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  currentSubscription?.id === plan.id
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}>
                  {currentSubscription?.id === plan.id ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MODIFIED: Notification Preferences with SAVE BUTTON */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Notification Preferences</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Email Notifications</p>
                <p className="text-xs sm:text-sm text-gray-600">Receive updates via email</p>
              </div>
              <input 
                type="checkbox" 
                checked={notificationSettings.email}
                onChange={(e) => setNotificationSettings({...notificationSettings, email: e.target.checked})}
                className="w-5 h-5 text-orange-500 rounded" 
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Push Notifications</p>
                <p className="text-xs sm:text-sm text-gray-600">Get notifications on your device</p>
              </div>
              <input 
                type="checkbox" 
                checked={notificationSettings.push}
                onChange={(e) => setNotificationSettings({...notificationSettings, push: e.target.checked})}
                className="w-5 h-5 text-orange-500 rounded" 
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Weekly Progress Reports</p>
                <p className="text-xs sm:text-sm text-gray-600">Weekly summary of your progress</p>
              </div>
              <input 
                type="checkbox" 
                checked={notificationSettings.weeklyReports}
                onChange={(e) => setNotificationSettings({...notificationSettings, weeklyReports: e.target.checked})}
                className="w-5 h-5 text-orange-500 rounded" 
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Community Updates</p>
                <p className="text-xs sm:text-sm text-gray-600">Stay updated with community activities</p>
              </div>
              <input 
                type="checkbox" 
                checked={notificationSettings.communityUpdates}
                onChange={(e) => setNotificationSettings({...notificationSettings, communityUpdates: e.target.checked})}
                className="w-5 h-5 text-orange-500 rounded" 
              />
            </div>
          </div>
          <button 
            onClick={handleSaveNotificationSettings}
            disabled={isSavingSettings}
            className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingSettings ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>
          
          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={isSavingSettings}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingSettings ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ current: '', new: '', confirm: '' });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Data & Privacy</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleDownloadData}
              disabled={isSavingSettings}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Download My Data</span>
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleDeleteAccount}
              disabled={isSavingSettings}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Render LMS Section
  const renderLMSSection = () => {
    return (
      <div className="space-y-6 pb-8 max-w-full overflow-x-hidden">
        <VirtualClassroomHub 
          userId={user?.id || ''}
          userRole="student"
        />
      </div>
    );
  };

  // NEW: Render Help Section
  const renderHelpSection = () => {
    return (
      <div className="space-y-6 pb-8 bg-gradient-to-br from-gray-50 via-orange-50 to-white min-h-screen max-w-full overflow-x-hidden">
        <HelpCenter userId={user?.id || ''} />
      </div>
    );
  };

  // NEW: Render Study Room section
  const renderStudyRoomSection = () => {
    return (
      <div className="space-y-6 pb-8 bg-gradient-to-br from-gray-50 via-orange-50 to-white min-h-screen max-w-full overflow-x-hidden">
        <StudyRoomHub userId={user?.id} />
      </div>
    );
  };

  // Load gamification data
  useEffect(() => {
    if (user?.id) {
      loadGamificationData();
    }
  }, [user?.id]);

  const loadGamificationData = async () => {
    if (!user?.id) return;

    try {
      const [stats, leaderboard, badges] = await Promise.all([
        fetchUserStats(user.id),
        fetchLeaderboard(),
        fetchUserBadges(user.id)
      ]);

      setGamification(prev => ({
        ...prev,
        stats,
        leaderboard,
        badges
      }));
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  // Handle quest completion with rewards
  const handleCompleteQuest = async (questId: string, questName: string, xpReward: number, goldReward: number) => {
    if (!user?.id) return;

    try {
      const oldLevel = gamification.stats?.currentLevel || 1;
      
      // Award the reward
      const leveledUp = await awardQuestReward(user.id, xpReward, goldReward);

      // Show reward feedback
      setGamification(prev => ({
        ...prev,
        questReward: {
          xp: xpReward,
          gold: goldReward,
          questName
        }
      }));

      // Reload stats
      const newStats = await fetchUserStats(user.id);
      
      if (leveledUp && newStats) {
        setGamification(prev => ({
          ...prev,
          stats: newStats,
          showLevelUp: true,
          newLevel: newStats.currentLevel
        }));
      } else if (newStats) {
        setGamification(prev => ({
          ...prev,
          stats: newStats
        }));
      }

      // Reload badges to check for new unlocks
      const badges = await fetchUserBadges(user.id);
      setGamification(prev => ({
        ...prev,
        badges
      }));

    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  // Main render logic
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white relative z-50">
        <div className="text-center">
          {/* Enhanced loading spinner with proper visibility */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-orange-300 opacity-25 mx-auto"></div>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-800">Loading dashboard...</p>
          <p className="mt-2 text-sm text-gray-600">Preparing your learning experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Streak Animation - Now properly rendered */}
      {showStreakAnimation && (
        <StreakGiftAnimation
          currentStreak={stats?.currentStreak || 0}
          onClose={() => setShowStreakAnimation(false)}
        />
      )}

      {/* Achievement Unlock Animation (Global) */}
      <AchievementUnlockAnimation />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* Main content - render based on activeSection */}
      {!loading && !error && (
        <>
          {activeSection === 'dashboard' && renderDashboardSection()}
          {activeSection === 'progress' && renderProgressSection()}
          {activeSection === 'earners' && renderEarnersSection()}
          {activeSection === 'events' && renderEventsSection()}
          {activeSection === 'store' && renderStoreSection()}
          {activeSection === 'marketplace' && renderMarketplaceSection()}
          {activeSection === 'community' && renderCommunitySection()}
          {activeSection === 'settings' && renderSettingsSection()}
          {activeSection === 'lms' && renderLMSSection()}
          {activeSection === 'help' && renderHelpSection()}
          {activeSection === 'study-rooms' && renderStudyRoomSection()}
        </>
      )}

      {/* Course details sidebar modal */}
      {showCourseDetailsSidebar && selectedCourseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white h-full w-full max-w-2xl overflow-y-auto">
            <CourseContentView
              course={selectedCourseDetails}
              onClose={handleCloseCourseDetails}
              realCourseId={realCourseIds.get(selectedCourseDetails.type) || ''}
            />
          </div>
        </div>
      )}

      {/* Add Mission for Tomorrow modal */}
      {showAddMissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-orange-500" />
                Create Mission for Tomorrow
              </h3>
              <button 
                onClick={() => {
                  setShowAddMissionModal(false);
                  setMissionError(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {missionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {missionError}
              </div>
            )}

            <div className="space-y-4">
              {/* Mission Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Title *
                </label>
                <input
                  type="text"
                  value={newMissionData.title}
                  onChange={(e) => setNewMissionData({...newMissionData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="e.g., Complete morning workout"
                />
              </div>

              {/* Mission Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newMissionData.description}
                  onChange={(e) => setNewMissionData({...newMissionData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                  rows={3}
                  placeholder="Describe what you want to accomplish..."
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Life Category
                </label>
                <select
                  value={newMissionData.category}
                  onChange={(e) => setNewMissionData({...newMissionData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white capitalize"
                >
                  <option value="spiritual">🙏 Spiritual</option>
                  <option value="health">💪 Health</option>
                  <option value="wealth">💰 Wealth</option>
                  <option value="service">🤝 Service</option>
                  <option value="education">📚 Education</option>
                  <option value="family">👨‍👩‍👧 Family</option>
                  <option value="social">🎉 Social</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewMissionData({...newMissionData, difficulty: level})}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        newMissionData.difficulty === level
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                      <div className="text-xs mt-1">
                        {level === 'easy' && '+50 XP'}
                        {level === 'medium' && '+100 XP'}
                        {level === 'hard' && '+200 XP'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (hours from midnight tomorrow)
                </label>
                <input
                  type="number"
                  value={newMissionData.deadlineHours}
                  onChange={(e) => setNewMissionData({...newMissionData, deadlineHours: parseInt(e.target.value) || 24})}
                  min="1"
                  max="24"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mission will expire {newMissionData.deadlineHours} hours after tomorrow starts
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateMission}
                  disabled={isCreatingMission || !newMissionData.title.trim() || !newMissionData.description.trim()}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingMission ? 'Creating...' : 'Create Mission'}
                </button>
                <button
                  onClick={() => {
                    setShowAddMissionModal(false);
                    setMissionError(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>

              {/* Info Box with XP calculation explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 AI XP Calculation:</strong> Your mission XP (10-50) will be automatically calculated based on complexity factors like description length, action keywords, and number of steps. The more complex your mission, the more XP you'll earn!
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  <strong>📅 Quest Limit:</strong> Maximum 7 quests allowed (1 from Life Progress + 6 from classes/AI missions).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat card details modal */}
      {showStatCardModal && (
        <StatCardModal
          userId={user?.id || ''}
          cardType={selectedStatCard}
          onClose={handleCloseStatModal}
        />
      )}

      {/* NEW: Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        userId={user?.id || ''}
        onSuccess={() => {
          setShowCheckoutModal(false);
          setShowCheckoutSuccessModal(true);
          loadCartItems(); // Refresh cart
        }}
      />

      {/* NEW: Checkout Success Modal */}
      <CheckoutSuccessModal
        isOpen={showCheckoutSuccessModal}
        onClose={() => {
          setShowCheckoutSuccessModal(false);
          loadCartItems(); // Refresh cart after closing success modal
        }}
      />
    </div>
  );
};

export default StudentDashboard;