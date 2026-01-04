import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award, X, Share2, Twitter, Facebook, Linkedin, Copy } from 'lucide-react';
import { 
  getUnshownNotifications, 
  markNotificationAsShown,
  trackAchievementShare,
  generateTwitterShareUrl,
  generateFacebookShareUrl,
  generateLinkedInShareUrl,
  generateShareUrl,
  AchievementNotification 
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

const AchievementUnlockAnimation: React.FC = () => {
  const { user } = useAuth();
  const [currentNotification, setCurrentNotification] = useState<AchievementNotification | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const checkNotifications = async () => {
      if (!user?.id) return;

      try {
        const notifications = await getUnshownNotifications(user.id);
        if (notifications.length > 0) {
          showNextNotification(notifications[0]);
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  const showNextNotification = (notification: AchievementNotification) => {
    setCurrentNotification(notification);
    setShowConfetti(true);

    // Auto-hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleClose = async () => {
    if (currentNotification) {
      try {
        await markNotificationAsShown(currentNotification.id);
        setCurrentNotification(null);
        setShowShareMenu(false);

        // Check for next notification
        if (user?.id) {
          const notifications = await getUnshownNotifications(user.id);
          if (notifications.length > 0) {
            setTimeout(() => showNextNotification(notifications[0]), 500);
          }
        }
      } catch (error) {
        console.error('Error marking notification as shown:', error);
      }
    }
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'copy_link') => {
    if (!currentNotification || !user) return;

    const shareUrl = generateShareUrl(
      currentNotification.achievement_type,
      currentNotification.achievement_name,
      user.email || 'User'
    );

    let url = '';
    switch (platform) {
      case 'twitter':
        url = generateTwitterShareUrl(currentNotification.achievement_name, user.email || 'User');
        window.open(url, '_blank');
        break;
      case 'facebook':
        url = generateFacebookShareUrl(shareUrl);
        window.open(url, '_blank');
        break;
      case 'linkedin':
        url = generateLinkedInShareUrl(shareUrl);
        window.open(url, '_blank');
        break;
      case 'copy_link':
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }

    try {
      await trackAchievementShare(
        user.id,
        currentNotification.achievement_type,
        currentNotification.achievement_name,
        platform,
        shareUrl
      );
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  if (!currentNotification) return null;

  const getIcon = () => {
    switch (currentNotification.achievement_type) {
      case 'badge':
        return <Award className="w-16 h-16 text-yellow-400" />;
      case 'level':
        return <Star className="w-16 h-16 text-yellow-400" />;
      case 'streak':
        return <Trophy className="w-16 h-16 text-yellow-400" />;
      case 'event':
        return <Trophy className="w-16 h-16 text-yellow-400" />;
      default:
        return <Trophy className="w-16 h-16 text-yellow-400" />;
    }
  };

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Achievement Popup */}
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl max-w-md w-full p-8 relative animate-bounceIn shadow-2xl">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Achievement Icon */}
          <div className="flex justify-center mb-6 animate-pulse">
            <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm">
              {getIcon()}
            </div>
          </div>

          {/* Achievement Text */}
          <div className="text-center text-white mb-6">
            <h2 className="text-3xl font-bold mb-2">🎉 Achievement Unlocked! 🎉</h2>
            <p className="text-2xl font-bold mb-3">{currentNotification.achievement_name}</p>
            <p className="text-white/90">{currentNotification.achievement_description}</p>
          </div>

          {/* Share Button */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Continue
            </button>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex-1 bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="mt-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm animate-slideUp">
              <p className="text-white text-sm font-semibold mb-3">Share your achievement:</p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="w-6 h-6 text-white" />
                  <span className="text-xs text-white">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook className="w-6 h-6 text-white" />
                  <span className="text-xs text-white">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex flex-col items-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-6 h-6 text-white" />
                  <span className="text-xs text-white">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('copy_link')}
                  className="flex flex-col items-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Copy Link"
                >
                  <Copy className="w-6 h-6 text-white" />
                  <span className="text-xs text-white">Copy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.5) translateY(-50px);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AchievementUnlockAnimation;