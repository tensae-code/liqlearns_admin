import React, { useState, useEffect } from 'react';
import { BookOpen, Star, TrendingUp, Award, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  course_type: string;
  difficulty_level: string;
  estimated_duration_minutes: number;
  xp_reward: number;
  is_active: boolean;
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  progress_percentage: number;
  is_completed: boolean;
  last_accessed_at: string;
  courses: Course;
}

const EnhancedCourseManagementHub: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchEnrollments();
      fetchRecommendedCourses();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('student_id', user?.id)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedCourses = async () => {
    try {
      // Get enrolled course IDs
      const { data: enrolledData } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', user?.id);

      const enrolledIds = enrolledData?.map(e => e.course_id) || [];

      // Fetch recommended courses (not enrolled yet)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', enrolledIds.length > 0 ? `(${enrolledIds.join(',')})` : '(00000000-0000-0000-0000-000000000000)')
        .limit(6);

      if (error) throw error;
      setRecommendedCourses(data || []);
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
    }
  };

  const handleEnrollment = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          student_id: user?.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0,
          is_completed: false,
          last_accessed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh data
      await Promise.all([fetchEnrollments(), fetchRecommendedCourses()]);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <BookOpen className="w-24 h-24 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Start Your Learning Journey</h2>
          <p className="text-lg text-gray-600 mb-6">
            You haven't enrolled in any courses yet. Explore our curated selection below and begin mastering new skills today!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Personalized Learning</h3>
            <p className="text-sm text-gray-600">Courses tailored to your skill level and learning pace</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <Award className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Earn Certificates</h3>
            <p className="text-sm text-gray-600">Complete courses and showcase your achievements</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <Star className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Expert Instructors</h3>
            <p className="text-sm text-gray-600">Learn from industry professionals and educators</p>
          </div>
        </div>

        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          Browse Courses Below
        </button>
      </div>
    </div>
  );

  const CourseCard: React.FC<{ enrollment: CourseEnrollment }> = ({ enrollment }) => {
    const { courses: course } = enrollment;
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.round(course.estimated_duration_minutes / 60)}h</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{course.xp_reward} XP</span>
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  course.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                  course.difficulty_level === 'medium'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {course.difficulty_level}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="font-bold text-orange-500">{enrollment.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${enrollment.progress_percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <PlayCircle className="w-5 h-5" />
              <span className="font-medium">Continue Learning</span>
            </button>
            {enrollment.is_completed && (
              <div className="flex items-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RecommendedCourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{Math.round(course.estimated_duration_minutes / 60)}h</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{course.xp_reward} XP</span>
            </span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            course.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
            course.difficulty_level === 'medium'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
            {course.difficulty_level}
          </span>
        </div>
        <button
          onClick={() => handleEnrollment(course.id)}
          disabled={enrolling === course.id}
          className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-from-orange-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <BookOpen className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced Course Management Hub</h1>
              <p className="text-gray-600">Track your progress and discover new learning opportunities</p>
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h2>
          {enrollments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </div>

        {/* Recommended Courses Section */}
        {recommendedCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <RecommendedCourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCourseManagementHub;