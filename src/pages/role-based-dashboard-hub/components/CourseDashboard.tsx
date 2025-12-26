import React, { useState } from 'react';
import { BookOpen, Calculator, Beaker, Globe, Laptop, ArrowLeft, Play, FileText, Headphones, MessageCircle, Activity, Brain, Target, Music, Gamepad2, BookAudio, Type, Dumbbell, BookCopy, Film, Microscope, Headset, Code, Palette, Camera } from 'lucide-react';
import CourseContentView from './CourseContentView';

interface CourseDashboardProps {
  courseType: 'language' | 'mathematics' | 'science' | 'history' | 'technology';
  onBack: () => void;
}

interface TutoringResource {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  category?: string;
}

const getCourseConfig = (type: string) => {
  const configs: Record<string, {
    title: string;
    icon: React.ElementType;
    color: string;
    resources: TutoringResource[];
  }> = {
    language: {
      title: 'Language Learning (Amharic)',
      icon: BookOpen,
      color: 'bg-blue-500',
      resources: [
        { id: '1', name: 'Reading Comprehension', icon: BookOpen, color: 'bg-blue-500', description: 'Master reading skills with interactive texts' },
        { id: '2', name: 'Writing Workshop', icon: FileText, color: 'bg-green-500', description: 'Improve writing through guided exercises' },
        { id: '3', name: 'Speaking Practice', icon: MessageCircle, color: 'bg-purple-500', description: 'Build fluency with conversation practice' },
        { id: '4', name: 'Listening Exercises', icon: Headphones, color: 'bg-orange-500', description: 'Enhance comprehension skills' },
        
        { id: '5', name: 'Interactive Videos', icon: Play, color: 'bg-red-500', description: 'Engaging video lessons' },
        { id: '6', name: 'Audio Lessons', icon: Headset, color: 'bg-indigo-500', description: 'Listen and learn on the go' },
        { id: '7', name: 'Cultural Context', icon: Globe, color: 'bg-pink-500', description: 'Learn about Habesha culture' },
        { id: '8', name: 'Music & Songs', icon: Music, color: 'bg-cyan-500', description: 'Learn through Ethiopian music' },
        { id: '9', name: 'Games & Puzzles', icon: Gamepad2, color: 'bg-yellow-500', description: 'Fun language games' },
        { id: '10', name: 'Audiobooks', icon: BookAudio, color: 'bg-teal-500', description: 'Story-based learning' },
        { id: '11', name: 'Vocabulary Builder', icon: Type, color: 'bg-rose-500', description: 'Expand your word bank' },
        { id: '12', name: 'Grammar Notes', icon: FileText, color: 'bg-lime-500', description: 'Essential grammar rules' },
        { id: '13', name: 'Practice Exercises', icon: Dumbbell, color: 'bg-amber-500', description: 'Strengthen your skills' },
        { id: '14', name: 'Novels & Stories', icon: BookCopy, color: 'bg-violet-500', description: 'Read authentic texts' },
        { id: '15', name: 'Movies & Shows', icon: Film, color: 'bg-fuchsia-500', description: 'Learn from media' },
        { id: '16', name: 'Live Classes', icon: Headset, color: 'bg-sky-500', description: 'Join interactive sessions' }
      ]
    },
    mathematics: {
      title: 'Mathematics',
      icon: Calculator,
      color: 'bg-green-500',
      resources: [
        { id: '1', name: 'Problem Solving', icon: Brain, color: 'bg-purple-500', description: 'Strategic approach to math problems' },
        { id: '2', name: 'Calculation Practice', icon: Calculator, color: 'bg-green-500', description: 'Master arithmetic and algebra' },
        { id: '3', name: 'Logic Puzzles', icon: Target, color: 'bg-blue-500', description: 'Develop logical thinking' },
        { id: '4', name: 'Visual Learning', icon: Activity, color: 'bg-orange-500', description: 'Graphs and geometric concepts' },
        
        { id: '5', name: 'Interactive Problems', icon: Play, color: 'bg-red-500', description: 'Hands-on math challenges' },
        { id: '6', name: 'Step-by-Step Guides', icon: FileText, color: 'bg-indigo-500', description: 'Detailed solution methods' },
        { id: '7', name: 'Math Games', icon: Gamepad2, color: 'bg-yellow-500', description: 'Fun number challenges' },
        { id: '8', name: 'Formula Sheets', icon: BookOpen, color: 'bg-pink-500', description: 'Quick reference guides' },
        { id: '9', name: 'Video Tutorials', icon: Play, color: 'bg-cyan-500', description: 'Concept explanations' },
        { id: '10', name: 'Practice Tests', icon: FileText, color: 'bg-teal-500', description: 'Assess your knowledge' },
        { id: '11', name: 'Number Theory', icon: Brain, color: 'bg-rose-500', description: 'Advanced concepts' },
        { id: '12', name: 'Geometry Tools', icon: Activity, color: 'bg-lime-500', description: 'Shapes and angles' },
        { id: '13', name: 'Algebra Workbook', icon: BookCopy, color: 'bg-amber-500', description: 'Equation practice' },
        { id: '14', name: 'Word Problems', icon: FileText, color: 'bg-violet-500', description: 'Real-world applications' },
        { id: '15', name: 'Math Competitions', icon: Target, color: 'bg-fuchsia-500', description: 'Challenge yourself' },
        { id: '16', name: 'Live Tutoring', icon: Headset, color: 'bg-sky-500', description: 'Get personalized help' }
      ]
    },
    science: {
      title: 'Science',
      icon: Beaker,
      color: 'bg-purple-500',
      resources: [
        { id: '1', name: 'Theory Modules', icon: BookOpen, color: 'bg-blue-500', description: 'Core scientific concepts' },
        { id: '2', name: 'Virtual Experiments', icon: Beaker, color: 'bg-purple-500', description: 'Safe lab simulations' },
        { id: '3', name: 'Research Projects', icon: FileText, color: 'bg-green-500', description: 'Hands-on investigations' },
        { id: '4', name: 'Visual Models', icon: Activity, color: 'bg-orange-500', description: '3D scientific visualizations' },
        
        { id: '5', name: 'Video Demonstrations', icon: Play, color: 'bg-red-500', description: 'Watch experiments in action' },
        { id: '6', name: 'Practice Quizzes', icon: Target, color: 'bg-indigo-500', description: 'Test your knowledge' },
        { id: '7', name: 'Microscope Tools', icon: Microscope, color: 'bg-yellow-500', description: 'Explore the microscopic world' },
        { id: '8', name: 'Lab Notebooks', icon: FileText, color: 'bg-pink-500', description: 'Record observations' },
        { id: '9', name: 'Science Games', icon: Gamepad2, color: 'bg-cyan-500', description: 'Interactive learning' },
        { id: '10', name: 'Periodic Table', icon: BookOpen, color: 'bg-teal-500', description: 'Element reference' },
        { id: '11', name: 'Physics Simulations', icon: Activity, color: 'bg-rose-500', description: 'Motion and forces' },
        { id: '12', name: 'Chemistry Lab', icon: Beaker, color: 'bg-lime-500', description: 'Chemical reactions' },
        { id: '13', name: 'Biology Studies', icon: BookCopy, color: 'bg-amber-500', description: 'Living organisms' },
        { id: '14', name: 'Nature Documentaries', icon: Film, color: 'bg-violet-500', description: 'Wildlife learning' },
        { id: '15', name: 'Field Guides', icon: BookOpen, color: 'bg-fuchsia-500', description: 'Outdoor exploration' },
        { id: '16', name: 'Live Science Shows', icon: Headset, color: 'bg-sky-500', description: 'Interactive demonstrations' }
      ]
    },
    history: {
      title: 'History',
      icon: Globe,
      color: 'bg-yellow-500',
      resources: [
        { id: '1', name: 'Timeline Explorer', icon: Activity, color: 'bg-blue-500', description: 'Navigate historical events' },
        { id: '2', name: 'Document Analysis', icon: FileText, color: 'bg-green-500', description: 'Study primary sources' },
        { id: '3', name: 'Video Archives', icon: Play, color: 'bg-red-500', description: 'Historical footage and documentaries' },
        { id: '4', name: 'Cultural Studies', icon: Globe, color: 'bg-purple-500', description: 'Explore world civilizations' },
        
        { id: '5', name: 'Interactive Maps', icon: Target, color: 'bg-orange-500', description: 'Geographic context' },
        { id: '6', name: 'Biography Reading', icon: BookOpen, color: 'bg-indigo-500', description: 'Learn from historical figures' },
        { id: '7', name: 'Historical Games', icon: Gamepad2, color: 'bg-yellow-500', description: 'Immersive simulations' },
        { id: '8', name: 'Artifact Gallery', icon: Camera, color: 'bg-pink-500', description: 'Explore ancient objects' },
        { id: '9', name: 'War & Conflict', icon: Target, color: 'bg-cyan-500', description: 'Military history' },
        { id: '10', name: 'Art History', icon: Palette, color: 'bg-teal-500', description: 'Cultural expressions' },
        { id: '11', name: 'Historical Fiction', icon: BookCopy, color: 'bg-rose-500', description: 'Stories from the past' },
        { id: '12', name: 'Ancient Civilizations', icon: Globe, color: 'bg-lime-500', description: 'Early societies' },
        { id: '13', name: 'Modern History', icon: BookOpen, color: 'bg-amber-500', description: '20th-21st century' },
        { id: '14', name: 'Historical Movies', icon: Film, color: 'bg-violet-500', description: 'Period dramas' },
        { id: '15', name: 'Primary Sources', icon: FileText, color: 'bg-fuchsia-500', description: 'Original documents' },
        { id: '16', name: 'Virtual Tours', icon: Headset, color: 'bg-sky-500', description: 'Explore historical sites' }
      ]
    },
    technology: {
      title: 'Technology',
      icon: Laptop,
      color: 'bg-cyan-500',
      resources: [
        { id: '1', name: 'Coding Tutorials', icon: FileText, color: 'bg-blue-500', description: 'Learn programming basics' },
        { id: '2', name: 'Interactive Projects', icon: Laptop, color: 'bg-cyan-500', description: 'Build real applications' },
        { id: '3', name: 'Video Lessons', icon: Play, color: 'bg-red-500', description: 'Step-by-step guidance' },
        { id: '4', name: 'Logic Training', icon: Brain, color: 'bg-purple-500', description: 'Computational thinking' },
        
        { id: '5', name: 'Practice Challenges', icon: Target, color: 'bg-green-500', description: 'Code exercises' },
        { id: '6', name: 'Tech Concepts', icon: BookOpen, color: 'bg-orange-500', description: 'Understand fundamentals' },
        { id: '7', name: 'Programming Games', icon: Gamepad2, color: 'bg-yellow-500', description: 'Learn through play' },
        { id: '8', name: 'Code Editor', icon: Code, color: 'bg-pink-500', description: 'Write and test code' },
        { id: '9', name: 'Design Tools', icon: Palette, color: 'bg-indigo-500', description: 'UI/UX design' },
        { id: '10', name: 'Web Development', icon: Laptop, color: 'bg-teal-500', description: 'Build websites' },
        { id: '11', name: 'Mobile Apps', icon: Laptop, color: 'bg-rose-500', description: 'Create mobile apps' },
        { id: '12', name: 'Database Basics', icon: BookOpen, color: 'bg-lime-500', description: 'Data management' },
        { id: '13', name: 'Algorithm Training', icon: Brain, color: 'bg-amber-500', description: 'Problem-solving patterns' },
        { id: '14', name: 'Tech Talks', icon: Film, color: 'bg-violet-500', description: 'Industry insights' },
        { id: '15', name: 'Code Repository', icon: FileText, color: 'bg-fuchsia-500', description: 'Sample projects' },
        { id: '16', name: 'Live Coding Sessions', icon: Headset, color: 'bg-sky-500', description: 'Learn from experts' }
      ]
    }
  };
  
  return configs[type] || configs.language;
};

const CourseDashboard: React.FC<CourseDashboardProps> = ({ courseType, onBack }) => {
  const config = getCourseConfig(courseType);
  const IconComponent = config.icon;
  
  // NEW: State for course content view
  const [showCourseContent, setShowCourseContent] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');

  const handleResourceClick = async (resource: TutoringResource) => {
    try {
      // NEW: If resource is a course, show course content
      if (resource.category === 'Courses') {
        setSelectedCourseId(resource.id);
        setSelectedCourseName(resource.name);
        setShowCourseContent(true);
        return;
      }

      alert(`Opening ${resource.name}...`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to open resource');
    }
  };

  const handleBackFromCourseContent = () => {
    setShowCourseContent(false);
    setSelectedCourseId(null);
  };

  // NEW: If showing course content, render CourseContentView
  if (showCourseContent && selectedCourseId) {
    return (
      <CourseContentView
        courseId={selectedCourseId}
        courseName={selectedCourseName}
        onBack={handleBackFromCourseContent}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      {/* Course Header */}
      <div className={`${config.color} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg`}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Back to Courses</span>
        </button>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{config.title}</h2>
            <p className="text-white/90 text-xs sm:text-sm mt-1">Explore learning resources tailored for this subject</p>
          </div>
        </div>
      </div>
      
      {/* Tutoring Resources Grid */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Tutoring Resources</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {config.resources.map((resource) => {
            const ResourceIcon = resource.icon;
            return (
              <button
                key={resource.id}
                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-100"
                onClick={() => handleResourceClick(resource)}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${resource.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3`}>
                  <ResourceIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">{resource.name}</span>
                <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-1 line-clamp-2">{resource.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Course Progress Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 font-medium">Lessons Completed</span>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">12 / 45</p>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '27%' }}></div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700 font-medium">Current Level</span>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-900">Intermediate</p>
            <p className="text-xs text-green-700 mt-1">Level 3 of 5</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-700 font-medium">Time Invested</span>
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-purple-900">24.5 hrs</p>
            <p className="text-xs text-purple-700 mt-1">This month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;