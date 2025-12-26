import { supabase } from '../lib/supabase';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface QuestionBank {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  createdBy: string;
  tags: string[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  subjectArea?: string;
  isPublic: boolean;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizTemplate {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  lessonId?: string;
  createdBy: string;
  templateType: 'practice' | 'graded' | 'placement' | 'midterm' | 'final';
  
  // Quiz Settings
  timeLimitMinutes?: number;
  passingPercentage: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  
  // Attempt Settings
  attemptStrategy: 'unlimited' | 'limited' | 'single_attempt' | 'timed_retake';
  maxAttempts?: number;
  retakeDelayHours?: number;
  
  // Question Configuration
  totalQuestions: number;
  questionsPerAttempt?: number;
  
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptDetail {
  id: string;
  quizAttemptId: string;
  quizTemplateId?: string;
  attemptNumber: number;
  timeLimitMinutes?: number;
  timeRemainingSeconds?: number;
  isTimedOut: boolean;
  feedback?: string;
  gradeLetter?: string;
  createdAt: string;
}

export interface GradingRubric {
  id: string;
  title: string;
  description?: string;
  assignmentId: string;
  courseId: string;
  createdBy: string;
  totalPoints: number;
  gradeScale: 'letter' | 'percentage' | 'points';
  createdAt: string;
  updatedAt: string;
  criteria?: RubricCriterion[];
}

export interface RubricCriterion {
  id: string;
  rubricId: string;
  criteriaType: 'content_accuracy' | 'organization' | 'grammar' | 'creativity' | 'effort' | 'participation';
  title: string;
  description?: string;
  maxPoints: number;
  orderIndex: number;
  levels?: RubricCriterionLevel[];
}

export interface RubricCriterionLevel {
  id: string;
  criterionId: string;
  levelName: string;
  levelDescription?: string;
  pointsValue: number;
  orderIndex: number;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId?: string;
  quizAttemptId?: string;
  rubricId?: string;
  
  // Grade Information
  score: number;
  maxScore: number;
  percentage: number;
  gradeLetter?: string;
  
  // Grading Details
  gradedBy?: string;
  gradedAt?: string;
  feedback?: string;
  rubricScores?: Record<string, number>;
  
  // Metadata
  weight: number;
  isExtraCredit: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  assignmentTitle?: string;
  graderName?: string;
}

export interface ProgressReport {
  id: string;
  studentId: string;
  courseId: string;
  periodType: 'weekly' | 'monthly' | 'quarterly' | 'semester' | 'annual';
  startDate: string;
  endDate: string;
  
  // Academic Performance
  overallGrade?: number;
  gradeLetter?: string;
  attendancePercentage?: number;
  lessonsCompleted: number;
  assignmentsCompleted: number;
  quizzesCompleted: number;
  
  // Skill Progress
  skillImprovements?: Record<string, number>;
  strengths: string[];
  areasForImprovement: string[];
  
  // Teacher Comments
  teacherComments?: string;
  generatedBy?: string;
  generatedAt: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface StudentGradebook {
  studentName: string;
  courseGrade: number;
  gradeLetter: string;
  totalAssignments: number;
  completedAssignments: number;
  totalQuizzes: number;
  completedQuizzes: number;
  recentGrades: GradeRecord[];
}

// ============================================================================
// QUESTION BANKS SERVICE
// ============================================================================

export const questionBankService = {
  // Get all question banks for a course
  async getQuestionBanks(courseId: string): Promise<QuestionBank[]> {
    const { data, error } = await supabase
      .from('question_banks')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(bank => ({
      id: bank.id,
      title: bank.title,
      description: bank.description,
      courseId: bank.course_id,
      createdBy: bank.created_by,
      tags: bank.tags || [],
      difficultyLevel: bank.difficulty_level,
      subjectArea: bank.subject_area,
      isPublic: bank.is_public,
      totalQuestions: bank.total_questions,
      createdAt: bank.created_at,
      updatedAt: bank.updated_at
    }));
  },

  // Get questions from a bank
  async getBankQuestions(bankId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('question_bank_items')
      .select(`
        *,
        quiz_questions (*)
      `)
      .eq('question_bank_id', bankId);

    if (error) throw error;

    return (data || []).map(item => ({
      ...item.quiz_questions,
      addedAt: item.added_at
    }));
  },

  // Create question bank
  async createQuestionBank(bank: Partial<QuestionBank>): Promise<QuestionBank> {
    const { data, error } = await supabase
      .from('question_banks')
      .insert({
        title: bank.title,
        description: bank.description,
        course_id: bank.courseId,
        created_by: bank.createdBy,
        tags: bank.tags,
        difficulty_level: bank.difficultyLevel,
        subject_area: bank.subjectArea,
        is_public: bank.isPublic
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      courseId: data.course_id,
      createdBy: data.created_by,
      tags: data.tags || [],
      difficultyLevel: data.difficulty_level,
      subjectArea: data.subject_area,
      isPublic: data.is_public,
      totalQuestions: data.total_questions,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Add question to bank
  async addQuestionToBank(bankId: string, questionId: string): Promise<void> {
    const { error } = await supabase
      .from('question_bank_items')
      .insert({
        question_bank_id: bankId,
        question_id: questionId
      });

    if (error) throw error;
  }
};

// ============================================================================
// QUIZ TEMPLATES SERVICE
// ============================================================================

export const quizTemplateService = {
  // Get quiz templates for a course
  async getQuizTemplates(courseId: string): Promise<QuizTemplate[]> {
    const { data, error } = await supabase
      .from('quiz_templates')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(template => ({
      id: template.id,
      title: template.title,
      description: template.description,
      courseId: template.course_id,
      lessonId: template.lesson_id,
      createdBy: template.created_by,
      templateType: template.template_type,
      timeLimitMinutes: template.time_limit_minutes,
      passingPercentage: template.passing_percentage,
      randomizeQuestions: template.randomize_questions,
      randomizeOptions: template.randomize_options,
      showCorrectAnswers: template.show_correct_answers,
      showExplanations: template.show_explanations,
      attemptStrategy: template.attempt_strategy,
      maxAttempts: template.max_attempts,
      retakeDelayHours: template.retake_delay_hours,
      totalQuestions: template.total_questions,
      questionsPerAttempt: template.questions_per_attempt,
      isPublished: template.is_published,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    }));
  },

  // Get quiz template with questions
  async getQuizTemplateWithQuestions(templateId: string): Promise<QuizTemplate & { questions: any[] }> {
    const { data: template, error: templateError } = await supabase
      .from('quiz_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    const { data: questions, error: questionsError } = await supabase
      .from('quiz_template_questions')
      .select(`
        *,
        quiz_questions (*)
      `)
      .eq('quiz_template_id', templateId)
      .order('order_index');

    if (questionsError) throw questionsError;

    return {
      id: template.id,
      title: template.title,
      description: template.description,
      courseId: template.course_id,
      lessonId: template.lesson_id,
      createdBy: template.created_by,
      templateType: template.template_type,
      timeLimitMinutes: template.time_limit_minutes,
      passingPercentage: template.passing_percentage,
      randomizeQuestions: template.randomize_questions,
      randomizeOptions: template.randomize_options,
      showCorrectAnswers: template.show_correct_answers,
      showExplanations: template.show_explanations,
      attemptStrategy: template.attempt_strategy,
      maxAttempts: template.max_attempts,
      retakeDelayHours: template.retake_delay_hours,
      totalQuestions: template.total_questions,
      questionsPerAttempt: template.questions_per_attempt,
      isPublished: template.is_published,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      questions: (questions || []).map(q => q.quiz_questions)
    };
  },

  // Create quiz template
  async createQuizTemplate(template: Partial<QuizTemplate>): Promise<QuizTemplate> {
    const { data, error } = await supabase
      .from('quiz_templates')
      .insert({
        title: template.title,
        description: template.description,
        course_id: template.courseId,
        lesson_id: template.lessonId,
        created_by: template.createdBy,
        template_type: template.templateType,
        time_limit_minutes: template.timeLimitMinutes,
        passing_percentage: template.passingPercentage,
        randomize_questions: template.randomizeQuestions,
        randomize_options: template.randomizeOptions,
        show_correct_answers: template.showCorrectAnswers,
        show_explanations: template.showExplanations,
        attempt_strategy: template.attemptStrategy,
        max_attempts: template.maxAttempts,
        retake_delay_hours: template.retakeDelayHours,
        total_questions: template.totalQuestions,
        questions_per_attempt: template.questionsPerAttempt,
        is_published: template.isPublished
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      courseId: data.course_id,
      lessonId: data.lesson_id,
      createdBy: data.created_by,
      templateType: data.template_type,
      timeLimitMinutes: data.time_limit_minutes,
      passingPercentage: data.passing_percentage,
      randomizeQuestions: data.randomize_questions,
      randomizeOptions: data.randomize_options,
      showCorrectAnswers: data.show_correct_answers,
      showExplanations: data.show_explanations,
      attemptStrategy: data.attempt_strategy,
      maxAttempts: data.max_attempts,
      retakeDelayHours: data.retake_delay_hours,
      totalQuestions: data.total_questions,
      questionsPerAttempt: data.questions_per_attempt,
      isPublished: data.is_published,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

// ============================================================================
// GRADING RUBRICS SERVICE
// ============================================================================

export const gradingRubricService = {
  // Get rubrics for assignment
  async getAssignmentRubrics(assignmentId: string): Promise<GradingRubric[]> {
    const { data, error } = await supabase
      .from('grading_rubrics')
      .select(`
        *,
        rubric_criteria (
          *,
          rubric_criterion_levels (*)
        )
      `)
      .eq('assignment_id', assignmentId);

    if (error) throw error;

    return (data || []).map(rubric => ({
      id: rubric.id,
      title: rubric.title,
      description: rubric.description,
      assignmentId: rubric.assignment_id,
      courseId: rubric.course_id,
      createdBy: rubric.created_by,
      totalPoints: rubric.total_points,
      gradeScale: rubric.grade_scale,
      createdAt: rubric.created_at,
      updatedAt: rubric.updated_at,
      criteria: (rubric.rubric_criteria || []).map((c: any) => ({
        id: c.id,
        rubricId: c.rubric_id,
        criteriaType: c.criteria_type,
        title: c.title,
        description: c.description,
        maxPoints: c.max_points,
        orderIndex: c.order_index,
        levels: (c.rubric_criterion_levels || []).map((l: any) => ({
          id: l.id,
          criterionId: l.criterion_id,
          levelName: l.level_name,
          levelDescription: l.level_description,
          pointsValue: l.points_value,
          orderIndex: l.order_index
        }))
      }))
    }));
  },

  // Create grading rubric
  async createRubric(rubric: Partial<GradingRubric>): Promise<GradingRubric> {
    const { data, error } = await supabase
      .from('grading_rubrics')
      .insert({
        title: rubric.title,
        description: rubric.description,
        assignment_id: rubric.assignmentId,
        course_id: rubric.courseId,
        created_by: rubric.createdBy,
        total_points: rubric.totalPoints,
        grade_scale: rubric.gradeScale
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      assignmentId: data.assignment_id,
      courseId: data.course_id,
      createdBy: data.created_by,
      totalPoints: data.total_points,
      gradeScale: data.grade_scale,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

// ============================================================================
// GRADEBOOK SERVICE
// ============================================================================

export const gradebookService = {
  // Get student's grade records for a course
  async getStudentGrades(studentId: string, courseId: string): Promise<GradeRecord[]> {
    const { data, error } = await supabase
      .from('grade_records').select(`*,assignments (title),user_profiles:graded_by (full_name)`).eq('student_id', studentId).eq('course_id', courseId).order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(record => ({
      id: record.id,
      studentId: record.student_id,
      courseId: record.course_id,
      assignmentId: record.assignment_id,
      quizAttemptId: record.quiz_attempt_id,
      rubricId: record.rubric_id,
      score: record.score,
      maxScore: record.max_score,
      percentage: record.percentage,
      gradeLetter: record.grade_letter,
      gradedBy: record.graded_by,
      gradedAt: record.graded_at,
      feedback: record.feedback,
      rubricScores: record.rubric_scores,
      weight: record.weight,
      isExtraCredit: record.is_extra_credit,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      assignmentTitle: record.assignments?.title,
      graderName: record.user_profiles?.full_name
    }));
  },

  // Get course gradebook (all students)
  async getCourseGradebook(courseId: string): Promise<StudentGradebook[]> {
    const { data, error } = await supabase
      .from('grade_records').select(`student_id,student_profiles (user_profiles (full_name)),score,max_score,percentage,grade_letter,assignment_id,quiz_attempt_id`).eq('course_id', courseId);

    if (error) throw error;

    // Group by student
    const studentMap = new Map<string, any>();
    
    (data || []).forEach(record => {
      if (!studentMap.has(record.student_id)) {
        studentMap.set(record.student_id, {
          studentId: record.student_id,
          studentName: record.student_profiles?.user_profiles?.full_name || 'Unknown',
          grades: [],
          assignments: new Set(),
          quizzes: new Set()
        });
      }
      
      const student = studentMap.get(record.student_id);
      student.grades.push(record);
      
      if (record.assignment_id) student.assignments.add(record.assignment_id);
      if (record.quiz_attempt_id) student.quizzes.add(record.quiz_attempt_id);
    });

    // Calculate overall grades
    return Array.from(studentMap.values()).map(student => {
      const totalScore = student.grades.reduce((sum: number, g: any) => sum + g.score, 0);
      const totalMaxScore = student.grades.reduce((sum: number, g: any) => sum + g.max_score, 0);
      const courseGrade = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

      return {
        studentName: student.studentName,
        courseGrade: Math.round(courseGrade * 100) / 100,
        gradeLetter: this.calculateGradeLetter(courseGrade),
        totalAssignments: student.assignments.size,
        completedAssignments: student.grades.filter((g: any) => g.assignment_id).length,
        totalQuizzes: student.quizzes.size,
        completedQuizzes: student.grades.filter((g: any) => g.quiz_attempt_id).length,
        recentGrades: student.grades.slice(0, 5)
      };
    });
  },

  // Calculate grade letter
  calculateGradeLetter(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  },

  // Bulk grade submissions
  async bulkGradeSubmissions(grades: Array<{
    submissionId: string;
    score: number;
    feedback?: string;
  }>): Promise<void> {
    const updates = grades.map(grade => 
      supabase
        .from('assignment_submissions')
        .update({
          score: grade.score,
          feedback: grade.feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', grade.submissionId)
    );

    await Promise.all(updates);
  }
};

// ============================================================================
// PROGRESS REPORTS SERVICE
// ============================================================================

export const progressReportService = {
  // Get student progress reports
  async getStudentReports(studentId: string, courseId?: string): Promise<ProgressReport[]> {
    let query = supabase
      .from('progress_reports')
      .select('*')
      .eq('student_id', studentId)
      .order('start_date', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(report => ({
      id: report.id,
      studentId: report.student_id,
      courseId: report.course_id,
      periodType: report.period_type,
      startDate: report.start_date,
      endDate: report.end_date,
      overallGrade: report.overall_grade,
      gradeLetter: report.grade_letter,
      attendancePercentage: report.attendance_percentage,
      lessonsCompleted: report.lessons_completed,
      assignmentsCompleted: report.assignments_completed,
      quizzesCompleted: report.quizzes_completed,
      skillImprovements: report.skill_improvements,
      strengths: report.strengths || [],
      areasForImprovement: report.areas_for_improvement || [],
      teacherComments: report.teacher_comments,
      generatedBy: report.generated_by,
      generatedAt: report.generated_at,
      createdAt: report.created_at,
      updatedAt: report.updated_at
    }));
  },

  // Generate progress report
  async generateProgressReport(
    studentId: string,
    courseId: string,
    periodType: 'weekly\' | \'monthly\' | \'quarterly\' | \'semester\' | \'annual',
    startDate: string,
    endDate: string
  ): Promise<ProgressReport> {
    // Calculate statistics from grade_records
    const { data: grades, error: gradesError } = await supabase
      .from('grade_records')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (gradesError) throw gradesError;

    // Calculate statistics from lesson progress
    const { data: lessons, error: lessonsError } = await supabase
      .from('student_lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .gte('started_at', startDate)
      .lte('started_at', endDate);

    if (lessonsError) throw lessonsError;

    // Calculate overall grade
    const totalScore = (grades || []).reduce((sum, g) => sum + g.score, 0);
    const totalMaxScore = (grades || []).reduce((sum, g) => sum + g.max_score, 0);
    const overallGrade = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    // Count completions
    const assignmentsCompleted = (grades || []).filter(g => g.assignment_id).length;
    const quizzesCompleted = (grades || []).filter(g => g.quiz_attempt_id).length;
    const lessonsCompleted = (lessons || []).filter(l => l.completed_at).length;

    // Create progress report
    const { data, error } = await supabase
      .from('progress_reports')
      .insert({
        student_id: studentId,
        course_id: courseId,
        period_type: periodType,
        start_date: startDate,
        end_date: endDate,
        overall_grade: overallGrade,
        grade_letter: gradebookService.calculateGradeLetter(overallGrade),
        lessons_completed: lessonsCompleted,
        assignments_completed: assignmentsCompleted,
        quizzes_completed: quizzesCompleted,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      studentId: data.student_id,
      courseId: data.course_id,
      periodType: data.period_type,
      startDate: data.start_date,
      endDate: data.end_date,
      overallGrade: data.overall_grade,
      gradeLetter: data.grade_letter,
      attendancePercentage: data.attendance_percentage,
      lessonsCompleted: data.lessons_completed,
      assignmentsCompleted: data.assignments_completed,
      quizzesCompleted: data.quizzes_completed,
      skillImprovements: data.skill_improvements,
      strengths: data.strengths || [],
      areasForImprovement: data.areas_for_improvement || [],
      teacherComments: data.teacher_comments,
      generatedBy: data.generated_by,
      generatedAt: data.generated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

// ============================================================================
// QUIZ ATTEMPT SERVICE (ENHANCED)
// ============================================================================

export const enhancedQuizService = {
  // Start quiz attempt from template
  async startQuizAttempt(
    studentId: string,
    templateId: string,
    lessonId: string
  ): Promise<{ attemptId: string; questions: any[] }> {
    // Get template with questions
    const template = await quizTemplateService.getQuizTemplateWithQuestions(templateId);

    // Check attempt strategy
    if (template.attemptStrategy !== 'unlimited') {
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempt_details')
        .select('*')
        .eq('quiz_template_id', templateId)
        .order('attempt_number', { ascending: false })
        .limit(1);

      if (attemptsError) throw attemptsError;

      if (attempts && attempts.length > 0) {
        const lastAttempt = attempts[0];
        
        if (template.attemptStrategy === 'single_attempt') {
          throw new Error('Only one attempt is allowed for this quiz');
        }
        
        if (template.attemptStrategy === 'limited' && lastAttempt.attempt_number >= (template.maxAttempts || 1)) {
          throw new Error(`Maximum attempts (${template.maxAttempts}) reached`);
        }
      }
    }

    // Randomize questions if configured
    let questions = template.questions;
    if (template.randomizeQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    
    // Limit questions per attempt if configured
    if (template.questionsPerAttempt && template.questionsPerAttempt < questions.length) {
      questions = questions.slice(0, template.questionsPerAttempt);
    }

    // Create quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        student_id: studentId,
        lesson_id: lessonId,
        answers: [],
        score: 0,
        total_points: questions.reduce((sum, q) => sum + (q.points || 10), 0),
        percentage: 0
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Create attempt details
    const attemptNumber = 1; // Would be calculated from existing attempts
    await supabase
      .from('quiz_attempt_details')
      .insert({
        quiz_attempt_id: attempt.id,
        quiz_template_id: templateId,
        attempt_number: attemptNumber,
        time_limit_minutes: template.timeLimitMinutes,
        time_remaining_seconds: template.timeLimitMinutes ? template.timeLimitMinutes * 60 : null
      });

    return {
      attemptId: attempt.id,
      questions
    };
  },

  // Submit quiz attempt
  async submitQuizAttempt(
    attemptId: string,
    answers: any[]
  ): Promise<void> {
    // Get attempt with questions
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*, quiz_attempt_details (*)')
      .eq('id', attemptId)
      .single();

    if (attemptError) throw attemptError;

    // Calculate score
    let score = 0;
    const totalPoints = attempt.total_points;

    // Update attempt with answers and score
    const { error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        answers,
        score,
        percentage: (score / totalPoints) * 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', attemptId);

    if (updateError) throw updateError;
  }
};

export default {
  questionBankService,
  quizTemplateService,
  gradingRubricService,
  gradebookService,
  enhancedQuizService
};