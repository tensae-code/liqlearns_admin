import { supabase } from '../lib/supabase';

export interface CEODashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalAdmins: number;
  totalRevenue: number;
  weeklyNewUsers: number;
  activeCourses: number;
  pendingApprovals: number;
}

export interface PlatformStatistics {
  totalLearners: number;
  successRate: number;
  completionRate: number;
  happyStudents: number;
  demoVideoUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  mediaType?: string;
  mediaUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdBy: string;
}

export interface AdminActionLog {
  id: string;
  adminId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  reason?: string;
  flaggedCount: number;
  isAutoSuspended: boolean;
  createdAt: string;
  adminName?: string;
}

// Fetch CEO Dashboard Statistics
export const fetchCEODashboardStats = async (): Promise<CEODashboardStats> => {
  try {
    const { data, error } = await supabase
      .from('ceo_dashboard_stats')
      .select('*')
      .single();

    if (error) throw error;

    return {
      totalUsers: Number(data.total_users) || 0,
      totalStudents: Number(data.total_students) || 0,
      totalTutors: Number(data.total_tutors) || 0,
      totalAdmins: Number(data.total_admins) || 0,
      totalRevenue: Number(data.total_revenue) || 0,
      weeklyNewUsers: Number(data.weekly_new_users) || 0,
      activeCourses: Number(data.total_courses) || 0,
      pendingApprovals: Number(data.pending_approvals) || 0,
    };
  } catch (error) {
    console.error('Error fetching CEO dashboard stats:', error);
    throw error;
  }
};

// Fetch Platform Statistics (for landing page)
export const fetchPlatformStatistics = async (): Promise<PlatformStatistics> => {
  try {
    const { data, error } = await supabase
      .from('platform_statistics')
      .select('*')
      .single();

    if (error) throw error;

    return {
      totalLearners: data.total_learners || 0,
      successRate: Number(data.success_rate) || 0,
      completionRate: Number(data.completion_rate) || 0,
      happyStudents: data.happy_students || 0,
      demoVideoUrl: data.demo_video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    throw error;
  }
};

// Update Platform Statistics
export const updatePlatformStatistics = async (stats: Partial<PlatformStatistics>): Promise<void> => {
  try {
    const updates: any = {};
    
    if (stats.totalLearners !== undefined) updates.total_learners = stats.totalLearners;
    if (stats.successRate !== undefined) updates.success_rate = stats.successRate;
    if (stats.completionRate !== undefined) updates.completion_rate = stats.completionRate;
    if (stats.happyStudents !== undefined) updates.happy_students = stats.happyStudents;
    if (stats.demoVideoUrl !== undefined) updates.demo_video_url = stats.demoVideoUrl;

    const { error } = await supabase
      .from('platform_statistics')
      .update(updates)
      .eq('id', (await supabase.from('platform_statistics').select('id').single()).data.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating platform statistics:', error);
    throw error;
  }
};

// Fetch All News
export const fetchAllNews = async (activeOnly: boolean = false): Promise<NewsItem[]> => {
  try {
    let query = supabase
      .from('ceo_news')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      mediaType: item.media_type,
      mediaUrl: item.media_url,
      isActive: item.is_active,
      isFeatured: item.is_featured,
      createdAt: item.created_at,
      publishedAt: item.published_at,
      scheduledAt: item.scheduled_at,
      createdBy: item.created_by,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Create News Item
export const createNewsItem = async (news: Omit<NewsItem, 'id' | 'createdAt'>): Promise<NewsItem> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ceo_news')
      .insert({
        title: news.title,
        content: news.content,
        category: news.category,
        media_type: news.mediaType,
        media_url: news.mediaUrl,
        is_active: news.isActive,
        is_featured: news.isFeatured,
        published_at: news.publishedAt,
        scheduled_at: news.scheduledAt,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      mediaType: data.media_type,
      mediaUrl: data.media_url,
      isActive: data.is_active,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      publishedAt: data.published_at,
      scheduledAt: data.scheduled_at,
      createdBy: data.created_by,
    };
  } catch (error) {
    console.error('Error creating news item:', error);
    throw error;
  }
};

// Update News Item
export const updateNewsItem = async (id: string, updates: Partial<NewsItem>): Promise<void> => {
  try {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.mediaType !== undefined) updateData.media_type = updates.mediaType;
    if (updates.mediaUrl !== undefined) updateData.media_url = updates.mediaUrl;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
    if (updates.publishedAt !== undefined) updateData.published_at = updates.publishedAt;
    if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt;

    const { error } = await supabase
      .from('ceo_news')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating news item:', error);
    throw error;
  }
};

// Delete News Item
export const deleteNewsItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('ceo_news')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting news item:', error);
    throw error;
  }
};

// Fetch Admin Action Logs (for monitoring admin behavior)
export const fetchAdminActionLogs = async (limit: number = 50): Promise<AdminActionLog[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_actions_log')
      .select(`
        *,
        admin:user_profiles!admin_id(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(log => ({
      id: log.id,
      adminId: log.admin_id,
      actionType: log.action_type,
      targetType: log.target_type,
      targetId: log.target_id,
      reason: log.reason,
      flaggedCount: log.flagged_count || 0,
      isAutoSuspended: log.is_auto_suspended || false,
      createdAt: log.created_at,
      adminName: log.admin?.full_name,
    }));
  } catch (error) {
    console.error('Error fetching admin action logs:', error);
    throw error;
  }
};

// Fetch Pending Content Approvals
export const fetchPendingApprovals = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('content_review_flags')
      .select('*', { count: 'exact', head: true })
      .eq('review_status', 'pending');

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return 0;
  }
};

// Fetch Weekly Payment Distribution (MLM commissions aggregated by week)
export const fetchWeeklyPaymentDistribution = async (): Promise<{ week: string; amount: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('mlm_commissions')
      .select('amount, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Aggregate by week
    const weeklyData: { [key: string]: number } = {};
    
    data.forEach(commission => {
      const date = new Date(commission.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += Number(commission.amount);
    });

    return Object.entries(weeklyData).map(([week, amount]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: Math.round(amount * 100) / 100,
    }));
  } catch (error) {
    console.error('Error fetching weekly payment distribution:', error);
    return [];
  }
};

// Fetch All User Registration Requests (for CEO approval)
export const fetchUserRegistrationRequests = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('subscription_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      accountStatus: user.account_status,
      subscriptionPlan: user.subscription_plan,
      subscriptionStatus: user.subscription_status,
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error('Error fetching user registration requests:', error);
    return [];
  }
};

// Fetch All Courses
export const fetchCourses = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};