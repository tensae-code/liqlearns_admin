import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

interface Notification {
  id: string;
  type: 'approval' | 'financial' | 'content' | 'system' | 'user';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

const NotificationCenter = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  className = ''
}: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample notifications for demo
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      type: 'approval',
      title: 'User Approval Required',
      message: '5 new users pending approval in the MLM network',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'financial',
      title: 'Commission Payment Processed',
      message: 'Monthly commissions have been calculated and distributed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'content',
      title: 'New Content Uploaded',
      message: 'Ethiopian language course materials require review',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance completed successfully',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      priority: 'low'
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;
  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead?.(notification.id);
    }
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval': return 'UserCheck';
      case 'financial': return 'DollarSign';
      case 'content': return 'FileText';
      case 'system': return 'Settings';
      case 'user': return 'Users';
      default: return 'Bell';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors duration-200 ease-out"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Icon name="Bell" size={20} className="text-muted-foreground" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-[1050] max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-sm text-popover-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="font-body text-xs text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="font-body text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="py-2">
                {displayNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-3 text-left hover:bg-muted transition-colors duration-200 border-l-2 ${
                      notification.isRead 
                        ? 'border-transparent' :'border-primary bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 ${getPriorityColor(notification.priority)}`}>
                        <Icon name={getNotificationIcon(notification.type)} size={16} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-body text-sm ${
                            notification.isRead 
                              ? 'text-muted-foreground' 
                              : 'text-popover-foreground font-medium'
                          }`}>
                            {notification.title}
                          </p>
                          <span className="font-caption text-xs text-muted-foreground ml-2">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="font-body text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center font-body text-sm text-primary hover:text-primary/80 transition-colors duration-200"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;