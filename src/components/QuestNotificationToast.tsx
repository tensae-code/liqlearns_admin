import { useEffect, useState } from 'react';
import { Trophy, CheckCircle, X } from 'lucide-react';

interface QuestNotification {
  id: string;
  title: string;
  message: string;
  type: 'completion' | 'new_quest' | 'achievement';
  xp?: number;
  gold?: number;
}

interface QuestNotificationToastProps {
  notification: QuestNotification | null;
  onDismiss: () => void;
}

export default function QuestNotificationToast({ notification, onDismiss }: QuestNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'completion':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'new_quest':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'achievement':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default:
        return 'bg-gray-900 text-white';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className={`${getNotificationStyle()} rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-white/20 rounded-full p-2">
              {notification.type === 'completion' && <CheckCircle className="h-5 w-5" />}
              {notification.type === 'new_quest' && <Trophy className="h-5 w-5" />}
              {notification.type === 'achievement' && <Trophy className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
              {(notification.xp || notification.gold) && (
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                  {notification.xp && <span>+{notification.xp} XP</span>}
                  {notification.gold && <span>+{notification.gold} Gold</span>}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}