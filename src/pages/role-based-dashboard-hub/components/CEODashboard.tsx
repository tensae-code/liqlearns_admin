import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, BarChart3, Globe, Crown, Target, Save, Edit, CheckCircle, ExternalLink, Youtube, AlertTriangle, Plus, Trash2, Eye, EyeOff, Video, FileText, Upload, X, User, Building2, LineChart, Activity, BookOpen, Tag, Clock, Star, Award } from 'lucide-react';
import { 
  fetchCEODashboardStats, 
  fetchPlatformStatistics, 
  updatePlatformStatistics,
  fetchAllNews,
  createNewsItem,
  updateNewsItem,
  deleteNewsItem,
  fetchAdminActionLogs,
  fetchWeeklyPaymentDistribution,
  CEODashboardStats,
  PlatformStatistics,
  NewsItem,
  AdminActionLog,
  fetchCourses
} from '../../../services/ceoDashboardService';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabaseClient';

interface CEODashboardProps {
  activeSection?: string;
}

const CEODashboard: React.FC<CEODashboardProps> = ({ activeSection = 'dashboard' }) => {
  const { user, userProfile, updateProfile } = useAuth();
  
  // Dashboard Stats State
  const [stats, setStats] = useState<CEODashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTutors: 0,
    totalAdmins: 0,
    totalRevenue: 0,
    weeklyNewUsers: 0,
    activeCourses: 0,
    pendingApprovals: 0,
  });

  // Platform Statistics State
  const [platformStats, setPlatformStats] = useState<PlatformStatistics>({
    totalLearners: 0,
    successRate: 0,
    completionRate: 0,
    happyStudents: 0,
    demoVideoUrl: '',
  });

  // Video URL Management State
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [videoSaveStatus, setVideoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // News Management State
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    category: 'announcement',
    mediaType: '',
    mediaUrl: '',
    isActive: true,
    isFeatured: false,
    scheduledAt: '',
  });

  // Admin Action Logs State
  const [adminLogs, setAdminLogs] = useState<AdminActionLog[]>([]);
  const [showAdminMonitor, setShowAdminMonitor] = useState(false);

  // Weekly Payment Distribution State
  const [weeklyPayments, setWeeklyPayments] = useState<{ week: string; amount: number }[]>([]);

  // Loading State
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  // Course Management State
  const [courses, setCourses] = useState<any[]>([]);
  const [giveawayCourses, setGiveawayCourses] = useState<any[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    courseType: 'language',
    difficultyLevel: 'medium',
    language: 'English',
    lessonType: 'interactive',
    estimatedDurationMinutes: 60,
    culturalTheme: '',
    xpReward: 100,
    isActive: true
  });

  // Load Dashboard Data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashStats, platStats, news, payments, logs, allCourses] = await Promise.all([
        fetchCEODashboardStats(),
        fetchPlatformStatistics(),
        fetchAllNews(),
        fetchWeeklyPaymentDistribution(),
        fetchAdminActionLogs(20),
        fetchCourses()
      ]);

      setStats(dashStats);
      setPlatformStats(platStats);
      setTempVideoUrl(platStats.demoVideoUrl);
      setNewsList(news);
      setWeeklyPayments(payments);
      setAdminLogs(logs);
      
      // Separate regular courses from giveaway courses
      const regularCourses = allCourses.filter((c: any) => !c.title.includes('Giveaway'));
      const giveaways = allCourses.filter((c: any) => c.title.includes('Giveaway'));
      setCourses(regularCourses);
      setGiveawayCourses(giveaways);
    } catch (error) {
      console.error('Error loading CEO dashboard:', error);
      alert('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Course Management Functions
  const handleCreateCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseForm.title,
          description: courseForm.description,
          course_type: courseForm.courseType,
          difficulty_level: courseForm.difficultyLevel,
          language: courseForm.language,
          lesson_type: courseForm.lessonType,
          estimated_duration_minutes: courseForm.estimatedDurationMinutes,
          cultural_theme: courseForm.culturalTheme,
          xp_reward: courseForm.xpReward,
          is_active: courseForm.isActive
        })
        .select()
        .single();

      if (error) throw error;

      setCourses(prev => [data, ...prev]);
      setShowCourseModal(false);
      resetCourseForm();
      alert('Course created successfully!');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: false })
        .eq('id', courseId);

      if (error) throw error;

      setCourses(prev => prev.filter(c => c.id !== courseId));
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      courseType: 'language',
      difficultyLevel: 'medium',
      language: 'English',
      lessonType: 'interactive',
      estimatedDurationMinutes: 60,
      culturalTheme: '',
      xpReward: 100,
      isActive: true
    });
  };

  // Video URL Management
  const handleSaveVideoUrl = async () => {
    if (!tempVideoUrl.trim()) {
      setVideoSaveStatus('error');
      alert('Please enter a valid YouTube URL');
      return;
    }

    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubePattern.test(tempVideoUrl)) {
      setVideoSaveStatus('error');
      alert('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }

    setVideoSaveStatus('saving');
    try {
      await updatePlatformStatistics({ demoVideoUrl: tempVideoUrl });
      setPlatformStats(prev => ({ ...prev, demoVideoUrl: tempVideoUrl }));
      setVideoSaveStatus('saved');
      setIsEditingVideo(false);
      setTimeout(() => setVideoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving video URL:', error);
      setVideoSaveStatus('error');
      alert('Failed to save video URL. Please try again.');
    }
  };

  const handleCancelEditVideo = () => {
    setTempVideoUrl(platformStats.demoVideoUrl);
    setIsEditingVideo(false);
    setVideoSaveStatus('idle');
  };

  // Platform Statistics Management
  const handleUpdatePlatformStats = async () => {
    setStatsLoading(true);
    try {
      await updatePlatformStatistics(platformStats);
      alert('Platform statistics updated successfully!');
    } catch (error) {
      console.error('Error updating platform stats:', error);
      alert('Failed to update platform statistics. Please try again.');
    } finally {
      setStatsLoading(false);
    }
  };

  // News Management Functions
  const handleCreateNews = async () => {
    try {
      const newNews = await createNewsItem({
        ...newsForm,
        publishedAt: new Date().toISOString(),
        createdBy: '', // Will be set by service from auth user
      });
      setNewsList(prev => [newNews, ...prev]);
      resetNewsForm();
      setIsCreatingNews(false);
      alert('News item created successfully!');
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Failed to create news item. Please try again.');
    }
  };

  const handleUpdateNews = async (id: string) => {
    try {
      await updateNewsItem(id, newsForm);
      setNewsList(prev => prev.map(news => 
        news.id === id ? { ...news, ...newsForm } : news
      ));
      resetNewsForm();
      setEditingNewsId(null);
      alert('News item updated successfully!');
    } catch (error) {
      console.error('Error updating news:', error);
      alert('Failed to update news item. Please try again.');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;
    
    try {
      await deleteNewsItem(id);
      setNewsList(prev => prev.filter(news => news.id !== id));
      alert('News item deleted successfully!');
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Failed to delete news item. Please try again.');
    }
  };

  const startEditingNews = (news: NewsItem) => {
    setNewsForm({
      title: news.title,
      content: news.content,
      category: news.category,
      mediaType: news.mediaType || '',
      mediaUrl: news.mediaUrl || '',
      isActive: news.isActive,
      isFeatured: news.isFeatured,
      scheduledAt: news.scheduledAt || '',
    });
    setEditingNewsId(news.id);
    setIsCreatingNews(true);
  };

  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      content: '',
      category: 'announcement',
      mediaType: '',
      mediaUrl: '',
      isActive: true,
      isFeatured: false,
      scheduledAt: '',
    });
    setEditingNewsId(null);
  };

  // Add Course Management Section
  const renderCourseManagement = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Course Management</h1>
            </div>
            <p className="text-blue-100">Create and manage platform courses</p>
          </div>
          <button
            onClick={() => setShowCourseModal(true)}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Courses</h3>
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
          <p className="text-sm text-gray-600 mt-2">Active learning programs</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Giveaway Courses</h3>
            <Tag className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{giveawayCourses.length}</div>
          <p className="text-sm text-gray-600 mt-2">Free promotional courses</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</div>
          <p className="text-sm text-gray-600 mt-2">Enrolled learners</p>
        </div>
      </div>

      {/* Regular Courses */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Active Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No courses yet. Create your first course!</p>
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.estimated_duration_minutes} min
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {course.difficulty_level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      {course.xp_reward} XP
                    </span>
                    <span className="text-gray-600 capitalize">{course.course_type}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Giveaway Courses */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Tag className="w-6 h-6 text-green-600 mr-2" />
              Promotional Giveaway Courses
            </h2>
            <p className="text-sm text-gray-600 mt-1">Free courses for platform growth and user acquisition</p>
          </div>
          <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">
            {giveawayCourses.length} FREE Courses
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {giveawayCourses.map(course => (
            <div key={course.id} className="bg-white border-2 border-green-300 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                  FREE
                </span>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">{course.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {course.estimated_duration_minutes} min
                </span>
                <span className="flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {course.xp_reward} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Creation Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Create New Course</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  placeholder="Enter course title"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  placeholder="Course description"
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
                  <select
                    value={courseForm.courseType}
                    onChange={(e) => setCourseForm({...courseForm, courseType: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="language">Language</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={courseForm.difficultyLevel}
                    onChange={(e) => setCourseForm({...courseForm, difficultyLevel: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={courseForm.estimatedDurationMinutes}
                    onChange={(e) => setCourseForm({...courseForm, estimatedDurationMinutes: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                  <input
                    type="number"
                    value={courseForm.xpReward}
                    onChange={(e) => setCourseForm({...courseForm, xpReward: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cultural Theme</label>
                <input
                  type="text"
                  value={courseForm.culturalTheme}
                  onChange={(e) => setCourseForm({...courseForm, culturalTheme: e.target.value})}
                  placeholder="e.g., Professional, Modern, Traditional"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={courseForm.isActive}
                  onChange={(e) => setCourseForm({...courseForm, isActive: e.target.checked})}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Active (visible to users)</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={handleCreateCourse}
                disabled={!courseForm.title || !courseForm.description}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Create Course
              </button>
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  resetCourseForm();
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main Dashboard Content (existing content)
  const renderMainDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Executive Dashboard 👑</h1>
            <p className="text-yellow-100 mb-4">Strategic insights and company performance overview</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">${(stats.totalRevenue / 1000).toFixed(1)}K Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">{stats.totalUsers}+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">+{stats.weeklyNewUsers} This Week</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-sm text-gray-600 mt-2">
            <span className="text-green-600">↑ {stats.weeklyNewUsers}</span> new this week
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Students</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</div>
          <p className="text-sm text-gray-600 mt-2">Active learners</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tutors</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalTutors.toLocaleString()}</div>
          <p className="text-sm text-gray-600 mt-2">Teaching staff</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(1)}K</div>
          <p className="text-sm text-gray-600 mt-2">Total platform revenue</p>
        </div>
      </div>

      {/* Demo Video URL Management */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Youtube className="w-6 h-6 text-orange-500 mr-2" />
              Landing Page Demo Video
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage the demo video URL displayed on the landing page
            </p>
          </div>
          {!isEditingVideo && (
            <button
              onClick={() => {
                setIsEditingVideo(true);
                setTempVideoUrl(platformStats.demoVideoUrl);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit URL</span>
            </button>
          )}
        </div>

        {isEditingVideo ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={tempVideoUrl}
                onChange={(e) => setTempVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveVideoUrl}
                disabled={videoSaveStatus === 'saving'}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {videoSaveStatus === 'saving' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : videoSaveStatus === 'saved' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save URL</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEditVideo}
                disabled={videoSaveStatus === 'saving'}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Current Demo Video URL:</p>
                <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border border-gray-300 break-all">
                  {platformStats.demoVideoUrl}
                </p>
              </div>
              <a
                href={platformStats.demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                aria-label="Open video in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Platform Statistics Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">Landing Page Statistics</h2>
          </div>
          <button
            onClick={handleUpdatePlatformStats}
            disabled={statsLoading}
            className="px-4 py-2 bg-yellow-50 text-yellow-600 font-medium rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {statsLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Stats</span>
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Learners
            </label>
            <input
              type="number"
              value={platformStats.totalLearners}
              onChange={(e) => setPlatformStats({...platformStats, totalLearners: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Success Rate (%)
            </label>
            <input
              type="number"
              value={platformStats.successRate}
              onChange={(e) => setPlatformStats({...platformStats, successRate: parseFloat(e.target.value) || 0})}
              max="100"
              className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Rate (%)
            </label>
            <input
              type="number"
              value={platformStats.completionRate}
              onChange={(e) => setPlatformStats({...platformStats, completionRate: parseFloat(e.target.value) || 0})}
              max="100"
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Happy Students
            </label>
            <input
              type="number"
              value={platformStats.happyStudents}
              onChange={(e) => setPlatformStats({...platformStats, happyStudents: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            💡 <strong>Note:</strong> These statistics will be displayed on the landing page "Why Choose Us" section and update in real-time.
          </p>
        </div>
      </div>

      {/* News Management Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">News Manager</h2>
          <button
            onClick={() => {
              resetNewsForm();
              setIsCreatingNews(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create News</span>
          </button>
        </div>

        {/* News Creation/Edit Form */}
        {isCreatingNews && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNewsId ? 'Edit News Item' : 'Create New News Item'}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNews(false);
                  resetNewsForm();
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                    placeholder="News title"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({...newsForm, category: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="milestone">Milestone</option>
                    <option value="update">Update</option>
                    <option value="achievement">Achievement</option>
                    <option value="promotion">Promotion</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                  placeholder="News content..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                  <select
                    value={newsForm.mediaType}
                    onChange={(e) => setNewsForm({...newsForm, mediaType: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">None</option>
                    <option value="image">Image</option>
                    <option value="video">Video (YouTube/Vimeo)</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media URL</label>
                  <input
                    type="url"
                    value={newsForm.mediaUrl}
                    onChange={(e) => setNewsForm({...newsForm, mediaUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsForm.isActive}
                    onChange={(e) => setNewsForm({...newsForm, isActive: e.target.checked})}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsForm.isFeatured}
                    onChange={(e) => setNewsForm({...newsForm, isFeatured: e.target.checked})}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => editingNewsId ? handleUpdateNews(editingNewsId) : handleCreateNews()}
                  disabled={!newsForm.title || !newsForm.content}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingNewsId ? 'Update' : 'Create'} News</span>
                </button>
                <button
                  onClick={() => {
                    setIsCreatingNews(false);
                    resetNewsForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* News List */}
        <div className="space-y-4">
          {newsList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No news items yet. Create your first news post!</p>
            </div>
          ) : (
            newsList.map(news => (
              <div key={news.id} className="p-4 border-2 border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{news.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        news.category === 'announcement' ? 'bg-blue-100 text-blue-800' :
                        news.category === 'milestone' ? 'bg-purple-100 text-purple-800' :
                        news.category === 'update' ? 'bg-green-100 text-green-800' :
                        news.category === 'achievement'? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {news.category}
                      </span>
                      {news.isFeatured && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                      {!news.isActive && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center space-x-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{news.content.substring(0, 150)}...</p>
                    <p className="text-xs text-gray-500">
                      Published: {new Date(news.publishedAt || news.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => startEditingNews(news)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      aria-label="Edit news"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(news.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label="Delete news"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Admin Action Monitor */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Admin Approval Monitor</h2>
          </div>
          <button
            onClick={() => setShowAdminMonitor(!showAdminMonitor)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            {showAdminMonitor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAdminMonitor ? 'Hide' : 'Show'} Logs</span>
          </button>
        </div>

        {showAdminMonitor && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {adminLogs.map(log => (
              <div 
                key={log.id} 
                className={`p-4 border-2 rounded-lg ${
                  log.isAutoSuspended 
                    ? 'border-red-200 bg-red-50' :'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">{log.adminName || 'Unknown Admin'}</span>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{log.actionType}</span>
                      {log.isAutoSuspended && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          AUTO-SUSPENDED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Target: {log.targetType} (ID: {log.targetId.substring(0, 8)}...)
                    </p>
                    {log.reason && (
                      <p className="text-sm text-gray-700 mt-1">Reason: {log.reason}</p>
                    )}
                    {log.flaggedCount > 0 && (
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ Flagged {log.flaggedCount} inappropriate items
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Payment Distribution */}
      {weeklyPayments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Payment Distribution</h2>
          <div className="space-y-4">
            {weeklyPayments.map(payment => (
              <div key={payment.week} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{payment.week}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((payment.amount / Math.max(...weeklyPayments.map(p => p.amount))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">${payment.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Executive Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-600">Detailed platform insights</div>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left">
            <Users className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">User Management</div>
              <div className="text-sm text-gray-600">{stats.pendingApprovals} pending approvals</div>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Financial Reports</div>
              <div className="text-sm text-gray-600">Revenue and payouts</div>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors text-left">
            <Globe className="w-6 h-6 text-orange-600" />
            <div>
              <div className="font-medium text-gray-900">Platform Settings</div>
              <div className="text-sm text-gray-600">System configuration</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Business Analytics Section
  const renderBusinessAnalytics = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Business Analytics</h1>
        </div>
        <p className="text-blue-100">Comprehensive insights into platform performance and user engagement</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">↑ {stats.weeklyNewUsers}</span>
            <span className="text-gray-600 ml-2">new this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Completion</h3>
            <LineChart className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{platformStats.completionRate}%</div>
          <div className="mt-4 text-sm text-gray-600">Average completion rate</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{platformStats.successRate}%</div>
          <div className="mt-4 text-sm text-gray-600">Student success rate</div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">User Distribution by Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Students</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.totalStudents / stats.totalUsers) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Tutors</span>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalTutors.toLocaleString()}</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats.totalTutors / stats.totalUsers) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Admins</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalAdmins.toLocaleString()}</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(stats.totalAdmins / stats.totalUsers) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Course Performance Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Active Courses</div>
              <div className="text-sm text-gray-600">Currently running courses</div>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.activeCourses}</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Average Enrollment</div>
              <div className="text-sm text-gray-600">Students per course</div>
            </div>
            <div className="text-2xl font-bold text-green-600">{Math.floor(stats.totalStudents / stats.activeCourses)}</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Happy Students</div>
              <div className="text-sm text-gray-600">Satisfaction metric</div>
            </div>
            <div className="text-2xl font-bold text-orange-600">{platformStats.happyStudents.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Financial Overview Section
  const renderFinancialOverview = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <DollarSign className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Financial Overview</h1>
        </div>
        <p className="text-green-100">Revenue tracking and financial performance metrics</p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(1)}K</div>
          <div className="mt-4 text-sm text-gray-600">Lifetime platform revenue</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average per User</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${(stats.totalRevenue / stats.totalUsers).toFixed(2)}</div>
          <div className="mt-4 text-sm text-gray-600">Revenue per active user</div>
        </div>
      </div>

      {/* Weekly Payment Distribution */}
      {weeklyPayments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Payment Distribution</h2>
          <div className="space-y-4">
            {weeklyPayments.map(payment => (
              <div key={payment.week} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{payment.week}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((payment.amount / Math.max(...weeklyPayments.map(p => p.amount))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">${payment.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Growth Rate</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">+{Math.floor((stats.weeklyNewUsers / stats.totalUsers) * 100)}%</div>
          <p className="text-xs text-gray-600 mt-2">Week over week</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Pending Approvals</h3>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
          <p className="text-xs text-gray-600 mt-2">Requires action</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Revenue per Course</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">${(stats.totalRevenue / stats.activeCourses / 1000).toFixed(1)}K</div>
          <p className="text-xs text-gray-600 mt-2">Average per course</p>
        </div>
      </div>
    </div>
  );

  // Organization Section
  const renderOrganization = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Building2 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Organization Overview</h1>
        </div>
        <p className="text-purple-100">Team structure and organizational insights</p>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Team Members</h3>
          <div className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-sm text-gray-600 mt-2">Across all roles and departments</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Tutors</h3>
          <div className="text-3xl font-bold text-gray-900">{stats.totalTutors.toLocaleString()}</div>
          <p className="text-sm text-gray-600 mt-2">Teaching staff members</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrators</h3>
          <div className="text-3xl font-bold text-gray-900">{stats.totalAdmins.toLocaleString()}</div>
          <p className="text-sm text-gray-600 mt-2">Administrative personnel</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Department Breakdown</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Education & Teaching</span>
              <span className="text-sm font-bold text-gray-900">{stats.totalTutors} members</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(stats.totalTutors / stats.totalUsers) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Student Body</span>
              <span className="text-sm font-bold text-gray-900">{stats.totalStudents} members</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(stats.totalStudents / stats.totalUsers) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Administration</span>
              <span className="text-sm font-bold text-gray-900">{stats.totalAdmins} members</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${(stats.totalAdmins / stats.totalUsers) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Monitor */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Admin Activity Monitor</h2>
          </div>
          <button
            onClick={() => setShowAdminMonitor(!showAdminMonitor)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            {showAdminMonitor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAdminMonitor ? 'Hide' : 'Show'} Logs</span>
          </button>
        </div>

        {showAdminMonitor && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {adminLogs.map(log => (
              <div 
                key={log.id} 
                className={`p-4 border-2 rounded-lg ${
                  log.isAutoSuspended 
                    ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">{log.adminName || 'Unknown Admin'}</span>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{log.actionType}</span>
                      {log.isAutoSuspended && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          AUTO-SUSPENDED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Target: {log.targetType} (ID: {log.targetId.substring(0, 8)}...)
                    </p>
                    {log.reason && (
                      <p className="text-sm text-gray-700 mt-1">Reason: {log.reason}</p>
                    )}
                    {log.flaggedCount > 0 && (
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ Flagged {log.flaggedCount} inappropriate items
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Growth Metrics Section
  const renderGrowthMetrics = () => (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Growth Metrics</h1>
        </div>
        <p className="text-orange-100">Platform growth trends and performance indicators</p>
      </div>

      {/* Growth Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Weekly Growth</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">+{stats.weeklyNewUsers}</div>
          <p className="text-xs text-gray-600 mt-2">New users this week</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Growth Rate</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{Math.floor((stats.weeklyNewUsers / stats.totalUsers) * 100)}%</div>
          <p className="text-xs text-gray-600 mt-2">Week over week</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Total Learners</h3>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{platformStats.totalLearners.toLocaleString()}</div>
          <p className="text-xs text-gray-600 mt-2">All-time learners</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Happy Students</h3>
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{platformStats.happyStudents.toLocaleString()}</div>
          <p className="text-xs text-gray-600 mt-2">Satisfaction count</p>
        </div>
      </div>

      {/* Platform Statistics Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Update Platform Statistics</h2>
          </div>
          <button
            onClick={handleUpdatePlatformStats}
            disabled={statsLoading}
            className="px-4 py-2 bg-orange-50 text-orange-600 font-medium rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {statsLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Stats</span>
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Learners
            </label>
            <input
              type="number"
              value={platformStats.totalLearners}
              onChange={(e) => setPlatformStats({...platformStats, totalLearners: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Success Rate (%)
            </label>
            <input
              type="number"
              value={platformStats.successRate}
              onChange={(e) => setPlatformStats({...platformStats, successRate: parseFloat(e.target.value) || 0})}
              max="100"
              className="w-full px-4 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Rate (%)
            </label>
            <input
              type="number"
              value={platformStats.completionRate}
              onChange={(e) => setPlatformStats({...platformStats, completionRate: parseFloat(e.target.value) || 0})}
              max="100"
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Happy Students
            </label>
            <input
              type="number"
              value={platformStats.happyStudents}
              onChange={(e) => setPlatformStats({...platformStats, happyStudents: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            💡 <strong>Note:</strong> These statistics will be displayed on the landing page "Why Choose Us" section and update in real-time.
          </p>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Key Performance Indicators</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">User Acquisition</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-blue-600">+{Math.floor((stats.weeklyNewUsers / stats.totalUsers) * 100)}%</span>
              <span className="text-sm text-gray-600">growth rate</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Course Engagement</span>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-green-600">{platformStats.completionRate}%</span>
              <span className="text-sm text-gray-600">completion rate</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Student Satisfaction</span>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-purple-600">{platformStats.successRate}%</span>
              <span className="text-sm text-gray-600">success rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Update renderSection to include course management
  const renderSection = () => {
    switch (activeSection) {
      case 'courses':
        return renderCourseManagement();
      case 'analytics':
        return renderBusinessAnalytics();
      case 'financial':
        return renderFinancialOverview();
      case 'organization':
        return renderOrganization();
      case 'growth':
        return renderGrowthMetrics();
      case 'settings':
        return null;
      case 'dashboard':
      default:
        return renderMainDashboard();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CEO Dashboard...</p>
        </div>
      </div>
    );
  }

  return renderSection();
};

export default CEODashboard;