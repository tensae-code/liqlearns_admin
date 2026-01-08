import React from 'react';
import { LucideIcon } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export interface CourseOption {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  color: string;
  skillCount?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  description?: string; // REMOVED: No longer display description text as per user requirements
}

interface CourseSelectionCardProps {
  course: CourseOption;
  onSelect: (courseType: string) => void;
  isSelected: boolean;
}

const CourseSelectionCard: React.FC<CourseSelectionCardProps> = ({ 
  course, 
  onSelect, 
  isSelected 
}) => {
  const Icon = course.icon;
  
  // Difficulty badge colors
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  };

  return (
    <button
      onClick={() => onSelect(course.type)}
      className={`group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 ${
        isSelected 
          ? 'ring-4 ring-orange-500 shadow-2xl' 
          : 'shadow-lg hover:shadow-2xl'
      } ${course.color} text-white overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white blur-2xl"></div>
        <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon and Selection Badge */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          {isSelected && (
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white text-orange-600 rounded-full text-xs sm:text-sm font-bold">
              Selected
            </div>
          )}
        </div>

        {/* Course Name */}
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-left">{course.name}</h3>

        {/* Course Meta Info */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mt-3 sm:mt-4">
          {typeof course.skillCount === 'number' && (
            <span className="px-2 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full">
              {course.skillCount} skills
            </span>
          )}
          {course.difficulty && (
            <span className={`px-2 py-0.5 sm:py-1 rounded-full font-medium ${difficultyColors[course.difficulty]} bg-opacity-90`}>
              {course.difficulty}
            </span>
          )}
          {course.estimatedTime && (
            <span className="px-2 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full">
              {course.estimatedTime}
            </span>
          )}
        </div>

        {/* Hover Effect Arrow */}
        <div className={`mt-3 sm:mt-4 flex items-center gap-2 text-sm sm:text-base font-medium transition-all ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <span>Start Learning</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default CourseSelectionCard;