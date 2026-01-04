import React, { useState } from 'react';
import { Award, Lock, Sparkles, Check } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  requirement?: number;
}

interface AchievementBadgesProps {
  badges: Badge[];
}

export default function AchievementBadges({ badges }: AchievementBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  const unlockedBadges = badges?.filter(b => b.unlocked) || [];
  const lockedBadges = badges?.filter(b => !b.unlocked) || [];

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      setShowUnlockAnimation(true);
      setTimeout(() => setShowUnlockAnimation(false), 1000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Achievement Badges</h3>
            <p className="text-sm text-gray-500">
              {unlockedBadges.length} of {badges?.length || 0} unlocked
            </p>
          </div>
        </div>
        <div className="bg-purple-50 px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-purple-700">
            {Math.round((unlockedBadges.length / (badges?.length || 1)) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            Unlocked Achievements
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {unlockedBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className="group relative flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="relative">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  {showUnlockAnimation && selectedBadge?.id === badge.id && (
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-ping" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-900 text-center line-clamp-2">
                  {badge.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'Unlocked'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-400" />
            Locked Achievements
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {lockedBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className="group relative flex flex-col items-center p-3 rounded-lg bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <div className="relative">
                  <div className="text-4xl mb-2 opacity-40 grayscale">{badge.icon}</div>
                  <Lock className="absolute top-0 right-0 h-4 w-4 text-gray-400" />
                </div>
                <span className="text-xs font-medium text-gray-600 text-center line-clamp-2">
                  {badge.name}
                </span>
                {badge.progress !== undefined && badge.requirement && (
                  <div className="w-full mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                        style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {badge.progress}/{badge.requirement}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBadge(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className={`text-6xl mb-4 ${selectedBadge.unlocked ? '' : 'opacity-40 grayscale'}`}>
                {selectedBadge.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedBadge.name}</h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              
              {selectedBadge.unlocked ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-semibold">Unlocked!</span>
                  </div>
                  {selectedBadge.unlockedAt && (
                    <p className="text-sm text-green-600 mt-1">
                      {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <Lock className="h-5 w-5" />
                    <span className="font-semibold">Locked</span>
                  </div>
                  {selectedBadge.progress !== undefined && selectedBadge.requirement && (
                    <p className="text-sm text-gray-600 mt-1">
                      Progress: {selectedBadge.progress}/{selectedBadge.requirement}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {(!badges || badges.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No badges available yet</p>
          <p className="text-sm">Complete quests to earn badges!</p>
        </div>
      )}
    </div>
  );
}