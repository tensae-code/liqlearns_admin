import { supabase } from '../lib/supabase';

// ==================== TYPES ====================

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxScore: number;
  submissionType: 'text' | 'file' | 'audio' | 'video';
  isPublished: boolean;
  allowLateSubmission: boolean;
  courseId: string;
  lessonId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Submission info
  submissionStatus?: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  submittedAt?: string;
  score?: number;
  feedback?: string;
}

export interface CourseDiscussion {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  courseId: string;
  views: number;
  replyCount: number;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
}

export interface QuizTemplate {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  lessonId?: string;
  templateType: 'practice' | 'graded' | 'placement' | 'midterm' | 'final';
  totalQuestions: number;
  timeLimitMinutes?: number;
  passingPercentage: number;
  maxAttempts?: number;
  attemptStrategy: 'unlimited' | 'limited' | 'single_attempt' | 'timed_retake';
  isPublished: boolean;
  createdAt: string;
  // Attempt info
  attemptCount?: number;
  bestScore?: number;
  lastAttemptDate?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId?: string;
  quizAttemptId?: string;
  score: number;
  maxScore: number;
  percentage: number;
  gradeLetter: string;
  feedback?: string;
  gradedBy?: string;
  gradedAt: string;
  weight: number;
  isExtraCredit: boolean;
  createdAt: string;
  updatedAt: string;
  // Assignment/Quiz info
  itemTitle?: string;
  itemType?: 'assignment' | 'quiz';
}

export interface CourseSyllabus {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  weekNumber?: number;
  topics: string[];
  learningObjectives: string[];
  requiredReadings: string[];
  assignmentsDue: string[];
  startDate?: string;
  endDate?: string;
  isPublished: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseAttendance {
  id: string;
  studentId: string;
  courseId: string;
  lessonId?: string;
  liveSessionId?: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  durationMinutes: number;
  notes?: string;
  markedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalClasses: number;
  attended: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface CourseOutcome {
  id: string;
  courseId: string;
  outcomeNumber: number;
  title: string;
  description: string;
  category: 'knowledge' | 'skills' | 'abilities' | 'attitudes';
  masteryCriteria: string[];
  assessmentMethods: string[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentOutcomeProgress {
  id: string;
  studentId: string;
  outcomeId: string;
  masteryLevel: number;
  evidenceCount: number;
  lastAssessedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  outcome?: CourseOutcome;
}

export interface CourseFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  category: string;
}

export interface CoursePerson {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'teacher' | 'ta';
  avatarUrl?: string;
  enrolledAt: string;
}

export interface CourseAnalytics {
  totalTimeSpent: number;
  assignmentsCompleted: number;
  averageScore: number;
  quizzesTaken: number;
  participationRate: number;
  lastActivity: string;
}

// ==================== ASSIGNMENTS ====================

export const getCourseAssignments = async (courseId: string, studentId: string): Promise<Assignment[]> => {
  try {
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('due_date', { ascending: true });

    if (assignmentsError) throw assignmentsError;

    // Get submission status for each assignment
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('assignment_id, status, submitted_at, score')
      .eq('student_id', studentId)
      .in('assignment_id', (assignments || []).map(a => a.id));

    if (submissionsError) throw submissionsError;

    // Get grades for submitted assignments
    const { data: grades, error: gradesError } = await supabase
      .from('grade_records')
      .select('assignment_id, score, feedback, graded_at')
      .eq('student_id', studentId)
      .in('assignment_id', (assignments || []).map(a => a.id));

    if (gradesError) throw gradesError;

    const submissionMap = new Map(submissions?.map(s => [s.assignment_id, s]) || []);
    const gradeMap = new Map(grades?.map(g => [g.assignment_id, g]) || []);

    return (assignments || []).map(item => {
      const submission = submissionMap.get(item.id);
      const grade = gradeMap.get(item.id);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        instructions: item.instructions,
        dueDate: item.due_date,
        maxScore: item.max_score,
        submissionType: item.submission_type,
        isPublished: item.is_published,
        allowLateSubmission: item.allow_late_submission,
        courseId: item.course_id,
        lessonId: item.lesson_id,
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        submissionStatus: submission?.status || 'not_started',
        submittedAt: submission?.submitted_at,
        score: grade?.score,
        feedback: grade?.feedback
      };
    });
  } catch (error: any) {
    console.error('Error fetching course assignments:', error);
    throw new Error(error?.message || 'Failed to fetch course assignments');
  }
};

// ==================== DISCUSSIONS ====================

export const getCourseDiscussions = async (courseId: string): Promise<CourseDiscussion[]> => {
  try {
    const { data, error } = await supabase
      .from('course_discussions')
      .select('*')
      .eq('course_id', courseId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      authorId: item.author_id,
      authorName: item.author_name,
      courseId: item.course_id,
      views: item.views,
      replyCount: item.reply_count,
      pinned: item.pinned,
      locked: item.locked,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      lastReplyAt: item.last_reply_at
    }));
  } catch (error: any) {
    console.error('Error fetching course discussions:', error);
    throw new Error(error?.message || 'Failed to fetch course discussions');
  }
};

export const createDiscussion = async (
  courseId: string,
  authorId: string,
  authorName: string,
  title: string,
  content: string,
  category: string = 'general'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('course_discussions')
      .insert({
        course_id: courseId,
        author_id: authorId,
        author_name: authorName,
        title,
        content,
        category
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('Error creating discussion:', error);
    throw new Error(error?.message || 'Failed to create discussion');
  }
};

// ==================== QUIZZES ====================

export const getCourseQuizzes = async (courseId: string, studentId: string): Promise<QuizTemplate[]> => {
  try {
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quiz_templates')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (quizzesError) throw quizzesError;

    // Get student's quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('lesson_id, score, percentage, completed_at')
      .eq('student_id', studentId)
      .in('lesson_id', (quizzes || []).map(q => q.lesson_id).filter(Boolean));

    if (attemptsError) throw attemptsError;

    // Group attempts by lesson
    const attemptsByLesson = new Map();
    (attempts || []).forEach(attempt => {
      if (!attemptsByLesson.has(attempt.lesson_id)) {
        attemptsByLesson.set(attempt.lesson_id, []);
      }
      attemptsByLesson.get(attempt.lesson_id).push(attempt);
    });

    return (quizzes || []).map(quiz => {
      const lessonAttempts = attemptsByLesson.get(quiz.lesson_id) || [];
      const bestScore = lessonAttempts.length > 0 
        ? Math.max(...lessonAttempts.map(a => a.percentage)) 
        : undefined;
      const lastAttempt = lessonAttempts.length > 0 
        ? lessonAttempts.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]
        : undefined;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        courseId: quiz.course_id,
        lessonId: quiz.lesson_id,
        templateType: quiz.template_type,
        totalQuestions: quiz.total_questions,
        timeLimitMinutes: quiz.time_limit_minutes,
        passingPercentage: Number(quiz.passing_percentage),
        maxAttempts: quiz.max_attempts,
        attemptStrategy: quiz.attempt_strategy,
        isPublished: quiz.is_published,
        createdAt: quiz.created_at,
        attemptCount: lessonAttempts.length,
        bestScore: bestScore,
        lastAttemptDate: lastAttempt?.completed_at
      };
    });
  } catch (error: any) {
    console.error('Error fetching course quizzes:', error);
    throw new Error(error?.message || 'Failed to fetch course quizzes');
  }
};

// ==================== GRADES ====================

export const getStudentGrades = async (studentId: string, courseId: string): Promise<GradeRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('grade_records')
      .select(`
        *,
        assignment:assignments(title),
        grader:user_profiles(full_name)
      `)
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('graded_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      courseId: item.course_id,
      assignmentId: item.assignment_id,
      quizAttemptId: item.quiz_attempt_id,
      score: Number(item.score),
      maxScore: Number(item.max_score),
      percentage: Number(item.percentage),
      gradeLetter: item.grade_letter || '',
      feedback: item.feedback,
      gradedBy: item.graded_by,
      gradedAt: item.graded_at,
      weight: Number(item.weight),
      isExtraCredit: item.is_extra_credit,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      itemTitle: item.assignment?.title || 'Quiz',
      itemType: item.assignment_id ? 'assignment' : 'quiz'
    }));
  } catch (error: any) {
    console.error('Error fetching student grades:', error);
    throw new Error(error?.message || 'Failed to fetch student grades');
  }
};

export const getCourseGradeSummary = async (studentId: string, courseId: string) => {
  try {
    const grades = await getStudentGrades(studentId, courseId);
    
    if (grades.length === 0) {
      return {
        currentGrade: 0,
        letterGrade: 'N/A',
        totalPoints: 0,
        earnedPoints: 0,
        assignmentCount: 0,
        averageScore: 0
      };
    }

    const totalWeightedScore = grades.reduce((sum, g) => sum + (g.percentage * g.weight), 0);
    const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
    const currentGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    const getLetterGrade = (percentage: number): string => {
      if (percentage >= 93) return 'A';
      if (percentage >= 90) return 'A-';
      if (percentage >= 87) return 'B+';
      if (percentage >= 83) return 'B';
      if (percentage >= 80) return 'B-';
      if (percentage >= 77) return 'C+';
      if (percentage >= 73) return 'C';
      if (percentage >= 70) return 'C-';
      if (percentage >= 67) return 'D+';
      if (percentage >= 63) return 'D';
      if (percentage >= 60) return 'D-';
      return 'F';
    };

    return {
      currentGrade: Math.round(currentGrade),
      letterGrade: getLetterGrade(currentGrade),
      totalPoints: grades.reduce((sum, g) => sum + g.maxScore, 0),
      earnedPoints: grades.reduce((sum, g) => sum + g.score, 0),
      assignmentCount: grades.length,
      averageScore: Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length)
    };
  } catch (error: any) {
    console.error('Error calculating grade summary:', error);
    return {
      currentGrade: 0,
      letterGrade: 'N/A',
      totalPoints: 0,
      earnedPoints: 0,
      assignmentCount: 0,
      averageScore: 0
    };
  }
};

// ==================== SYLLABUS ====================

export const getCourseSyllabus = async (courseId: string): Promise<CourseSyllabus[]> => {
  try {
    const { data, error } = await supabase
      .from('course_syllabus')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('week_number', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      courseId: item.course_id,
      title: item.title,
      description: item.description,
      weekNumber: item.week_number,
      topics: item.topics || [],
      learningObjectives: item.learning_objectives || [],
      requiredReadings: item.required_readings || [],
      assignmentsDue: item.assignments_due || [],
      startDate: item.start_date,
      endDate: item.end_date,
      isPublished: item.is_published,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error: any) {
    console.error('Error fetching course syllabus:', error);
    throw new Error(error?.message || 'Failed to fetch course syllabus');
  }
};

// ==================== ATTENDANCE ====================

export const getStudentAttendance = async (
  studentId: string,
  courseId?: string,
  startDate?: string,
  endDate?: string
): Promise<CourseAttendance[]> => {
  try {
    let query = supabase
      .from('course_attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });

    if (courseId) query = query.eq('course_id', courseId);
    if (startDate) query = query.gte('attendance_date', startDate);
    if (endDate) query = query.lte('attendance_date', endDate);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      courseId: item.course_id,
      lessonId: item.lesson_id,
      liveSessionId: item.live_session_id,
      attendanceDate: item.attendance_date,
      status: item.status,
      durationMinutes: item.duration_minutes || 0,
      notes: item.notes,
      markedBy: item.marked_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error: any) {
    console.error('Error fetching student attendance:', error);
    throw new Error(error?.message || 'Failed to fetch student attendance');
  }
};

export const getAttendanceStats = async (
  studentId: string,
  courseId: string
): Promise<AttendanceStats> => {
  try {
    const { data, error } = await supabase
      .from('course_attendance')
      .select('status')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) throw error;

    const records = data || [];
    const totalClasses = records.length;
    const attended = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const attendanceRate = totalClasses > 0 ? (attended / totalClasses) * 100 : 0;

    return {
      totalClasses,
      attended,
      absent,
      late,
      excused,
      attendanceRate: Math.round(attendanceRate)
    };
  } catch (error: any) {
    console.error('Error calculating attendance stats:', error);
    throw new Error(error?.message || 'Failed to calculate attendance stats');
  }
};

// ==================== OUTCOMES ====================

export const getCourseOutcomes = async (courseId: string): Promise<CourseOutcome[]> => {
  try {
    const { data, error } = await supabase
      .from('course_outcomes')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('outcome_number', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      courseId: item.course_id,
      outcomeNumber: item.outcome_number,
      title: item.title,
      description: item.description,
      category: item.category,
      masteryCriteria: item.mastery_criteria || [],
      assessmentMethods: item.assessment_methods || [],
      isActive: item.is_active,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error: any) {
    console.error('Error fetching course outcomes:', error);
    throw new Error(error?.message || 'Failed to fetch course outcomes');
  }
};

export const getStudentOutcomeProgress = async (
  studentId: string,
  courseId?: string
): Promise<StudentOutcomeProgress[]> => {
  try {
    let query = supabase
      .from('student_outcome_progress')
      .select(`
        *,
        outcome:course_outcomes(*)
      `)
      .eq('student_id', studentId);

    const { data, error } = await query;
    if (error) throw error;

    let results = (data || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      outcomeId: item.outcome_id,
      masteryLevel: item.mastery_level || 0,
      evidenceCount: item.evidence_count || 0,
      lastAssessedAt: item.last_assessed_at,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      outcome: item.outcome ? {
        id: item.outcome.id,
        courseId: item.outcome.course_id,
        outcomeNumber: item.outcome.outcome_number,
        title: item.outcome.title,
        description: item.outcome.description,
        category: item.outcome.category,
        masteryCriteria: item.outcome.mastery_criteria || [],
        assessmentMethods: item.outcome.assessment_methods || [],
        isActive: item.outcome.is_active,
        createdBy: item.outcome.created_by,
        createdAt: item.outcome.created_at,
        updatedAt: item.outcome.updated_at
      } : undefined
    }));

    if (courseId) {
      results = results.filter(r => r.outcome?.courseId === courseId);
    }

    return results;
  } catch (error: any) {
    console.error('Error fetching student outcome progress:', error);
    throw new Error(error?.message || 'Failed to fetch student outcome progress');
  }
};

// ==================== FILES ====================

export const getCourseFiles = async (courseId: string): Promise<CourseFile[]> => {
  try {
    // Get files from shared_documents for collaboration groups
    const { data: groups, error: groupsError } = await supabase
      .from('collaboration_groups')
      .select('id')
      .eq('course_id', courseId);

    if (groupsError) throw groupsError;

    const groupIds = (groups || []).map(g => g.id);

    if (groupIds.length === 0) {
      return [];
    }

    const { data: documents, error: docsError } = await supabase
      .from('shared_documents')
      .select(`
        *,
        uploader:user_profiles!shared_documents_uploaded_by_fkey(full_name)
      `)
      .in('group_id', groupIds)
      .order('created_at', { ascending: false });

    if (docsError) throw docsError;

    return (documents || []).map(doc => ({
      id: doc.id,
      name: doc.title,
      type: doc.document_type,
      size: doc.size_bytes,
      url: doc.document_url,
      uploadedBy: doc.uploaded_by,
      uploadedByName: doc.uploader?.full_name || 'Unknown',
      uploadedAt: doc.created_at,
      category: 'course-material'
    }));
  } catch (error: any) {
    console.error('Error fetching course files:', error);
    return []; // Return empty array instead of throwing to prevent UI breaks
  }
};

// ==================== PEOPLE ====================

export const getCoursePeople = async (courseId: string): Promise<CoursePerson[]> => {
  try {
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        student_id,
        enrolled_at,
        student:student_profiles(
          user:user_profiles(
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq('course_id', courseId);

    if (error) throw error;

    return (enrollments || [])
      .filter(e => e.student?.user)
      .map(e => ({
        id: e.student_id,
        fullName: e.student.user.full_name || 'Unknown',
        email: e.student.user.email,
        role: 'student' as const,
        avatarUrl: e.student.user.avatar_url,
        enrolledAt: e.enrolled_at
      }));
  } catch (error: any) {
    console.error('Error fetching course people:', error);
    throw new Error(error?.message || 'Failed to fetch course people');
  }
};

// ==================== ANALYTICS ====================

export const getCourseAnalytics = async (studentId: string, courseId: string): Promise<CourseAnalytics> => {
  try {
    // Get lesson progress
    const { data: progress, error: progressError } = await supabase
      .from('student_lesson_progress')
      .select('time_spent_minutes, is_completed')
      .eq('student_id', studentId);

    if (progressError) throw progressError;

    // Get assignments completed
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('status')
      .eq('student_id', studentId);

    if (submissionsError) throw submissionsError;

    // Get quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('percentage, completed_at')
      .eq('student_id', studentId);

    if (attemptsError) throw attemptsError;

    // Get attendance for participation rate
    const attendanceStats = await getAttendanceStats(studentId, courseId);

    const totalTimeSpent = (progress || []).reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);
    const assignmentsCompleted = (submissions || []).filter(s => s.status === 'submitted' || s.status === 'graded').length;
    const averageScore = (attempts || []).length > 0 
      ? Math.round((attempts || []).reduce((sum, a) => sum + a.percentage, 0) / attempts.length) 
      : 0;
    const lastActivity = (attempts || []).length > 0 
      ? (attempts || []).sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at
      : new Date().toISOString();

    return {
      totalTimeSpent,
      assignmentsCompleted,
      averageScore,
      quizzesTaken: (attempts || []).length,
      participationRate: attendanceStats.attendanceRate,
      lastActivity
    };
  } catch (error: any) {
    console.error('Error fetching course analytics:', error);
    return {
      totalTimeSpent: 0,
      assignmentsCompleted: 0,
      averageScore: 0,
      quizzesTaken: 0,
      participationRate: 0,
      lastActivity: new Date().toISOString()
    };
  }
};

// ==================== EXPORTS ====================

export default {
  getCourseAssignments,
  getCourseDiscussions,
  createDiscussion,
  getCourseQuizzes,
  getStudentGrades,
  getCourseGradeSummary,
  getCourseSyllabus,
  getStudentAttendance,
  getAttendanceStats,
  getCourseOutcomes,
  getStudentOutcomeProgress,
  getCourseFiles,
  getCoursePeople,
  getCourseAnalytics
};
function lmsService(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: lmsService is not implemented yet.', args);
  return null;
}

export { lmsService };
function LMSSyllabus(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: LMSSyllabus is not implemented yet.', args);
  return null;
}

export { LMSSyllabus };
function LMSAttendance(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: LMSAttendance is not implemented yet.', args);
  return null;
}

export { LMSAttendance };
function LMSOutcome(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: LMSOutcome is not implemented yet.', args);
  return null;
}

export { LMSOutcome };
function LessonWithContent(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: LessonWithContent is not implemented yet.', args);
  return null;
}

export { LessonWithContent };