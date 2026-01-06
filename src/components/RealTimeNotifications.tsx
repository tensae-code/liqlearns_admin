import React, { useEffect, useState } from 'react';
import { Bell, X, Gift, Trophy, Star, Users } from 'lucide-react';
import {
  subscribeToNotifications,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

const RealTimeNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    console.log('🔌 Setting up realtime notifications channel...');
    
    // Subscribe to notifications
    const channel = subscribeToNotifications(user.id, (notification) => {
      console.log('📨 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showToast(notification);
      setConnectionStatus('connected');
    });

    // Monitor channel state changes with improved detection
    channel.on('system', {}, (payload) => {
      console.log('🔄 Channel status update:', payload);
      
      // Detect successful subscription
      if (payload.extension === 'postgres_changes') {
        if (payload.status === 'ok') {
          setConnectionStatus('connected');
          console.log('✅ Real-time connection established');
        }
      }
    });

    // Improved connection verification with proper state checking
    const statusTimer = setTimeout(() => {
      // Check actual channel state
      const state = channel.state;
      console.log('🔍 Verifying channel state:', state);
      
      if (state === 'joined' || state === 'connected') {
        setConnectionStatus('connected');
        console.log('✅ Connection verified as active');
      } else if (state === 'closed' || state === 'errored') {
        setConnectionStatus('error');
        console.error('❌ Connection failed:', state);
      } else {
        // Still connecting
        console.log('⏱️ Still establishing connection...');
      }
    }, 2000); // Reduced timeout for faster feedback

    // Secondary verification for stubborn "connecting" states
    const fallbackTimer = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        const state = channel.state;
        // If we're still showing "connecting" but the channel is actually joined
        if (state === 'joined') {
          setConnectionStatus('connected');
          console.log('✅ Late connection verification - connected');
        } else {
          setConnectionStatus('error');
          console.error('❌ Connection timeout - failed to establish');
        }
      }
    }, 5000);

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(fallbackTimer);
      console.log('🔌 Disconnecting from realtime channel');
      channel.unsubscribe();
      setConnectionStatus('disconnected');
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await fetchNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const showToast = (notification: Notification) => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className =
      'fixed top-20 right-4 bg-purple-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h4 class="font-bold">${notification.title}</h4>
          <p class="text-sm">${notification.message}</p>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'xp_gain':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'level_up':
        return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'badge_unlock':
        return <Gift className="w-5 h-5 text-blue-400" />;
      case 'friend_activity':
        return <Users className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Enhanced connection status indicator with auto-hide on success */}
      {connectionStatus !== 'connected' && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 text-white text-sm rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          connectionStatus === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {connectionStatus === 'connecting' && (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Connecting to real-time updates...</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <span className="text-lg">⚠️</span>
              <span>Failed to connect. Retrying...</span>
            </>
          )}
        </div>
      )}

      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {connectionStatus === 'connected' && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Notifications</h3>
              {connectionStatus === 'connected' && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-xs mt-2">You'll be notified in real-time</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RealTimeNotifications;