import React, { useEffect, useState } from 'react';
import { X, BookOpen, Award, Trophy, Download, Eye, Check, Plus, Minus } from 'lucide-react';
import { studentDashboardService } from '../services/studentDashboardService';
import { certificateService, gamificationService, StudentCertificate, BadgeProgress } from '../services/phase2Service';

export type StatCardType = 'lessons' | 'badges' | 'xp' | 'certificates';

interface StatCardModalProps {
  type: StatCardType;
  userId: string;
  onClose: () => void;
}

interface LessonData {
  id: string;
  title: string;
  courseName: string;
  progressPercentage: number;
  isCompleted: boolean;
  lastAccessedAt: string;
}

interface XPTransaction {
  id: string;
  amount: number;
  type: 'IN' | 'OUT';
  reason: string;
  description: string;
  balance: number;
  createdAt: string;
}

const StatCardModal: React.FC<StatCardModalProps> = ({ type, userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state for each type
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [xpTransactions, setXpTransactions] = useState<XPTransaction[]>([]);
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);

  // Load data based on type
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        switch (type) {
          case 'lessons':
            await loadLessonsData();
            break;
          case 'badges':
            await loadBadgesData();
            break;
          case 'xp':
            await loadXPData();
            break;
          case 'certificates':
            await loadCertificatesData();
            break;
        }
      } catch (err: any) {
        console.error(`Error loading ${type} data:`, err);
        setError(err.message || `Failed to load ${type} data`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, userId]);

  // Load lessons with course data
  const loadLessonsData = async () => {
    const lessonsData = await studentDashboardService.getRecentLessons(userId);
    setLessons(lessonsData);
  };

  // Load all badges
  const loadBadgesData = async () => {
    const badgesData = await gamificationService.getStudentBadgeProgress(userId);
    setBadges(badgesData);
  };

  // Load XP transaction history
  const loadXPData = async () => {
    const xpData = await studentDashboardService.getXPTransactionHistory(userId);
    setXpTransactions(xpData);
  };

  // Load certificates
  const loadCertificatesData = async () => {
    const certsData = await certificateService.getStudentCertificates(userId);
    setCertificates(certsData);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Render modal title based on type
  const getModalTitle = () => {
    const titles = {
      lessons: 'Recent Lessons',
      badges: 'Badge Collection',
      xp: 'XP Activity History',
      certificates: 'My Certificates',
    };
    return titles[type];
  };

  // Render modal icon based on type
  const getModalIcon = () => {
    const icons = {
      lessons: <BookOpen className="w-6 h-6 text-blue-500" />,
      badges: <Award className="w-6 h-6 text-purple-500" />,
      xp: <Trophy className="w-6 h-6 text-yellow-500" />,
      certificates: <Award className="w-6 h-6 text-orange-500" />,
    };
    return icons[type];
  };

  // Render lessons content
  const renderLessonsContent = () => {
    if (lessons.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No lessons completed yet</p>
          <p className="text-sm text-gray-500 mt-2">Start learning to see your progress here!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{lesson.title}</h3>
                <p className="text-sm text-gray-600">{lesson.courseName}</p>
              </div>
              {lesson.isCompleted && (
                <div className="flex-shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Completed
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span className="font-bold text-gray-900">{lesson.progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    lesson.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${lesson.progressPercentage}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Last accessed: {new Date(lesson.lastAccessedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // Render badges content (landing page badge search layout)
  const renderBadgesContent = () => {
    if (badges.length === 0) {
      return (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No badges earned yet</p>
          <p className="text-sm text-gray-500 mt-2">Complete achievements to unlock badges!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative bg-white rounded-xl p-4 border-2 transition-all hover:shadow-lg ${
              badge.isUnlocked ? 'border-yellow-500' : 'border-gray-200 opacity-60'
            }`}
          >
            {badge.isUnlocked && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
            
            {/* Badge icon */}
            <div
              className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
                badge.isUnlocked ? 'bg-yellow-100' : 'bg-gray-100 grayscale'
              }`}
            >
              {badge.tier.iconUrl ? (
                <img src={badge.tier.iconUrl} alt={badge.tier.tierName} className="w-12 h-12" />
              ) : (
                '🏆'
              )}
            </div>

            {/* Badge info */}
            <h3 className="text-center font-bold text-sm text-gray-900 mb-1 line-clamp-2">
              {badge.tier.tierName}
            </h3>
            <p className="text-center text-xs text-gray-600 mb-2 capitalize">
              {badge.tier.tier}
            </p>

            {/* Progress for locked badges */}
            {!badge.isUnlocked && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(badge.currentProgress / badge.tier.requirementValue) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {badge.currentProgress}/{badge.tier.requirementValue}
                </p>
              </div>
            )}

            {/* Unlocked date for earned badges */}
            {badge.isUnlocked && badge.unlockedAt && (
              <p className="text-xs text-green-600 text-center mt-2">
                Earned {new Date(badge.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render XP activity content
  const renderXPContent = () => {
    if (xpTransactions.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No XP activity yet</p>
          <p className="text-sm text-gray-500 mt-2">Complete missions and lessons to earn XP!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {xpTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`bg-white rounded-lg border-2 p-4 ${
              transaction.type === 'IN' ?'border-green-200 bg-green-50' :'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {transaction.type === 'IN' ? (
                    <div className="bg-green-500 text-white p-1 rounded">
                      <Plus className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white p-1 rounded">
                      <Minus className="w-3 h-3" />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900">{transaction.reason}</h3>
                </div>
                <p className="text-sm text-gray-600">{transaction.description}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p
                  className={`text-lg font-bold ${
                    transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'IN' ? '+' : '-'}
                  {transaction.amount} XP
                </p>
                <p className="text-xs text-gray-500">
                  Balance: {transaction.balance} XP
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // Render certificates content
  const renderCertificatesContent = () => {
    if (certificates.length === 0) {
      return (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No certificates earned yet</p>
          <p className="text-sm text-gray-500 mt-2">Complete courses to earn certificates!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border-2 border-orange-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <Award className="w-8 h-8 text-orange-600 flex-shrink-0" />
              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                Verified
              </span>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-2 text-lg">{cert.title}</h3>
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{cert.description}</p>
            
            <div className="space-y-2 text-xs text-gray-600 mb-4">
              <p>
                <strong>Certificate ID:</strong> {cert.uniqueCertificateId}
              </p>
              <p>
                <strong>Issued:</strong>{' '}
                {new Date(cert.issuedDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Completed:</strong>{' '}
                {new Date(cert.completionDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="px-3 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main render
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            {getModalIcon()}
            <h2 className="text-2xl font-bold text-gray-900">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading {type}...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {type === 'lessons' && renderLessonsContent()}
              {type === 'badges' && renderBadgesContent()}
              {type === 'xp' && renderXPContent()}
              {type === 'certificates' && renderCertificatesContent()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCardModal;