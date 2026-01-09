import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Headphones, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  Film,
  Clock,
  Video,
  Calendar,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  courseContentService, 
  CourseTitle, 
  CourseContentItem 
} from '../../../services/courseContentService';
import { CourseOption } from './CourseSelectionCard';
import { supabase } from '../../../lib/supabase';
interface CourseContentViewProps {
  course: CourseOption;
  onClose: () => void;
  realCourseId?: string;
}
interface CourseDetails {
  id: string;
  title: string;
  description: string | null;
  courseType: string | null;
  lessonType: string | null;
  difficultyLevel: string | null;
  language: string | null;
  estimatedDurationMinutes: number | null;
  xpReward: number | null;
}
// Session data structure for course schedule
interface CourseSession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'past';
  description: string;
  instructor: string;
}

// LMS Helper Card Type
interface LMSHelper {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  hasNewContent: boolean;
  count?: number;
}

const CourseContentView: React.FC<CourseContentViewProps> = ({ 
  course, 
  onClose,
  realCourseId 
}) => {
  const { user } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [titles, setTitles] = useState<(CourseTitle & { contentItems?: CourseContentItem[]; expanded?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [courseDetailsError, setCourseDetailsError] = useState<string | null>(null);
  const [activeSessionTab, setActiveSessionTab] = useState<'upcoming' | 'live' | 'past'>('upcoming');

  // FIX: Add proper session data with filtering logic
  const [sessions] = useState<CourseSession[]>([
    {
      id: '1',
      title: 'Introduction to Alphabet',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      status: 'upcoming',
      description: 'Learn basic alphabet characters and pronunciation',
      instructor: 'Teacher Abebe'
    },
    {
      id: '2',
      title: 'Grammar Fundamentals',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      status: 'upcoming',
      description: 'Understanding sentence structure and grammar rules',
      instructor: 'Teacher Meseret'
    },
    {
      id: '3',
      title: 'Live Q&A Session',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
      endTime: new Date(Date.now() + 30 * 60 * 1000), // Ends in 30 mins
      status: 'live',
      description: 'Interactive Q&A with the instructor',
      instructor: 'Teacher Kidus'
    },
    {
      id: '4',
      title: 'Conversation Practice',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: 'past',
      description: 'Practice real-world conversations',
      instructor: 'Teacher Solomon'
    },
    {
      id: '5',
      title: 'Writing Workshop',
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: 'past',
      description: 'Improve your writing skills',
      instructor: 'Teacher Hannah'
    }
  ]);

  // LMS Helper Cards with red dot indicators
  const [lmsHelpers, setLmsHelpers] = useState<LMSHelper[]>([
    { id: 'audio', name: 'Audio', icon: Headphones, color: 'bg-blue-500', hasNewContent: true, count: 3 },
    { id: 'video', name: 'Video', icon: Play, color: 'bg-red-500', hasNewContent: true, count: 5 },
    { id: 'notes', name: 'Notes', icon: FileText, color: 'bg-green-500', hasNewContent: false, count: 8 },
    { id: 'assignments', name: 'Assignments', icon: CheckSquare, color: 'bg-purple-500', hasNewContent: true, count: 2 },
    { id: 'homework', name: 'Homework', icon: BookOpen, color: 'bg-yellow-500', hasNewContent: false, count: 4 },
    { id: 'movies', name: 'Movies', icon: Film, color: 'bg-indigo-500', hasNewContent: true, count: 1 }
  ]);

  useEffect(() => {
    const courseLookupId = realCourseId || course.id;

    if (courseLookupId) {
      loadCourseHierarchy(courseLookupId);
    } else {
      setLoading(false);
      setError('Course not found in database');
    }
  }, [course.id, realCourseId]);

  useEffect(() => {
    const courseLookupId = realCourseId || course.id;

    if (!courseLookupId) {
      setCourseDetails(null);
      setCourseDetailsError('We could not locate this course. Please select another course to continue.');
      return;
    }

    let isMounted = true;

    const loadCourseDetails = async () => {
      try {
        setCourseDetailsError(null);
        const { data, error: detailsError } = await supabase
          .from('courses')
          .select('id, title, description, course_type, lesson_type, difficulty_level, language, estimated_duration_minutes, xp_reward')
          .eq('id', courseLookupId)
          .maybeSingle();

        if (detailsError) throw detailsError;

        if (!data) {
          if (isMounted) {
            setCourseDetails(null);
            setCourseDetailsError(
              'We could not find this course in the database. It may have been removed or renamed. Please pick another course or contact support.'
            );
          }
          return;
        }

        if (isMounted) {
          setCourseDetails({
            id: data.id,
            title: data.title,
            description: data.description ?? null,
            courseType: data.course_type ?? null,
            lessonType: data.lesson_type ?? null,
            difficultyLevel: data.difficulty_level ?? null,
            language: data.language ?? null,
            estimatedDurationMinutes: data.estimated_duration_minutes ?? null,
            xpReward: data.xp_reward ?? null
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setCourseDetails(null);
          setCourseDetailsError(
            err?.message || 'Unable to load course details. Please try again or select a different course.'
          );
        }
      }
    };

    loadCourseDetails();

    return () => {
      isMounted = false;
    };
  }, [course.id, realCourseId]);

  // Click outside to close functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const loadCourseHierarchy = async (courseLookupId: string) => {
    if (!courseLookupId) {
      setError('Course not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!courseContentService || typeof courseContentService.getCourseWithHierarchy !== 'function') {
        throw new Error('Course content service is not available');
      }
      
      const data = await courseContentService.getCourseWithHierarchy(courseLookupId);
      setTitles(data.map((t: any) => ({ ...t, expanded: false })));
    } catch (err: any) {
      console.error('Error loading course hierarchy:', err);
      setError(err.message || 'Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const toggleTitleExpansion = (titleId: string) => {
    setTitles(titles.map(t => 
      t.id === titleId ? { ...t, expanded: !t.expanded } : t
    ));
  };

  // FIX: Filter sessions by active tab
  const filteredSessions = sessions.filter(s => s.status === activeSessionTab);

  // Helper to format time
  const formatSessionTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Helper to format date
  const formatSessionDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // FIX: Join classroom handler
  const handleJoinClassroom = (sessionId: string, status: string) => {
    if (status === 'live') {
      // TODO: Navigate to virtual classroom
      alert('Opening live classroom...');
    } else if (status === 'upcoming') {
      alert('This session hasn\'t started yet. You\'ll be able to join when it goes live.');
    } else {
      alert('View recording of this session');
    }
  };

  const handleLMSCardClick = (helperId: string) => {
    console.log('Opening LMS section:', helperId);
  };

  return (
    <div 
      ref={sidebarRef}
      className="h-full flex flex-col bg-white animate-slide-in-right"
    >
      {/* Header with Close Button */}
      <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{courseDetails?.title || course.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
         <p className="text-orange-100 text-sm">
          {courseDetails?.description || course.description || 'No course description available yet.'}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {courseDetailsError && (
          <div className="px-6 pt-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {courseDetailsError}
            </div>
          </div>
        )}

        <div className="px-6 pt-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">Course Overview</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Course Type</span>
                <span className="capitalize">{courseDetails?.courseType || course.type || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Lesson Type</span>
                <span className="capitalize">{courseDetails?.lessonType || course.lessonType || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Difficulty</span>
                <span className="capitalize">
                  {courseDetails?.difficultyLevel || course.difficulty || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Language</span>
                <span>{courseDetails?.language || course.language || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Estimated Duration</span>
                <span>
                  {courseDetails?.estimatedDurationMinutes
                    ? `${courseDetails.estimatedDurationMinutes} min`
                    : course.estimatedDurationMinutes
                      ? `${course.estimatedDurationMinutes} min`
                      : course.estimatedTime || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">XP Reward</span>
                <span>{courseDetails?.xpReward ?? course.xpReward ?? 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
        {/* FIX: NEW Session Tabs Section - Coursera style */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Live Classes</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveSessionTab('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeSessionTab === 'upcoming' ?'bg-orange-500 text-white shadow-md' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Upcoming
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  {sessions.filter(s => s.status === 'upcoming').length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveSessionTab('live')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeSessionTab === 'live' ?'bg-red-500 text-white shadow-md' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live Now
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  {sessions.filter(s => s.status === 'live').length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveSessionTab('past')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeSessionTab === 'past' ?'bg-gray-700 text-white shadow-md' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video className="w-4 h-4" />
                Past Sessions
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  {sessions.filter(s => s.status === 'past').length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* FIX: Session Cards Section with Join Classroom buttons */}
        <div className="p-6 space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No {activeSessionTab} sessions</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-5 rounded-xl border-2 transition-all ${
                  session.status === 'live' ?'border-red-500 bg-red-50 shadow-lg'
                    : session.status === 'upcoming' ?'border-orange-300 bg-orange-50' :'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Session header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{session.title}</h4>
                      {session.status === 'live' && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{session.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatSessionTime(session.startTime)} - {formatSessionTime(session.endTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatSessionDate(session.startTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Instructor:</strong> {session.instructor}
                    </p>
                  </div>
                </div>

                {/* FIX: Join/View button based on status */}
                <button
                  onClick={() => handleJoinClassroom(session.id, session.status)}
                  className={`w-full px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    session.status === 'live' ?'bg-red-500 text-white hover:bg-red-600 shadow-md'
                      : session.status === 'upcoming' ?'bg-orange-500 text-white hover:bg-orange-600' :'bg-gray-700 text-white hover:bg-gray-800'
                  }`}
                >
                  {session.status === 'live' ? (
                    <>
                      <Video className="w-5 h-5" />
                      Join Classroom Now
                    </>
                  ) : session.status === 'upcoming' ? (
                    <>
                      <Calendar className="w-5 h-5" />
                      Set Reminder
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      View Recording
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* FIX: AI Insights Section - NEW */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border-2 border-purple-300">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">AI Insights</h4>
                <p className="text-sm text-gray-700">
                  Based on your learning patterns, we recommend focusing on conversation practice. 
                  Your comprehension is strong, but speaking confidence could improve.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                View Detailed Analysis
              </button>
            </div>
          </div>
        </div>

        {/* FIX: Coursera-Style Expandable Course Outline */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            Course Materials
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading course content...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          ) : titles.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No course content available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {titles.map((title, index) => (
                <div key={title.id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all overflow-hidden">
                  <button
                    onClick={() => toggleTitleExpansion(title.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Coursera-style module number */}
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-gray-900">{title.title}</h4>
                        {title.description && (
                          <p className="text-sm text-gray-600 mt-1">{title.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {title.contentItems?.length || 0} items
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            title.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {title.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {title.expanded ? 
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    }
                  </button>

                  {/* FIX: Coursera-style expandable content with proper spacing */}
                  {title.expanded && title.contentItems && title.contentItems.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-4 space-y-2">
                        {title.contentItems.map((item, itemIndex) => (
                          <button
                            key={item.id}
                            className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all group"
                          >
                            {/* Content type icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              item.contentType === 'video' ? 'bg-red-100' :
                              item.contentType === 'audio' ? 'bg-blue-100' :
                              item.contentType === 'reading' ? 'bg-green-100' :
                              item.contentType === 'interactive'? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              {item.contentType === 'video' && <Play className="w-5 h-5 text-red-600" />}
                              {item.contentType === 'audio' && <Headphones className="w-5 h-5 text-blue-600" />}
                              {item.contentType === 'reading' && <FileText className="w-5 h-5 text-green-600" />}
                              {item.contentType === 'interactive' && <CheckSquare className="w-5 h-5 text-purple-600" />}
                              {!['video', 'audio', 'reading', 'interactive'].includes(item.contentType) && (
                                <BookOpen className="w-5 h-5 text-gray-600" />
                              )}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                              <h5 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                                {itemIndex + 1}. {item.title}
                              </h5>
                              {item.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 capitalize">
                                  {item.contentType}
                                </span>
                                {item.estimatedMinutes && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">
                                      {item.estimatedMinutes} min
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Play/View button */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-orange-100 group-hover:bg-orange-500 flex items-center justify-center transition-colors">
                                <Play className="w-4 h-4 text-orange-600 group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Tools Section - Keep as is */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Tools</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {lmsHelpers.map((helper) => (
              <button
                key={helper.id}
                onClick={() => handleLMSCardClick(helper.id)}
                className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-orange-400 transition-all group"
              >
                {helper.hasNewContent && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
                
                <div className={`w-12 h-12 ${helper.color} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                  <helper.icon className="w-6 h-6 text-white" />
                </div>
                
                <p className="text-sm font-medium text-gray-900 text-center mb-1">
                  {helper.name}
                </p>
                
                {helper.count !== undefined && (
                  <p className="text-xs text-gray-600 text-center">
                    {helper.count} items
                  </p>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-xs text-gray-700">
                Red dot = New material released
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentView;