import React, { useState, useEffect } from 'react';
import { Users, Award, BookOpen, TrendingUp } from 'lucide-react';
import { activityFeedService } from '../services/activityFeedService';

interface ActivityFeedItem {
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

const SocialProofBlock: React.FC = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
    
    // Set up real-time subscription
    const subscription = activityFeedService.subscribeToActivities((newActivity) => {
      // Only add anonymous activities to the public feed
      if (newActivity.is_anonymous) {
        setActivities(prev => [newActivity, ...prev].slice(0, 5));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await activityFeedService.getRecentActivities(5);
      
      if (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (eventType: string) => {
    switch (eventType) {
      case 'enrollment': return <Users className="w-4 h-4 text-blue-500" />;
      case 'completion': return <Award className="w-4 h-4 text-green-500" />;
      case 'milestone': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'achievement': return <Award className="w-4 h-4 text-yellow-500" />;
      default: return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm border border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">🔥 Happening Now</h3>
        <span className="text-xs text-gray-500">Live activity</span>
      </div>
      
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start space-x-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-all duration-200"
            >
              <div className="mt-0.5">{getIcon(activity.event_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {activity.event_title || activity.event_description || 'New activity'}
                </p>
                {activity.display_name && (
                  <p className="text-xs text-gray-600 mt-0.5">{activity.display_name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialProofBlock;