import { supabase } from '../lib/supabase';

export interface UserActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: any;
  created_at: string;
}

export const userActivityService = {
  // Fetch user's activity logs
  async getUserActivities(userId: string, actionType?: string, limit: number = 50) {
    try {
      let query = supabase
        .from('user_activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false })
        .limit(limit);

      if (actionType && actionType !== 'all') {
        query = query.eq('action_type', actionType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return { data: null, error };
    }
  },

  // Log new user activity
  async logActivity(activity: Omit<UserActivityLog, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .insert([activity])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { data: null, error };
    }
  },

  // Get activity statistics
  async getActivityStats(userId: string, days: number = 7) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('action_type')
        .eq('user_id', userId)
        .gte('created_at', date.toISOString());

      if (error) throw error;

      const stats = (data || []).reduce((acc: any, log: any) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
      }, {});

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return { data: null, error };
    }
  }
};