import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users2, Award, Clock, BookOpen, Zap, Gift, Heart, LogOut, FileText, BarChart3, MessageSquare, CheckSquare, UserCheck, FolderOpen, User, Trophy, Target, Star, Calendar } from 'lucide-react';

import StreakGiftAnimation from './role-based-dashboard-hub/components/StreakGiftAnimation';
import { lmsService, LMSSyllabus, LMSAttendance, LMSOutcome } from '../services/lmsService';
import VideoCallGrid from '../components/VideoCallGrid';
import StudyRoomChat from '../components/StudyRoomChat';
import { studyRoomService, StudyRoom, StudyRoomParticipant } from '../services/studyRoomService';
import Icon from '../components/AppIcon';
import { VirtualClassroomHub } from './role-based-dashboard-hub/components/VirtualClassroomHub';
import CourseContentView from './role-based-dashboard-hub/components/CourseContentView';
import StatCardModal from '../components/StatCardModal';
import HelpCenter from './role-based-dashboard-hub/components/HelpCenter';
import StudyRoomHub from '../components/StudyRoomHub';






interface StudentDashboardProps {
  activeSection?: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  icon: string;
}

interface ProgressStat {
  label: string;
  value: number;
  total: number;
  color: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeSection = 'dashboard' }) => {
  const { user, signOut } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [activeView, setActiveView] = useState<string>(activeSection);
  const [lmsActiveTab, setLmsActiveTab] = useState<'assignments' | 'grades' | 'discussions' | 'quizzes' | 'attendance' | 'syllabus' | 'files' | 'people' | 'analytics'>('assignments');

  // Study Room State
  const [availableRooms, setAvailableRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<StudyRoomParticipant[]>([]);
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  // LMS Data State
  const [syllabusSections, setSyllabusSections] = useState<LMSSyllabus[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<LMSAttendance[]>([]);
  const [outcomesList, setOutcomesList] = useState<LMSOutcome[]>([]);
  const [loadingLMSData, setLoadingLMSData] = useState(false);

  // Additional states for the new features
  const [stats, setStats] = useState<any>({ current_streak: 0, total_lessons: 0, unlocked_badges: 0, total_xp: 0, longst_streak: 0 });
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [showAddMissionModal, setShowAddMissionModal] = useState(false);
  const [missionError, setMissionError] = useState('');
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<any[]>([]);
  const [skillProgress, setSkillProgress] = useState<any[]>([]);
  const [showStatCardModal, setShowStatCardModal] = useState(false);
  const [selectedStatCard, setSelectedStatCard] = useState('');
  const [showAchievements, setShowAchievements] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchStudentData();
      checkStreakAnimation();
    }
  }, [user?.id]);

  // Load LMS data when LMS tab is active
  useEffect(() => {
    if (user?.id && activeView === 'lms' && selectedCourse) {
      loadLMSData(selectedCourse.id);
    }
  }, [user?.id, activeView, lmsActiveTab, selectedCourse]);

  // Load Study Rooms when Study Room tab is active
  useEffect(() => {
    if (user?.id && activeView === 'study-rooms') {
      loadAvailableRooms();
    }
  }, [user?.id, activeView]);

  // Subscribe to room participants
  useEffect(() => {
    if (!currentRoom) return;

    const subscription = studyRoomService.subscribeToRoom(
      currentRoom.id,
      () => loadRoomParticipants(currentRoom.id)
    );

    return () => subscription.unsubscribe();
  }, [currentRoom]);

  const checkStreakAnimation = () => {
    const lastLogin = localStorage.getItem(`lastLogin_${user?.id}`);
    const today = new Date().toDateString();

    if (lastLogin !== today) {
      setShowStreakAnimation(true);
      localStorage.setItem(`lastLogin_${user?.id}`, today);
      
      setTimeout(() => {
        setShowStreakAnimation(false);
      }, 4000);
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          progress_percentage,
          courses (
            id,
            title,
            description,
            course_type
          )
        `)
        .eq('student_id', user?.id);

      if (enrollError) throw enrollError;

      if (enrollments) {
        const formattedCourses = await Promise.all(
          enrollments.map(async (enrollment: any) => {
            const { data: lessonProgress } = await supabase
              .from('student_lesson_progress')
              .select('id, is_completed')
              .eq('student_id', user?.id);

            const completedLessons = lessonProgress?.filter((p: any) => p.is_completed).length || 0;
            const totalLessons = lessonProgress?.length || 0;

            return {
              id: enrollment.courses.id,
              name: enrollment.courses.title,
              description: enrollment.courses.description,
              progress: enrollment.progress_percentage || 0,
              totalLessons,
              completedLessons,
              icon: enrollment.courses.course_type === 'language' ? '🌍' : 
                    enrollment.courses.course_type === 'mathematics' ? '🔢' : '🔬'
            };
          })
        );

        setCourses(formattedCourses);
        if (formattedCourses.length > 0) {
          setSelectedCourse(formattedCourses[0]);
        }
      }

      // Fetch student progress and streak
      const { data: progress } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user?.id);

      const { data: streak } = await supabase
        .from('student_streaks')
        .select('current_streak')
        .eq('student_id', user?.id)
        .single();

      if (streak) {
        setCurrentStreak(streak.current_streak);
      }

      if (progress) {
        const statsArr: ProgressStat[] = progress.map((p: any) => ({
          label: p.skill_type,
          value: p.progress_percentage,
          total: 100,
          color: getSkillColor(p.skill_type)
        }));
        setProgressStats(statsArr);
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLMSData = async (courseId: string) => {
    if (!user?.id) return;
    
    setLoadingLMSData(true);
    try {
      if (lmsActiveTab === 'syllabus') {
        const data = await lmsService.getCourseSyllabus(courseId);
        setSyllabusSections(data);
      } else if (lmsActiveTab === 'attendance') {
        const data = await lmsService.getStudentAttendance(user.id, courseId);
        setAttendanceRecords(data);
      } else if (lmsActiveTab === 'analytics') {
        const data = await lmsService.getStudentOutcomes(user.id, courseId);
        setOutcomesList(data);
      }
    } catch (error) {
      console.error('Error loading LMS data:', error);
    } finally {
      setLoadingLMSData(false);
    }
  };

  const loadAvailableRooms = async () => {
    if (!user?.id) return;

    setLoadingRooms(true);
    setRoomError(null);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('date_of_birth')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.date_of_birth) {
        setRoomError('Please set your date of birth in settings to join study rooms.');
        return;
      }

      const rooms = await studyRoomService.getAgeAppropriateRooms(profile.date_of_birth);
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRoomError('Failed to load study rooms. Please try again.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadRoomParticipants = async (roomId: string) => {
    try {
      const participants = await studyRoomService.getRoomParticipants(roomId);
      setRoomParticipants(participants);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newRoomName.trim()) return;

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('date_of_birth')
        .eq('id', user.id)
        .single();

      if (!profile?.date_of_birth) {
        alert('Please set your date of birth in settings first.');
        return;
      }

      await studyRoomService.createStudyRoom(newRoomName.trim(), profile.date_of_birth);
      setNewRoomName('');
      setShowCreateRoom(false);
      await loadAvailableRooms();
      alert('Study room created successfully!');
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = async (room: StudyRoom) => {
    if (!user?.id) return;

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      const currentCourse = selectedCourse?.name || null;

      const participant = await studyRoomService.joinStudyRoom(
        room.id,
        user.id,
        profile?.full_name || user.email || 'Student',
        profile?.avatar_url || null,
        currentCourse
      );

      setCurrentRoom(room);
      setCurrentParticipantId(participant.id);
      await loadRoomParticipants(room.id);
    } catch (error: any) {
      console.error('Error joining room:', error);
      if (error.message?.includes('duplicate')) {
        alert('You are already in this room!');
      } else {
        alert('Failed to join room. Please try again.');
      }
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentParticipantId) return;

    try {
      await studyRoomService.leaveStudyRoom(currentParticipantId);
      setCurrentRoom(null);
      setCurrentParticipantId(null);
      setRoomParticipants([]);
      await loadAvailableRooms();
    } catch (error) {
      console.error('Error leaving room:', error);
      alert('Failed to leave room. Please try again.');
    }
  };

  const handleMediaToggle = async (cameraEnabled: boolean, micEnabled: boolean) => {
    if (!currentParticipantId) return;

    try {
      await studyRoomService.updateMediaSettings(currentParticipantId, cameraEnabled, micEnabled);
    } catch (error) {
      console.error('Error updating media settings:', error);
    }
  };

  const handleSendGift = async (toUserId: string) => {
    if (!user?.id || !currentRoom) return;

    try {
      await studyRoomService.sendInteraction(currentRoom.id, user.id, toUserId, 'gift', 10);
      alert('Gift sent! 🎁');
    } catch (error) {
      console.error('Error sending gift:', error);
      alert('Failed to send gift. Please try again.');
    }
  };

  const handleSendLike = async (toUserId: string) => {
    if (!user?.id || !currentRoom) return;

    try {
      await studyRoomService.sendInteraction(currentRoom.id, user.id, toUserId, 'like', 0);
    } catch (error) {
      console.error('Error sending like:', error);
    }
  };

  const getSkillColor = (skillType: string): string => {
    const colors: { [key: string]: string } = {
      listening: '#10B981',
      speaking: '#F59E0B',
      reading: '#3B82F6',
      writing: '#8B5CF6'
    };
    return colors[skillType] || '#6B7280';
  };

  const handleStatCardClick = (type: string) => {
    setSelectedStatCard(type);
    setShowStatCardModal(true);
  };

  const handleCloseStatModal = () => {
    setShowStatCardModal(false);
    setSelectedStatCard('');
  };

  const handleCloseCourseDetails = () => {
    setShowCourseDetails(false);
    setSelectedCourseDetails(null);
  };

  const handleMissionStart = (mission: any) => {
    console.log('Starting mission:', mission);
    // Implement mission start logic
  };

  const loadDashboardData = () => {
    fetchStudentData();
  };

  const getCalendarDayActivity = (date: string) => {
    return calendarEvents.some(event => 
      event.date === date && event.lessons_completed > 0
    );
  };

  const renderDashboard = () => renderDashboardSection();
  const renderProgressSection = () => <div>Progress Section</div>;
  const renderEarnersSection = () => <div>Earners Section</div>;
  const renderEventsSection = () => <div>Events Section</div>;
  const renderStoreSection = () => <div>Store Section</div>;
  const renderMarketplaceSection = () => <div>Marketplace Section</div>;
  const renderCommunitySection = () => <div>Community Section</div>;
  const renderSettingsSection = () => <div>Settings Section</div>;

  const renderLMSSection = () => {
    if (!selectedCourse) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Course Selected</h3>
          <p className="text-gray-600">Please enroll in a course to access LMS features.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* LMS Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Learning Management System</h2>
          <p className="text-blue-100">Course: {selectedCourse.name}</p>
        </div>

        {/* LMS Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {[
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'grades', label: 'Grades', icon: BarChart3 },
              { id: 'discussions', label: 'Discussions', icon: MessageSquare },
              { id: 'quizzes', label: 'Quizzes', icon: CheckSquare },
              { id: 'attendance', label: 'Attendance', icon: UserCheck },
              { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
              { id: 'files', label: 'Files', icon: FolderOpen },
              { id: 'people', label: 'People', icon: User },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLmsActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    lmsActiveTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* LMS Content Area */}
          <div className="p-6">
            {loadingLMSData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {lmsActiveTab === 'assignments' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Assignments</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No assignments available yet.</p>
                    </div>
                  </div>
                )}

                {lmsActiveTab === 'grades' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Grades</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No grades recorded yet.</p>
                    </div>
                  </div>
                )}

                {lmsActiveTab === 'discussions' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Discussions</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No discussions available yet.</p>
                    </div>
                  </div>
                )}

                {lmsActiveTab === 'quizzes' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Quizzes</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No quizzes available yet.</p>
                    </div>
                  </div>
                )}

                {lmsActiveTab === 'attendance' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Attendance Records</h3>
                    {attendanceRecords.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No attendance records yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {attendanceRecords.map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">{new Date(record.sessionDate).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-600">{record.sessionTitle}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              record.status === 'present' ? 'bg-green-100 text-green-700' :
                              record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {lmsActiveTab === 'syllabus' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Syllabus</h3>
                    {syllabusSections.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No syllabus sections available yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {syllabusSections.map((section) => (
                          <div key={section.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{section.sectionTitle}</h4>
                                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                              </div>
                              <span className="text-sm text-gray-500">Week {section.weekNumber}</span>
                            </div>
                            {section.topics && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Topics:</p>
                                <div className="flex flex-wrap gap-2">
                                  {section.topics.map((topic, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {lmsActiveTab === 'files' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Course Files</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No files uploaded yet.</p>
                    </div>
                  </div>
                )}

                {lmsActiveTab === 'people' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Classmates</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Loading classmate information...</p>
                    </div>
                  </div>
                )}

                {lmsActiveTab === 'analytics' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Learning Outcomes</h3>
                    {outcomesList.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No outcomes data available yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {outcomesList.map((outcome) => (
                          <div key={outcome.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">{outcome.outcomeName}</h4>
                              <span className="text-sm font-medium text-blue-600">{outcome.achievementPercentage}%</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{outcome.description}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${outcome.achievementPercentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStudyRoomsSection = () => {
    if (currentRoom && user) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentRoom.name}</h2>
                <p className="text-gray-600">{studyRoomService.getAgeGroupDisplayName(currentRoom.ageGroup)}</p>
              </div>
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Leave Room
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4" />
                <span>{currentRoom.currentParticipants} / {currentRoom.maxParticipants} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Started {currentRoom.startedAt ? new Date(currentRoom.startedAt).toLocaleTimeString() : 'Not started'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <VideoCallGrid
                participants={roomParticipants}
                currentUserId={user.id}
                onMediaToggle={handleMediaToggle}
              />

              <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Participants</h3>
                <div className="space-y-2">
                  {roomParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {participant.avatarUrl ? (
                          <img src={participant.avatarUrl} alt={participant.displayName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold">{participant.displayName[0].toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {participant.displayName}
                            {participant.studentId === user.id && ' (You)'}
                          </p>
                          {participant.currentCourse && <p className="text-xs text-gray-500">{participant.currentCourse}</p>}
                        </div>
                      </div>

                      {participant.studentId !== user.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendLike(participant.studentId)}
                            className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
                            title="Send like"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendGift(participant.studentId)}
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
                            title="Send gift (10 aura points)"
                          >
                            <Gift className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          <span>{participant.giftsReceived}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{participant.likesReceived}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 h-[600px]">
              <StudyRoomChat
                roomId={currentRoom.id}
                userId={user.id}
                userName={roomParticipants.find(p => p.studentId === user.id)?.displayName || 'You'}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Study Rooms</h2>
          <p className="text-purple-100">Join age-appropriate study rooms to collaborate with peers</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateRoom(!showCreateRoom)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {showCreateRoom ? 'Cancel' : 'Create New Room'}
          </button>
        </div>

        {showCreateRoom && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Create Study Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Math Study Group"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Create Room
              </button>
            </form>
          </div>
        )}

        {roomError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{roomError}</div>
        )}

        {loadingRooms && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {!loadingRooms && availableRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Users2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Study Rooms Available</h3>
            <p className="text-gray-600">Be the first to create a study room for your age group!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{room.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {room.status === 'active' ? 'Active' : 'Waiting'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users2 className="w-4 h-4" />
                    <span>{room.currentParticipants} / {room.maxParticipants} participants</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {studyRoomService.getAgeGroupDisplayName(room.ageGroup)}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinRoom(room)}
                  disabled={room.currentParticipants >= room.maxParticipants}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {room.currentParticipants >= room.maxParticipants ? 'Room Full' : 'Join Room'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDashboardSection = () => (
    <div className="space-y-6">
      {/* Welcome Card with Embedded Streak */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-orange-100 text-sm sm:text-base">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          
          {/* Embedded Streak Display */}
          <div 
            onClick={() => {
              setShowStreakAnimation(true);
              // Save to localStorage to show only once per day
              localStorage.setItem('lastStreakAnimationDate', new Date().toISOString().split('T')[0]);
            }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-all hover:scale-105 min-w-[140px]"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="text-2xl font-bold">{stats?.current_streak || 0}</span>
              </div>
              <p className="text-xs text-orange-100 font-medium">Day Streak 🔥</p>
              <p className="text-xs text-orange-200 mt-1">Click for details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Only 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Lessons */}
        <button
          onClick={() => handleStatCardClick('lessons')}
          className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm">Total Lessons</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats?.total_lessons || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1">Click to view...</p>
            </div>
          </div>
        </button>

        {/* Total Badges */}
        <button
          onClick={() => handleStatCardClick('badges')}
          className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-purple-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm">Total Badges</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats?.unlocked_badges || 0}
              </p>
              <p className="text-xs text-purple-600 mt-1">Click to view...</p>
            </div>
          </div>
        </button>

        {/* Total XP */}
        <button
          onClick={() => handleStatCardClick('xp')}
          className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-yellow-500"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-sm">Total XP</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats?.total_xp?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Click to view...</p>
            </div>
          </div>
        </button>
      </div>

      {/* Today's Quest Section with AI Suggestions */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Target className="h-7 w-7 text-white" />
            <h2 className="text-2xl font-bold text-white">Today's Quest</h2>
          </div>
          <button
            onClick={() => setShowAddMissionModal(true)}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm"
          >
            Add Mission
          </button>
        </div>

        <div className="space-y-3">
          {dailyMissions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/90 text-lg mb-2">No quests available for today</p>
              <p className="text-white/70 text-sm">Click "Add Mission for Tomorrow" to create your first quest!</p>
            </div>
          ) : (
            dailyMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white text-lg">{mission.title}</h3>
                      {mission.is_suggestion && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                          AI Suggested
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm mb-3">{mission.description}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
                        {mission.category}
                      </span>
                      <span className="flex items-center gap-1 text-white/90 text-sm">
                        <Star className="h-4 w-4 text-yellow-300" />
                        +{mission.xp_reward} XP
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {mission.is_completed ? (
                      <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm">
                        Done ✓
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleMissionStart(mission)}
                          className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm whitespace-nowrap"
                        >
                          Start Quest
                        </button>
                        {mission.deadline && (
                          <span className="text-white/70 text-xs">
                            {mission.deadline}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Streaks Section - Detailed View with 7-Day Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-orange-500" />
          Your Streaks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Current Streak - Clickable */}
          <div 
            onClick={() => {
              setShowStreakAnimation(true);
              localStorage.setItem('lastStreakAnimationDate', new Date().toISOString().split('T')[0]);
            }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-6 w-6" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <p className="text-4xl font-bold">{stats?.current_streak || 0}</p>
            <p className="text-orange-100 text-sm mt-1">consecutive days 🔥</p>
            <p className="text-orange-200 text-xs mt-2">Click to celebrate!</p>
          </div>

          {/* Longest Streak */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6" />
              <span className="text-sm font-medium">Longest Streak</span>
            </div>
            <p className="text-4xl font-bold">{stats?.longest_streak || 0}</p>
            <p className="text-purple-100 text-sm mt-1">all-time best 🏆</p>
          </div>

          {/* Total Days Active */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm font-medium">Total Days Active</span>
            </div>
            <p className="text-4xl font-bold">
              {calendarEvents.filter(event => event.lessons_completed > 0).length}
            </p>
            <p className="text-blue-100 text-sm mt-1">days of learning 📚</p>
          </div>
        </div>

        {/* Last 7 Days Activity */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days</h3>
          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              const hasActivity = getCalendarDayActivity(date.toISOString().split('T')[0]);
              
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{day}</div>
                  <div
                    className={`w-full h-12 rounded-lg flex items-center justify-center transition-all ${
                      hasActivity
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {hasActivity ? <Zap className="h-5 w-5" /> : <span className="text-lg">·</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Remove Certificate and Badge Collection preview cards from renderAchievementsSection
  const renderAchievementsSection = () => (
    <div className="space-y-6">
      {/* Badge Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Badge Progress</h2>
        {badgeProgress.length > 0 ? (
          <div className="space-y-4">
            {badgeProgress.map((badge) => (
              <div key={badge.tier_name} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{badge.icon_emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{badge.tier_name}</h3>
                      <p className="text-sm text-gray-600">Level {badge.tier_level}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {badge.current_progress}/{badge.requirement_value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (badge.current_progress / badge.requirement_value) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No badge progress yet</p>
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
        {recentAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{achievement.icon_emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <p className="text-xs text-gray-500">{achievement.earned_at}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No achievements yet - keep learning!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Reload
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Streak Animation Overlay */}
          {showStreakAnimation && (
            <StreakGiftAnimation
              streakNumber={stats?.current_streak || 0}
              show={showStreakAnimation}
              onComplete={() => setShowStreakAnimation(false)}
            />
          )}

          {/* Course Details Sidebar */}
          {showCourseDetails && selectedCourseDetails && (
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                <button
                  onClick={handleCloseCourseDetails}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
                <CourseContentView courseId={selectedCourseDetails.id} />
              </div>
            </div>
          )}

          {/* Add Mission Modal */}
          {showAddMissionModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Target className="h-6 w-6 text-orange-500" />
                      <h2 className="text-2xl font-bold text-gray-900">Add Mission for Tomorrow</h2>
                    </div>
                    <button
                      onClick={() => {
                        setShowAddMissionModal(false);
                        setMissionError('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {missionError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {missionError}
                    </div>
                  )}

                  {/* ... keep existing mission form ... */}
                </div>
              </div>
            </div>
          )}

          {/* Stat Card Modal */}
          {showStatCardModal && (
            <StatCardModal
              type={selectedStatCard}
              userId={user?.id || ''}
              onClose={handleCloseStatModal}
            />
          )}

          {/* Main Content - Render based on active section */}
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'progress' && renderProgressSection()}
          {activeView === 'earners' && renderEarnersSection()}
          {activeView === 'events' && renderEventsSection()}
          {activeView === 'store' && renderStoreSection()}
          {activeView === 'marketplace' && renderMarketplaceSection()}
          {activeView === 'community' && renderCommunitySection()}
          {activeView === 'settings' && renderSettingsSection()}
          {activeView === 'lms' && <VirtualClassroomHub />}
          {activeView === 'help' && <HelpCenter />}
          {activeView === 'study-rooms' && <StudyRoomHub userId={user?.id} />}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;