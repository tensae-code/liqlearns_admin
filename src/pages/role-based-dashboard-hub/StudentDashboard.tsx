import React, { useState, useEffect } from 'react';
// ... keep all existing imports ...
import { lmsService } from '../../services/lmsService';
import { CourseSyllabus, CourseAttendance, CourseOutcome, StudentOutcomeProgress, AttendanceStats } from '../../services/lmsService';
import CourseSelectionCard from './components/CourseSelectionCard';
import StreakGiftAnimation from './components/StreakGiftAnimation';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, Target, Zap, ArrowLeft } from 'lucide-react';
import CircularProgress from './components/CircularProgress';
import EmbeddedMarketplace from '../../components/EmbeddedMarketplace';
import { useNavigate } from 'react-router-dom';






// ... keep existing imports and interfaces ...

interface StudentDashboardProps {
  activeSection?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeSection: initialSection = 'dashboard' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(initialSection);

  // ... keep all existing state declarations ...

  // NEW: LMS Feature States
  const [syllabus, setSyllabus] = useState<CourseSyllabus[]>([]);
  const [currentWeekSyllabus, setCurrentWeekSyllabus] = useState<CourseSyllabus | null>(null);
  const [attendance, setAttendance] = useState<CourseAttendance[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([]);
  const [outcomeProgress, setOutcomeProgress] = useState<StudentOutcomeProgress[]>([]);
  const [lmsLoading, setLmsLoading] = useState(false);
  const [lmsError, setLmsError] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCourseDashboard, setShowCourseDashboard] = useState(false);
  const [skillProgress, setSkillProgress] = useState<any[]>([]);
  const [realCourseIds] = useState<Record<string, string>>({});
  const [courseOptions] = useState<any[]>([]);

  // ... keep all existing state and functions ...

  const handleBackToCourseSelection = () => {
    setShowCourseDashboard(false);
    setSelectedCourse(null);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setShowCourseDashboard(true);
  };

