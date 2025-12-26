import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { LearnerProgress, FilterOptions, LearningLevel, UserLevel } from '../types';

interface LearnerTableProps {
  learners: LearnerProgress[];
  onLearnerSelect: (learner: LearnerProgress) => void;
  selectedLearner: LearnerProgress | null;
}

const LearnerTable = ({ learners, onLearnerSelect, selectedLearner }: LearnerTableProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    language: 'all',
    level: 'all',
    userLevel: 'all',
    timeRange: '30d',
    searchQuery: ''
  });

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'amharic', label: 'Amharic' },
    { value: 'tigrinya', label: 'Tigrinya' },
    { value: 'oromifa', label: 'Oromifa' }
  ];

  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'Beginner-letters', label: 'Beginner (Letters)' },
    { value: 'Basic-words', label: 'Basic (Words)' },
    { value: 'Advanced-sentences', label: 'Advanced (Sentences)' },
    { value: 'Pro-paragraphs', label: 'Pro (Paragraphs)' },
    { value: 'Elite-advanced', label: 'Elite (Advanced)' }
  ];

  const userLevelOptions = [
    { value: 'all', label: 'All User Levels' },
    { value: 'Student', label: 'Student' },
    { value: 'Trainee Seller', label: 'Trainee Seller' },
    { value: 'Salesman', label: 'Salesman' },
    { value: 'Team Leader', label: 'Team Leader' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Journeyman', label: 'Journeyman' },
    { value: 'Brand Ambassador', label: 'Brand Ambassador' },
    { value: 'Ambassador', label: 'Ambassador' }
  ];

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = learner.username.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         learner.fullName.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesLanguage = filters.language === 'all' || 
                           learner.selectedLanguages.some(lang => lang.toLowerCase() === filters.language);
    const matchesLevel = filters.level === 'all' || learner.currentLevel === filters.level;
    const matchesUserLevel = filters.userLevel === 'all' || learner.userLevel === filters.userLevel;
    
    return matchesSearch && matchesLanguage && matchesLevel && matchesUserLevel;
  });

  const getLevelColor = (level: LearningLevel) => {
    switch (level) {
      case 'Beginner-letters': return 'bg-blue-100 text-blue-800';
      case 'Basic-words': return 'bg-green-100 text-green-800';
      case 'Advanced-sentences': return 'bg-yellow-100 text-yellow-800';
      case 'Pro-paragraphs': return 'bg-orange-100 text-orange-800';
      case 'Elite-advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserLevelColor = (level: UserLevel) => {
    switch (level) {
      case 'Student': return 'bg-gray-100 text-gray-800';
      case 'Trainee Seller': return 'bg-blue-100 text-blue-800';
      case 'Salesman': return 'bg-green-100 text-green-800';
      case 'Team Leader': return 'bg-yellow-100 text-yellow-800';
      case 'Supervisor': return 'bg-orange-100 text-orange-800';
      case 'Journeyman': return 'bg-red-100 text-red-800';
      case 'Brand Ambassador': return 'bg-purple-100 text-purple-800';
      case 'Ambassador': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Learner Progress Tracking
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Monitor individual learning progress and skill assessments
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredLearners.length} of {learners.length} learners
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            type="search"
            placeholder="Search learners..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="lg:col-span-2"
          />
          
          <Select
            options={languageOptions}
            value={filters.language}
            onChange={(value) => setFilters(prev => ({ ...prev, language: value as string }))}
            placeholder="Language"
          />
          
          <Select
            options={levelOptions}
            value={filters.level}
            onChange={(value) => setFilters(prev => ({ ...prev, level: value as LearningLevel | 'all' }))}
            placeholder="Learning Level"
          />
          
          <Select
            options={userLevelOptions}
            value={filters.userLevel}
            onChange={(value) => setFilters(prev => ({ ...prev, userLevel: value as UserLevel | 'all' }))}
            placeholder="User Level"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Learner
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Languages
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Learning Level
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                User Level
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Streak
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Points
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Overall Score
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLearners.map((learner) => (
              <tr 
                key={learner.id}
                className={`border-b border-border hover:bg-muted/30 transition-colors duration-200 ${
                  selectedLearner?.id === learner.id ? 'bg-primary/10' : ''
                }`}
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={learner.avatar}
                      alt={learner.alt}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-body font-medium text-sm text-foreground">
                        {learner.fullName}
                      </p>
                      <p className="font-caption text-xs text-muted-foreground">
                        @{learner.username}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {learner.selectedLanguages.slice(0, 2).map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-1 bg-accent/20 text-accent-foreground rounded text-xs font-caption"
                      >
                        {lang}
                      </span>
                    ))}
                    {learner.selectedLanguages.length > 2 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-caption">
                        +{learner.selectedLanguages.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-caption ${getLevelColor(learner.currentLevel)}`}>
                    {learner.currentLevel}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-caption ${getUserLevelColor(learner.userLevel)}`}>
                    {learner.userLevel}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Flame" size={16} className="text-orange-500" />
                    <span className="font-data text-sm text-foreground">
                      {learner.dailyLoginStreak}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-data text-sm text-foreground">
                    {learner.totalEarnedPoints.toLocaleString()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${learner.skillAssessments.overall}%` }}
                      />
                    </div>
                    <span className="font-data text-sm text-foreground">
                      {learner.skillAssessments.overall}%
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onLearnerSelect(learner)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                    aria-label={`View details for ${learner.fullName}`}
                  >
                    <Icon name="Eye" size={16} className="text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLearners.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-medium text-lg text-foreground mb-2">
            No learners found
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default LearnerTable;