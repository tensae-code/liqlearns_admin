import { supabase } from '../lib/supabase';

export interface ActivityFeedItem {
  id: string;
  event_type: 'enrollment' | 'completion' | 'milestone' | 'achievement' | 'purchase' | 'certificate';
  event_title?: string;
  event_description?: string;
  display_name?: string;
  user_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_anonymous?: boolean;
  metadata?: any;
  created_at: string;
}

export const activityFeedService = {
  // Fetch recent activities (only showing anonymous activities for public feed)
  async getRecentActivities(limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('platform_activity_feed')
        .select('*')
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { data: null, error };
    }
  },

  // Create new activity
  async createActivity(activity: Omit<ActivityFeedItem, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('platform_activity_feed')
        .insert([activity])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating activity:', error);
      return { data: null, error };
    }
  },

  // Subscribe to real-time activity updates
  subscribeToActivities(callback: (activity: ActivityFeedItem) => void) {
    return supabase
      .channel('activity_feed_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'platform_activity_feed' },
        (payload) => callback(payload.new as ActivityFeedItem)
      )
      .subscribe();
  }
};