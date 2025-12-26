import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { User, UserProgress } from '../types';

interface UserDetailModalProps {
  user: User | null;
  userProgress?: UserProgress;
  isOpen: boolean;
  onClose: () => void;
  onBanUser: (userId: string) => void;
  onApproveUser: (userId: string) => void;
  className?: string;
}

const UserDetailModal = ({ 
  user, 
  userProgress, 
  isOpen, 
  onClose, 
  onBanUser, 
  onApproveUser, 
  className = '' 
}: UserDetailModalProps) => {
  if (!isOpen || !user) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSkillColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className={`bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Image
              src={user.profileImage}
              alt={user.profileImageAlt}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">
                {user.fullName}
              </h2>
              <p className="font-body text-muted-foreground">@{user.username}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.accountStatus === 'active' ? 'bg-success text-success-foreground' :
                  user.accountStatus === 'pending' ? 'bg-warning text-warning-foreground' :
                  'bg-destructive text-destructive-foreground'
                }`}>
                  {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                </span>
                {user.isVerified && (
                  <Icon name="BadgeCheck" size={16} className="text-primary" />
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Email:</span>
                    <span className="font-body text-foreground">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Phone:</span>
                    <span className="font-body text-foreground">{user.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Language:</span>
                    <span className="font-body text-foreground capitalize">{user.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Referral Code:</span>
                    <span className="font-data text-foreground">{user.referralCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Join Date:</span>
                    <span className="font-body text-foreground">{formatDate(user.joinDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Last Login:</span>
                    <span className="font-body text-foreground">{formatDate(user.lastLogin)}</span>
                  </div>
                </div>
              </div>

              {/* MLM Information */}
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  MLM Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Current Level:</span>
                    <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                      {user.currentLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Sponsor:</span>
                    <span className="font-body text-foreground">{user.sponsor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Aura Points:</span>
                    <span className="font-data text-foreground">{user.auraPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-muted-foreground">Total Earnings:</span>
                    <span className="font-data text-foreground">ETB {user.totalEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Information */}
            <div className="space-y-6">
              {userProgress && (
                <>
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Learning Progress
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-body text-muted-foreground">Learning Level:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {userProgress.learningLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body text-muted-foreground">Streak Days:</span>
                        <span className="font-data text-foreground">{userProgress.streakDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body text-muted-foreground">Total Points:</span>
                        <span className="font-data text-foreground">{userProgress.totalPoints.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body text-muted-foreground">Completed Courses:</span>
                        <span className="font-data text-foreground">{userProgress.completedCourses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-body text-muted-foreground">Time Spent:</span>
                        <span className="font-data text-foreground">{Math.round(userProgress.timeSpentLearning / 60)} hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Skill Scores */}
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Skill Assessment
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(userProgress.skillScores).map(([skill, score]) => (
                        <div key={skill}>
                          <div className="flex justify-between mb-1">
                            <span className="font-body text-muted-foreground capitalize">{skill}:</span>
                            <span className="font-data text-foreground">{score}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getSkillColor(score)}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Ban Information */}
              {(user.accountStatus === 'banned' || user.accountStatus === 'temporary_ban') && (
                <div>
                  <h3 className="font-heading font-semibold text-lg text-destructive mb-4">
                    Ban Information
                  </h3>
                  <div className="space-y-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    {user.banReason && (
                      <div>
                        <span className="font-body text-muted-foreground">Reason:</span>
                        <p className="font-body text-foreground mt-1">{user.banReason}</p>
                      </div>
                    )}
                    {user.banExpiryDate && (
                      <div>
                        <span className="font-body text-muted-foreground">Expires:</span>
                        <p className="font-body text-foreground mt-1">{formatDate(user.banExpiryDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          {user.accountStatus === 'pending' && (
            <Button
              variant="default"
              onClick={() => onApproveUser(user.id)}
              iconName="Check"
              iconPosition="left"
            >
              Approve User
            </Button>
          )}
          {user.accountStatus === 'active' && (
            <Button
              variant="destructive"
              onClick={() => onBanUser(user.id)}
              iconName="Ban"
              iconPosition="left"
            >
              Ban User
            </Button>
          )}
          {(user.accountStatus === 'banned' || user.accountStatus === 'temporary_ban') && (
            <Button
              variant="default"
              onClick={() => onApproveUser(user.id)}
              iconName="UserCheck"
              iconPosition="left"
            >
              Unban User
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;