  const getSkillColor = (skillName: string): string => {
    const colors: Record<string, string> = {
      'JavaScript': '#f7df1e',
      'React': '#61dafb',
      'TypeScript': '#3178c6',
      'Node.js': '#339933',
    };
    return colors[skillName] || '#ff6b35';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardSection();
      case 'progress':
        return renderProgressSection();
      default:
        return renderDashboardSection();
    }
  };

  // MODIFIED: Fix streak animation trigger
  useEffect(() => {
    const checkStreakAnimation = () => {
      if (!user?.id || !stats?.currentStreak) return;

      const today = new Date().toDateString();
      const lastShown = localStorage.getItem(`streak_animation_${user.id}`);

      if (lastShown !== today && stats.currentStreak > 0) {
        setTimeout(() => {
          setShowStreakAnimation(true);
          localStorage.setItem(`streak_animation_${user.id}`, today);
        }, 800);
      }
    };

    checkStreakAnimation();
  }, [user?.id, stats?.currentStreak]);

  // NEW: Load LMS data when needed
  useEffect(() => {
    const loadLMSData = async () => {
      if (!user?.id || !selectedCourse) return;

      setLmsLoading(true);
      setLmsError(null);

      try {
        const courseUUID = realCourseIds[selectedCourse] || selectedCourse;

        // Load syllabus
        const [syllabusData, currentWeek, attendanceData, stats, outcomes, progress] = await Promise.all([
          lmsService.getCourseSyllabus(courseUUID),
          lmsService.getCurrentWeekSyllabus(courseUUID),
          lmsService.getStudentAttendance(user.id, courseUUID),
          lmsService.getAttendanceStats(user.id, courseUUID),
          lmsService.getCourseOutcomes(courseUUID),
          lmsService.getStudentOutcomeProgress(user.id, courseUUID)
        ]);

        setSyllabus(syllabusData);
        setCurrentWeekSyllabus(currentWeek);
        setAttendance(attendanceData);
        setAttendanceStats(stats);
        setCourseOutcomes(outcomes);
        setOutcomeProgress(progress);
      } catch (err: any) {
        console.error('Error loading LMS data:', err);
        setLmsError(err?.message || 'Failed to load LMS features');
      } finally {
        setLmsLoading(false);
      }
    };

    if (activeSection === 'progress' && selectedCourse && showCourseDashboard) {
      loadLMSData();
    }
  }, [user?.id, selectedCourse, activeSection, showCourseDashboard, realCourseIds]);

  // MODIFIED: Add streak card click handler
  const handleStreakCardClick = () => {
    if (stats?.currentStreak && stats.currentStreak > 0) {
      setShowStreakAnimation(true);
    }
  };

  // ... keep all existing functions ...

  // NEW: Render Syllabus Section
  const renderSyllabusSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          Course Syllabus
        </h3>
      </div>

      {lmsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : syllabus.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No syllabus available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentWeekSyllabus && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-300 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                  Current Week
                </span>
                <span className="text-gray-600">Week {currentWeekSyllabus.weekNumber}</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{currentWeekSyllabus.title}</h4>
              <p className="text-gray-700 mb-4">{currentWeekSyllabus.description}</p>
              
              {currentWeekSyllabus.topics.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-semibold text-gray-800 mb-2">Topics Covered:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {currentWeekSyllabus.topics.map((topic, idx) => (
                      <li key={idx} className="text-gray-700">{topic}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentWeekSyllabus.learningObjectives.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-semibold text-gray-800 mb-2">Learning Objectives:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {currentWeekSyllabus.learningObjectives.map((obj, idx) => (
                      <li key={idx} className="text-gray-700">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentWeekSyllabus.assignmentsDue.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Assignments Due:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {currentWeekSyllabus.assignmentsDue.map((assignment, idx) => (
                      <li key={idx} className="text-orange-600 font-medium">{assignment}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {syllabus.map((week) => (
            <div key={week.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-900">Week {week.weekNumber}: {week.title}</h4>
                {week.startDate && week.endDate && (
                  <span className="text-sm text-gray-600">
                    {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-3">{week.description}</p>
              
              {week.topics.length > 0 && (
                <div className="mb-2">
                  <span className="font-semibold text-gray-800">Topics: </span>
                  <span className="text-gray-700">{week.topics.join(', ')}</span>
                </div>
              )}

              {week.requiredReadings.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-800">Required Readings: </span>
                  <span className="text-gray-700">{week.requiredReadings.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // NEW: Render Attendance Section
  const renderAttendanceSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Attendance Tracking
        </h3>
      </div>

      {lmsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          {attendanceStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalClasses}</p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Present</p>
                <p className="text-2xl font-bold text-green-600">{attendanceStats.attended}</p>
              </div>
              <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Absent</p>
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
              </div>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</p>
              </div>
            </div>
          )}

          {attendance.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No attendance records yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.attendanceDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                            record.status === 'late'? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.durationMinutes} min
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // NEW: Render Outcomes Section
  const renderOutcomesSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-500" />
          Course Outcomes & Mastery
        </h3>
      </div>

      {lmsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : outcomeProgress.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No outcomes defined yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {outcomeProgress.map((progress) => (
            <div key={progress.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-orange-600">
                      Outcome #{progress.outcome?.outcomeNumber}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      progress.outcome?.category === 'knowledge' ? 'bg-blue-100 text-blue-800' :
                      progress.outcome?.category === 'skills' ? 'bg-green-100 text-green-800' :
                      progress.outcome?.category === 'abilities' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {progress.outcome?.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{progress.outcome?.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{progress.outcome?.description}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Mastery Level</span>
                  <span className="text-sm font-bold text-orange-600">{progress.masteryLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      progress.masteryLevel >= 80 ? 'bg-green-500' :
                      progress.masteryLevel >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${progress.masteryLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Evidence Count */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{progress.evidenceCount} evidence items</span>
                </div>
                {progress.lastAssessedAt && (
                  <span>Last assessed: {new Date(progress.lastAssessedAt).toLocaleDateString()}</span>
                )}
              </div>

              {/* Mastery Criteria */}
              {progress.outcome?.masteryCriteria && progress.outcome.masteryCriteria.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Mastery Criteria:</h5>
                  <ul className="space-y-1">
                    {progress.outcome.masteryCriteria.map((criteria, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // MODIFIED: Update renderDashboardSection to embed marketplace directly
  const renderDashboardSection = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white p-4 sm:p-6 lg:p-8">
        {/* Stats Cards Grid with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Enrolled Courses Stat */}
          <div className="card-hover bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Enrolled</h3>
              </div>
              <div className="text-2xl font-bold text-orange-500">0</div>
            </div>
            <p className="text-sm text-gray-600">Active courses</p>
          </div>

          {/* Completed Lessons Stat */}
          <div className="card-hover bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              </div>
              <div className="text-2xl font-bold text-orange-500">0</div>
            </div>
            <p className="text-sm text-gray-600">Lessons finished</p>
          </div>

          {/* Streak Stat */}
          <div className="card-hover bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Streak</h3>
              </div>
              <div className="text-2xl font-bold text-orange-500">{stats?.currentStreak || 0}</div>
            </div>
            <p className="text-sm text-gray-600">Day streak</p>
          </div>

          {/* Attendance Stat */}
          <div className="card-hover bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
              </div>
              <div className="text-2xl font-bold text-orange-500">{attendanceStats?.attendanceRate || 0}%</div>
            </div>
            <p className="text-sm text-gray-600">Attendance rate</p>
          </div>
        </div>

        {/* Day Streak Card */}
        <div 
          className="card-hover bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg p-6 cursor-pointer mb-8"
          onClick={handleStreakCardClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1">Day Streak</p>
              <div className="flex items-center gap-2">
                <Zap className="w-8 h-8 text-white" />
                <span className="text-4xl font-bold text-white">{stats?.currentStreak || 0}</span>
              </div>
            </div>
            <div className="text-white text-opacity-80 text-sm">
              Click to celebrate! 🎉
            </div>
          </div>
        </div>

        {/* Embedded Marketplace Section */}
        <div className="mt-12">
          <EmbeddedMarketplace isEmbedded={true} />
        </div>
      </div>
    );
  };

  // MODIFIED: Update renderProgressSection to include new LMS tabs
  const renderProgressSection = () => {
    const [progressTab, setProgressTab] = useState<'skills' | 'syllabus' | 'attendance' | 'outcomes'>('skills');

    return (
      <div className="space-y-6">
        {selectedCourse && showCourseDashboard && (
          <>
            <button
              onClick={handleBackToCourseSelection}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course Selection
            </button>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setProgressTab('skills')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    progressTab === 'skills' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Skills Progress
                </button>
                <button
                  onClick={() => setProgressTab('syllabus')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    progressTab === 'syllabus' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Syllabus
                </button>
                <button
                  onClick={() => setProgressTab('attendance')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    progressTab === 'attendance' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setProgressTab('outcomes')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    progressTab === 'outcomes' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Outcomes
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {lmsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {lmsError}
              </div>
            )}

            {progressTab === 'skills' && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {skillProgress && skillProgress.length > 0 ? (
                  skillProgress.map((skill) => (
                    <CircularProgress
                      key={skill.skillName}
                      progress={skill.progress}
                      skillName={skill.skillName}
                      color={getSkillColor(skill.skillName)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600">No skill progress data available</p>
                  </div>
                )}
              </div>
            )}

            {progressTab === 'syllabus' && renderSyllabusSection()}
            {progressTab === 'attendance' && renderAttendanceSection()}
            {progressTab === 'outcomes' && renderOutcomesSection()}
          </>
        )}

        {(!selectedCourse || !showCourseDashboard) && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Choose Your Learning Path</h3>
            <p className="text-gray-600 mb-6">Select a course to view detailed progress</p>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {courseOptions.map((course) => (
                <CourseSelectionCard
                  key={course.id}
                  course={course}
                  onSelect={() => handleCourseSelect(course.id)}
                  isSelected={selectedCourse === course.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ... keep all other existing functions and render methods ...

  return (
    <>
      <StreakGiftAnimation
        streak={stats?.currentStreak || 0}
        show={showStreakAnimation}
        onComplete={() => setShowStreakAnimation(false)}
      />
      {renderContent()}
    </>
  );
};

export default StudentDashboard;