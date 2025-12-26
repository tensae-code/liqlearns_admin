import React, { useState, useEffect } from 'react';
import { 
  LogIn, LogOut, Eye, FileText, CheckSquare, ClipboardCheck, 
  Video, Download, ShoppingCart, User, Lock, Filter 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: any;
  created_at: string;
}

const ActivityTimeline: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      fetchActivities();
    }
  }, [user?.id, filterType]);

  const fetchActivities = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filterType !== 'all') {
        query = query.eq('action_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (actionType: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      login: <LogIn className="w-5 h-5 text-green-500" />,
      logout: <LogOut className="w-5 h-5 text-gray-500" />,
      view_course: <Eye className="w-5 h-5 text-blue-500" />,
      start_assignment: <FileText className="w-5 h-5 text-purple-500" />,
      submit_assignment: <CheckSquare className="w-5 h-5 text-green-600" />,
      take_quiz: <ClipboardCheck className="w-5 h-5 text-orange-500" />,
      join_classroom: <Video className="w-5 h-5 text-red-500" />,
      download_file: <Download className="w-5 h-5 text-indigo-500" />,
      purchase_product: <ShoppingCart className="w-5 h-5 text-pink-500" />,
      update_profile: <User className="w-5 h-5 text-cyan-500" />,
      change_password: <Lock className="w-5 h-5 text-yellow-600" />
    };
    return iconMap[actionType] || <FileText className="w-5 h-5 text-gray-400" />;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const actionTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'login', label: 'Login' },
    { value: 'view_course', label: 'Course Views' },
    { value: 'submit_assignment', label: 'Assignments' },
    { value: 'take_quiz', label: 'Quizzes' },
    { value: 'purchase_product', label: 'Purchases' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="flex-1 border-0 bg-transparent focus:ring-0 text-sm font-medium text-gray-700"
        >
          {actionTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200"></div>
        
        {/* Activities */}
        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No activities found</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start space-x-4">
                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-gray-200 shadow-sm">
                  {getIcon(activity.action_type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                    {activity.metadata && (
                      <span className="text-xs text-blue-600 font-medium">
                        {activity.related_entity_type}
                      </span>
                    )}
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

export default ActivityTimeline;