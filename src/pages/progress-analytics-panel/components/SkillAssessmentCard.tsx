import React from 'react';
import Icon from '../../../components/AppIcon';
import { SkillAssessment, SkillType } from '../types';

interface SkillAssessmentCardProps {
  assessment: SkillAssessment;
  learnerName: string;
  className?: string;
}

const SkillAssessmentCard = ({ assessment, learnerName, className = '' }: SkillAssessmentCardProps) => {
  const skills: { key: SkillType; label: string; icon: string }[] = [
    { key: 'listening', label: 'Listening', icon: 'Headphones' },
    { key: 'speaking', label: 'Speaking', icon: 'Mic' },
    { key: 'writing', label: 'Writing', icon: 'PenTool' },
    { key: 'reading', label: 'Reading', icon: 'BookOpen' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Four-Skill Assessment
          </h3>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {learnerName}'s language proficiency breakdown
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-heading font-bold text-primary">
            {assessment.overall}%
          </div>
          <div className="text-xs font-caption text-muted-foreground">
            Overall Score
          </div>
        </div>
      </div>

      {/* Individual Skills */}
      <div className="space-y-4 mb-6">
        {skills.map(({ key, label, icon }) => {
          const score = assessment[key];
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name={icon} size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body font-medium text-sm text-foreground">
                      {label}
                    </span>
                    <span className={`font-data text-sm font-medium ${getScoreColor(score)}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-body font-medium text-sm text-foreground mb-1">
              Performance Level
            </h4>
            <p className="font-caption text-xs text-muted-foreground">
              Based on overall assessment
            </p>
          </div>
          <div className="text-right">
            <div className={`font-body font-medium text-sm ${getScoreColor(assessment.overall)}`}>
              {getPerformanceLevel(assessment.overall)}
            </div>
            <div className="font-caption text-xs text-muted-foreground">
              {assessment.overall}/100
            </div>
          </div>
        </div>
      </div>

      {/* Skill Recommendations */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="font-body font-medium text-sm text-foreground mb-2">
          Improvement Recommendations
        </h4>
        <div className="space-y-2">
          {skills
            .filter(({ key }) => assessment[key] < 70)
            .slice(0, 2)
            .map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Icon name="Target" size={12} className="text-warning" />
                <span className="font-caption text-xs text-muted-foreground">
                  Focus on {label.toLowerCase()} exercises to improve proficiency
                </span>
              </div>
            ))}
          {skills.every(({ key }) => assessment[key] >= 70) && (
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={12} className="text-success" />
              <span className="font-caption text-xs text-muted-foreground">
                All skills are performing well. Continue current learning path.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillAssessmentCard;