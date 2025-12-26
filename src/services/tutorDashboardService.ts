import { supabase } from '../lib/supabase';

// Interface Definitions
export interface TutorStats {
  totalStudents: number;
  totalCourses: number;
  pendingGrading: number;
  averageScore: number;
}

export interface AssignedStudent {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  subjectName: string | null;
  courseTitle: string | null;
  courseDifficulty: string | null;
  assignedAt: string;
  status: string;
}

export interface ClassOverview {
  id: string;
  name: string;
  courseId: string;
  students: number;
  progress: number;
  nextClass: string | null;
  nextClassTime: string | null;
}

export interface StudentActivity {
  id: string;
  studentName: string;
  studentInitials: string;
  action: string;
  subject: string;
  time: string;
  timestamp: string;
}

export interface UpcomingTask {
  id: string;
  task: string;
  taskType: 'assignment' | 'quiz' | 'review';
  class: string;
  due: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface TeachingSchedule {
  id: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  displayTime: string;
  colorClass: string;
}

export interface TutorPoll {
  id: string;
  title: string;
  description: string | null;
  pollType: string;
  options: any[];
  isActive: boolean;
  allowMultiple: boolean;
  createdAt: string;
  expiresAt: string | null;
  responseCount: number;
}

/**
 * Fetch tutor dashboard statistics
 */
export const getTutorStats = async (tutorId: string): Promise<TutorStats> => {
  try {
    // Get total assigned students
    const { data: assignedStudents, error: studentsError } = await supabase
      .from('tutor_student_assignments')
      .select('student_id', { count: 'exact' })
      .eq('tutor_id', tutorId)
      .eq('status', 'active');

    if (studentsError) throw studentsError;

    // Get unique courses taught
    const { data: courses, error: coursesError } = await supabase
      .from('tutor_student_assignments')
      .select('course_id')
      .eq('tutor_id', tutorId)
      .eq('status', 'active');

    if (coursesError) throw coursesError;

    const uniqueCourses = courses ? new Set(courses.map(c => c.course_id)).size : 0;

    // Get pending submissions to grade
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id')
      .eq('created_by', tutorId);

    if (assignmentsError) throw assignmentsError;

    const assignmentIds = assignments?.map(a => a.id) || [];
    
    let pendingCount = 0;
    if (assignmentIds.length > 0) {
      const { count, error: pendingError } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds)
        .eq('status', 'submitted');

      if (pendingError) throw pendingError;
      pendingCount = count || 0;
    }

    // Calculate average score from graded submissions
    let averageScore = 0;
    if (assignmentIds.length > 0) {
      const { data: gradedSubmissions, error: scoreError } = await supabase
        .from('assignment_submissions')
        .select('score, assignment_id!inner(max_score)')
        .in('assignment_id', assignmentIds)
        .eq('status', 'graded')
        .not('score', 'is', null);

      if (scoreError) throw scoreError;

      if (gradedSubmissions && gradedSubmissions.length > 0) {
        const totalPercentage = gradedSubmissions.reduce((sum, submission) => {
          const maxScore = submission.assignment_id?.max_score || 100;
          const percentage = (submission.score! / maxScore) * 100;
          return sum + percentage;
        }, 0);
        averageScore = Math.round(totalPercentage / gradedSubmissions.length);
      }
    }

    return {
      totalStudents: assignedStudents?.length || 0,
      totalCourses: uniqueCourses,
      pendingGrading: pendingCount,
      averageScore
    };
  } catch (error) {
    console.error('Error fetching tutor stats:', error);
    throw error;
  }
};

/**
 * Get assigned students with course details
 */
export const getAssignedStudents = async (tutorId: string): Promise<AssignedStudent[]> => {
  try {
    const { data, error } = await supabase
      .from('tutor_student_assignments')
      .select(`
        id,
        student_id,
        subject_name,
        status,
        assigned_at,
        course_id,
        student_profiles!inner(
          user_profiles!inner(
            id,
            full_name,
            email,
            avatar_url
          )
        ),
        courses(
          title,
          difficulty_level
        )
      `)
      .eq('tutor_id', tutorId)
      .order('assigned_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(assignment => ({
      id: assignment.student_id || '',
      fullName: assignment.student_profiles?.user_profiles?.full_name || 'Unknown Student',
      email: assignment.student_profiles?.user_profiles?.email || '',
      avatarUrl: assignment.student_profiles?.user_profiles?.avatar_url || null,
      subjectName: assignment.subject_name,
      courseTitle: assignment.courses?.title || null,
      courseDifficulty: assignment.courses?.difficulty_level || null,
      assignedAt: assignment.assigned_at || '',
      status: assignment.status || 'active'
    }));
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    throw error;
  }
};

/**
 * Get class overview with progress statistics
 */
export const getClassOverview = async (tutorId: string): Promise<ClassOverview[]> => {
  try {
    // Get all courses this tutor teaches
    const { data: assignments, error: assignmentsError } = await supabase
      .from('tutor_student_assignments')
      .select(`
        course_id,
        courses!inner(
          id,
          title
        )
      `)
      .eq('tutor_id', tutorId)
      .eq('status', 'active');

    if (assignmentsError) throw assignmentsError;

    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Get unique courses
    const uniqueCourses = assignments.reduce((acc: any[], curr) => {
      if (!acc.find(c => c.course_id === curr.course_id)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Get details for each course
    const classOverviews = await Promise.all(
      uniqueCourses.map(async (assignment) => {
        const courseId = assignment.course_id;
        
        // Count students in this course
        const { count: studentCount } = await supabase
          .from('tutor_student_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', tutorId)
          .eq('course_id', courseId)
          .eq('status', 'active');

        // Get next scheduled class
        const { data: nextClass } = await supabase
          .from('virtual_classrooms')
          .select('scheduled_start, title')
          .eq('host_id', tutorId)
          .eq('course_id', courseId)
          .eq('status', 'scheduled')
          .gte('scheduled_start', new Date().toISOString())
          .order('scheduled_start', { ascending: true })
          .limit(1)
          .single();

        // Calculate average progress (simplified - based on enrollment progress)
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('progress_percentage')
          .eq('course_id', courseId);

        const avgProgress = enrollments && enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
          : 0;

        return {
          id: courseId || '',
          name: assignment.courses?.title || 'Untitled Course',
          courseId: courseId || '',
          students: studentCount || 0,
          progress: avgProgress,
          nextClass: nextClass?.title || null,
          nextClassTime: nextClass?.scheduled_start || null
        };
      })
    );

    return classOverviews;
  } catch (error) {
    console.error('Error fetching class overview:', error);
    throw error;
  }
};

/**
 * Get recent student activities
 */
export const getRecentStudentActivities = async (tutorId: string): Promise<StudentActivity[]> => {
  try {
    // Get recent assignment submissions from tutor's students
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        id,
        status,
        submitted_at,
        created_at,
        assignment_id!inner(
          title,
          created_by
        ),
        student_id,
        student_profiles!inner(
          user_profiles!inner(
            full_name
          )
        )
      `)
      .eq('assignment_id.created_by', tutorId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return (data || []).map(activity => {
      const studentName = activity.student_profiles?.user_profiles?.full_name || 'Unknown Student';
      const initials = studentName.split(' ').map(n => n[0]).join('');
      const actionTime = activity.submitted_at || activity.created_at;
      
      return {
        id: activity.id,
        studentName,
        studentInitials: initials,
        action: activity.status === 'submitted' ? 'Submitted Assignment' : 'Updated Submission',
        subject: activity.assignment_id?.title || 'Assignment',
        time: formatTimeAgo(actionTime),
        timestamp: actionTime
      };
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Get upcoming tasks for the tutor
 */
export const getUpcomingTasks = async (tutorId: string): Promise<UpcomingTask[]> => {
  try {
    const tasks: UpcomingTask[] = [];

    // Get assignments that need grading
    const { data: pendingSubmissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select(`
        id,
        submitted_at,
        assignment_id!inner(
          id,
          title,
          due_date,
          created_by,
          course_id,
          courses(title)
        )
      `)
      .eq('assignment_id.created_by', tutorId)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true })
      .limit(5);

    if (submissionsError) throw submissionsError;

    (pendingSubmissions || []).forEach(submission => {
      const dueDate = submission.submitted_at;
      tasks.push({
        id: submission.id,
        task: `Grade: ${submission.assignment_id?.title || 'Assignment'}`,
        taskType: 'assignment',
        class: submission.assignment_id?.courses?.title || 'Unknown Course',
        due: formatDueDate(dueDate),
        dueDate: dueDate,
        priority: getPriority(dueDate)
      });
    });

    // Get upcoming assignments that need to be created/published
    const { data: draftAssignments, error: draftsError } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        due_date,
        is_published,
        course_id,
        courses(title)
      `)
      .eq('created_by', tutorId)
      .eq('is_published', false)
      .order('due_date', { ascending: true })
      .limit(3);

    if (draftsError) throw draftsError;

    (draftAssignments || []).forEach(assignment => {
      tasks.push({
        id: assignment.id,
        task: `Publish: ${assignment.title}`,
        taskType: 'assignment',
        class: assignment.courses?.title || 'Unknown Course',
        due: formatDueDate(assignment.due_date),
        dueDate: assignment.due_date || '',
        priority: 'Medium'
      });
    });

    // Sort by due date and return top tasks
    return tasks
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    throw error;
  }
};

/**
 * Get tutor's teaching schedule
 */
export const getTeachingSchedule = async (tutorId: string): Promise<TeachingSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('virtual_classrooms')
      .select(`
        id,
        title,
        scheduled_start,
        scheduled_end,
        status
      `)
      .eq('host_id', tutorId)
      .in('status', ['scheduled', 'live'])
      .gte('scheduled_start', new Date().toISOString())
      .order('scheduled_start', { ascending: true })
      .limit(10);

    if (error) throw error;

    return (data || []).map((classroom, index) => ({
      id: classroom.id,
      title: classroom.title,
      scheduledStart: classroom.scheduled_start,
      scheduledEnd: classroom.scheduled_end,
      status: classroom.status,
      displayTime: formatScheduleTime(classroom.scheduled_start, classroom.scheduled_end),
      colorClass: getColorClass(index)
    }));
  } catch (error) {
    console.error('Error fetching teaching schedule:', error);
    throw error;
  }
};

/**
 * Get tutor's polls
 */
export const getTutorPolls = async (tutorId: string): Promise<TutorPoll[]> => {
  try {
    const { data, error } = await supabase
      .from('tutor_polls')
      .select(`
        id,
        title,
        description,
        poll_type,
        options,
        is_active,
        allow_multiple,
        created_at,
        expires_at
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get response counts for each poll
    const pollsWithResponses = await Promise.all(
      (data || []).map(async (poll) => {
        const { count } = await supabase
          .from('tutor_poll_responses')
          .select('*', { count: 'exact', head: true })
          .eq('poll_id', poll.id);

        return {
          ...poll,
          pollType: poll.poll_type || 'general',
          isActive: poll.is_active ?? true,
          allowMultiple: poll.allow_multiple ?? false,
          createdAt: poll.created_at || '',
          expiresAt: poll.expires_at,
          responseCount: count || 0
        };
      })
    );

    return pollsWithResponses;
  } catch (error) {
    console.error('Error fetching tutor polls:', error);
    throw error;
  }
};

/**
 * Create a new poll
 */
export const createPoll = async (
  tutorId: string,
  pollData: {
    title: string;
    description?: string;
    pollType: string;
    options: any[];
    allowMultiple: boolean;
    expiresAt?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('tutor_polls')
      .insert({
        tutor_id: tutorId,
        title: pollData.title,
        description: pollData.description || null,
        poll_type: pollData.pollType,
        options: pollData.options,
        allow_multiple: pollData.allowMultiple,
        expires_at: pollData.expiresAt || null,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
};

// Utility Functions
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const formatDueDate = (dateString: string | null): string => {
  if (!dateString) return 'No due date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 0) return 'Overdue';
  if (diffHours < 24) return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatScheduleTime = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();

  const isToday = startDate.toDateString() === now.toDateString();
  const isTomorrow = startDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  if (isToday) return `Today ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;
  
  const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'long' });
  return `${dayOfWeek} ${timeStr}`;
};

const getPriority = (dueDate: string | null): 'High' | 'Medium' | 'Low' => {
  if (!dueDate) return 'Low';
  
  const date = new Date(dueDate);
  const now = new Date();
  const diffHours = (date.getTime() - now.getTime()) / 3600000;

  if (diffHours < 0 || diffHours < 24) return 'High';
  if (diffHours < 72) return 'Medium';
  return 'Low';
};

const getColorClass = (index: number): string => {
  const colors = ['green', 'blue', 'purple', 'orange', 'pink'];
  return colors[index % colors.length];
};