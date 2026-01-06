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
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    console.log('🔌 Attempting to connect to realtime channel...');
    
    // CRITICAL FIX: Store channel reference and set up proper cleanup
    const channel = subscribeToNotifications(user.id, (notification) => {
      console.log('📨 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showToast(notification);
    });

    // Handle connection status updates
    const handleChannelStatus = (status: string) => {
      console.log('🔴 Subscription status:', status);
      setConnectionStatus(status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time connection established');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        console.error('❌ Real-time connection failed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (user) {
            console.log('🔄 Attempting to reconnect...');
            channel.subscribe();
          }
        }, 5000);
      }
    };

    // Subscribe to channel status changes
    const statusListener = channel.on('system', {}, (payload: any) => {
      if (payload.status) {
        handleChannelStatus(payload.status);
      }
    });

    return () => {
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
      {/* Add connection status indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 px-3 py-2 bg-gray-800 text-white text-xs rounded z-50">
          Realtime: {connectionStatus}
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
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg">Notifications</h3>
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