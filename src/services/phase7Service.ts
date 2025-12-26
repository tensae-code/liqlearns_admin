import { supabase } from '../lib/supabase';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface VirtualClassroom {
  id: string;
  courseId: string;
  lessonId?: string;
  hostId: string;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  maxParticipants: number;
  recordingEnabled: boolean;
  recordingUrl?: string;
  meetingUrl?: string;
  meetingPassword?: string;
  whiteboardEnabled: boolean;
  screenShareEnabled: boolean;
  chatEnabled: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomParticipant {
  id: string;
  classroomId: string;
  userId: string;
  role: 'host' | 'co_host' | 'participant' | 'observer';
  joinedAt?: string;
  leftAt?: string;
  durationSeconds: number;
  screenShareCount: number;
  questionsAsked: number;
  engagementScore: number;
  createdAt: string;
}

export interface Whiteboard {
  id: string;
  classroomId: string;
  createdBy: string;
  title: string;
  description?: string;
  canvasData: any;
  thumbnailUrl?: string;
  isTemplate: boolean;
  isPublic: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhiteboardStroke {
  id: string;
  whiteboardId: string;
  userId: string;
  tool: 'pen' | 'eraser' | 'text' | 'shape' | 'image' | 'pointer';
  strokeData: any;
  color: string;
  width: number;
  zIndex: number;
  createdAt: string;
}

export interface ScreenShare {
  id: string;
  classroomId: string;
  userId: string;
  streamId: string;
  quality: 'low' | 'medium' | 'high' | 'auto';
  isAudioEnabled: boolean;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  viewerCount: number;
  recordingUrl?: string;
  createdAt: string;
}

export interface ClassroomChat {
  id: string;
  classroomId: string;
  userId: string;
  message: string;
  replyToId?: string;
  isQuestion: boolean;
  isAnswered: boolean;
  attachments: any[];
  reactions: any;
  createdAt: string;
}

export interface AIPersonalizationEngine {
  id: string;
  studentId: string;
  modelType: 'personalization' | 'recommendation' | 'assessment' | 'content_generation';
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  preferredPace?: string;
  strengths: any[];
  weaknesses: any[];
  interests: any[];
  goals: any[];
  modelVersion: string;
  lastTrained?: string;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdaptiveLearningPath {
  id: string;
  studentId: string;
  courseId: string;
  currentLessonId?: string;
  nextLessonId?: string;
  difficultyLevel: number;
  completionPercentage: number;
  estimatedCompletionDate?: string;
  adaptationHistory: any[];
  performanceMetrics: any;
  createdAt: string;
  updatedAt: string;
}

export interface AIRecommendation {
  id: string;
  studentId: string;
  recommendationType: string;
  contentId?: string;
  contentType?: string;
  title: string;
  description?: string;
  reason?: string;
  confidenceScore: number;
  priority: number;
  isAccepted?: boolean;
  acceptedAt?: string;
  expiresAt?: string;
  metadata: any;
  createdAt: string;
}

export interface LearningBehaviorAnalytics {
  id: string;
  studentId: string;
  sessionDate: string;
  totalStudyTimeMinutes: number;
  lessonsCompleted: number;
  quizzesAttempted: number;
  averageQuizScore: number;
  videosWatched: number;
  articlesRead: number;
  questionsAsked: number;
  peakActivityHour?: number;
  engagementLevel?: string;
  focusScore: number;
  createdAt: string;
}

export interface AIContentSuggestion {
  id: string;
  studentId: string;
  lessonId: string;
  suggestionType: string;
  originalContent?: string;
  suggestedContent: string;
  difficultyAdjustment?: 'easier' | 'same' | 'harder';
  reasoning?: string;
  aiModel?: string;
  confidenceScore: number;
  isApplied: boolean;
  appliedAt?: string;
  feedback?: string;
  createdAt: string;
}

// ============================================
// VIRTUAL CLASSROOMS
// ============================================

export const phase7Service = {
  // Virtual Classrooms
  async getVirtualClassrooms(courseId?: string): Promise<VirtualClassroom[]> {
    let query = supabase
      .from('virtual_classrooms')
      .select('*')
      .order('scheduled_start', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(classroom => ({
      id: classroom.id,
      courseId: classroom.course_id,
      lessonId: classroom.lesson_id,
      hostId: classroom.host_id,
      title: classroom.title,
      description: classroom.description,
      scheduledStart: classroom.scheduled_start,
      scheduledEnd: classroom.scheduled_end,
      actualStart: classroom.actual_start,
      actualEnd: classroom.actual_end,
      status: classroom.status,
      maxParticipants: classroom.max_participants,
      recordingEnabled: classroom.recording_enabled,
      recordingUrl: classroom.recording_url,
      meetingUrl: classroom.meeting_url,
      meetingPassword: classroom.meeting_password,
      whiteboardEnabled: classroom.whiteboard_enabled,
      screenShareEnabled: classroom.screen_share_enabled,
      chatEnabled: classroom.chat_enabled,
      metadata: classroom.metadata,
      createdAt: classroom.created_at,
      updatedAt: classroom.updated_at,
    }));
  },

  async createVirtualClassroom(classroom: Partial<VirtualClassroom>): Promise<VirtualClassroom> {
    const { data, error } = await supabase
      .from('virtual_classrooms')
      .insert({
        course_id: classroom.courseId,
        lesson_id: classroom.lessonId,
        host_id: classroom.hostId,
        title: classroom.title,
        description: classroom.description,
        scheduled_start: classroom.scheduledStart,
        scheduled_end: classroom.scheduledEnd,
        max_participants: classroom.maxParticipants || 100,
        recording_enabled: classroom.recordingEnabled || false,
        whiteboard_enabled: classroom.whiteboardEnabled !== false,
        screen_share_enabled: classroom.screenShareEnabled !== false,
        chat_enabled: classroom.chatEnabled !== false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      courseId: data.course_id,
      lessonId: data.lesson_id,
      hostId: data.host_id,
      title: data.title,
      description: data.description,
      scheduledStart: data.scheduled_start,
      scheduledEnd: data.scheduled_end,
      status: data.status,
      maxParticipants: data.max_participants,
      recordingEnabled: data.recording_enabled,
      whiteboardEnabled: data.whiteboard_enabled,
      screenShareEnabled: data.screen_share_enabled,
      chatEnabled: data.chat_enabled,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateClassroomStatus(classroomId: string, status: VirtualClassroom['status']): Promise<void> {
    const updates: any = { status };
    
    if (status === 'live') {
      updates.actual_start = new Date().toISOString();
    } else if (status === 'ended') {
      updates.actual_end = new Date().toISOString();
    }

    const { error } = await supabase
      .from('virtual_classrooms')
      .update(updates)
      .eq('id', classroomId);

    if (error) throw error;
  },

  // Classroom Participants
  async getClassroomParticipants(classroomId: string): Promise<ClassroomParticipant[]> {
    const { data, error } = await supabase
      .from('classroom_participants')
      .select('*')
      .eq('classroom_id', classroomId);

    if (error) throw error;

    return (data || []).map(participant => ({
      id: participant.id,
      classroomId: participant.classroom_id,
      userId: participant.user_id,
      role: participant.role,
      joinedAt: participant.joined_at,
      leftAt: participant.left_at,
      durationSeconds: participant.duration_seconds,
      screenShareCount: participant.screen_share_count,
      questionsAsked: participant.questions_asked,
      engagementScore: participant.engagement_score,
      createdAt: participant.created_at,
    }));
  },

  async joinClassroom(classroomId: string, userId: string, role: ClassroomParticipant['role'] = 'participant'): Promise<void> {
    // Check if user is already a participant in this classroom
    const { data: existingParticipant, error: checkError } = await supabase
      .from('classroom_participants')
      .select('id, left_at')
      .eq('classroom_id', classroomId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    // If user already exists and hasn't left, they're already in the classroom
    if (existingParticipant && !existingParticipant.left_at) {
      console.log('User is already in the classroom');
      return;
    }

    // If user exists but has left, update their record to rejoin
    if (existingParticipant && existingParticipant.left_at) {
      const { error: updateError } = await supabase
        .from('classroom_participants')
        .update({
          joined_at: new Date().toISOString(),
          left_at: null,
        })
        .eq('id', existingParticipant.id);

      if (updateError) throw updateError;
      return;
    }

    // User has never been a participant, insert new record
    const { error: insertError } = await supabase
      .from('classroom_participants')
      .insert({
        classroom_id: classroomId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;
  },

  async leaveClassroom(classroomId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('classroom_id', classroomId)
      .eq('user_id', userId)
      .is('left_at', null);

    if (error) throw error;
  },

  // Whiteboards
  async getWhiteboards(classroomId: string): Promise<Whiteboard[]> {
    const { data, error } = await supabase
      .from('whiteboards')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(whiteboard => ({
      id: whiteboard.id,
      classroomId: whiteboard.classroom_id,
      createdBy: whiteboard.created_by,
      title: whiteboard.title,
      description: whiteboard.description,
      canvasData: whiteboard.canvas_data,
      thumbnailUrl: whiteboard.thumbnail_url,
      isTemplate: whiteboard.is_template,
      isPublic: whiteboard.is_public,
      version: whiteboard.version,
      createdAt: whiteboard.created_at,
      updatedAt: whiteboard.updated_at,
    }));
  },

  async createWhiteboard(whiteboard: Partial<Whiteboard>): Promise<Whiteboard> {
    const { data, error } = await supabase
      .from('whiteboards')
      .insert({
        classroom_id: whiteboard.classroomId,
        created_by: whiteboard.createdBy,
        title: whiteboard.title,
        description: whiteboard.description,
        canvas_data: whiteboard.canvasData || { objects: [], background: '#ffffff' },
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      classroomId: data.classroom_id,
      createdBy: data.created_by,
      title: data.title,
      description: data.description,
      canvasData: data.canvas_data,
      thumbnailUrl: data.thumbnail_url,
      isTemplate: data.is_template,
      isPublic: data.is_public,
      version: data.version,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateWhiteboardCanvas(whiteboardId: string, canvasData: any): Promise<void> {
    const { error } = await supabase
      .from('whiteboards')
      .update({ 
        canvas_data: canvasData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', whiteboardId);

    if (error) throw error;
  },

  // Whiteboard Strokes (Real-time collaboration)
  async addWhiteboardStroke(stroke: Partial<WhiteboardStroke>): Promise<WhiteboardStroke> {
    const { data, error } = await supabase
      .from('whiteboard_strokes')
      .insert({
        whiteboard_id: stroke.whiteboardId,
        user_id: stroke.userId,
        tool: stroke.tool,
        stroke_data: stroke.strokeData,
        color: stroke.color || '#000000',
        width: stroke.width || 2,
        z_index: stroke.zIndex || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      whiteboardId: data.whiteboard_id,
      userId: data.user_id,
      tool: data.tool,
      strokeData: data.stroke_data,
      color: data.color,
      width: data.width,
      zIndex: data.z_index,
      createdAt: data.created_at,
    };
  },

  // Screen Sharing
  async startScreenShare(screenShare: Partial<ScreenShare>): Promise<ScreenShare> {
    const { data, error } = await supabase
      .from('screen_shares')
      .insert({
        classroom_id: screenShare.classroomId,
        user_id: screenShare.userId,
        stream_id: screenShare.streamId,
        quality: screenShare.quality || 'auto',
        is_audio_enabled: screenShare.isAudioEnabled || false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      classroomId: data.classroom_id,
      userId: data.user_id,
      streamId: data.stream_id,
      quality: data.quality,
      isAudioEnabled: data.is_audio_enabled,
      startedAt: data.started_at,
      durationSeconds: data.duration_seconds,
      viewerCount: data.viewer_count,
      createdAt: data.created_at,
    };
  },

  async endScreenShare(screenShareId: string): Promise<void> {
    const { error } = await supabase
      .from('screen_shares')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', screenShareId);

    if (error) throw error;
  },

  // Classroom Chat
  async getClassroomChat(classroomId: string): Promise<ClassroomChat[]> {
    const { data, error } = await supabase
      .from('classroom_chat')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(chat => ({
      id: chat.id,
      classroomId: chat.classroom_id,
      userId: chat.user_id,
      message: chat.message,
      replyToId: chat.reply_to_id,
      isQuestion: chat.is_question,
      isAnswered: chat.is_answered,
      attachments: chat.attachments,
      reactions: chat.reactions,
      createdAt: chat.created_at,
    }));
  },

  async sendChatMessage(message: Partial<ClassroomChat>): Promise<ClassroomChat> {
    const { data, error } = await supabase
      .from('classroom_chat')
      .insert({
        classroom_id: message.classroomId,
        user_id: message.userId,
        message: message.message,
        reply_to_id: message.replyToId,
        is_question: message.isQuestion || false,
        attachments: message.attachments || [],
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      classroomId: data.classroom_id,
      userId: data.user_id,
      message: data.message,
      replyToId: data.reply_to_id,
      isQuestion: data.is_question,
      isAnswered: data.is_answered,
      attachments: data.attachments,
      reactions: data.reactions,
      createdAt: data.created_at,
    };
  },

  // AI Personalization
  async getPersonalizationEngine(studentId: string): Promise<AIPersonalizationEngine | null> {
    const { data, error } = await supabase
      .from('ai_personalization_engines')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      id: data.id,
      studentId: data.student_id,
      modelType: data.model_type,
      learningStyle: data.learning_style,
      preferredPace: data.preferred_pace,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      interests: data.interests,
      goals: data.goals,
      modelVersion: data.model_version,
      lastTrained: data.last_trained,
      confidenceScore: data.confidence_score,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updatePersonalizationEngine(
    studentId: string,
    updates: Partial<AIPersonalizationEngine>
  ): Promise<void> {
    const { error } = await supabase
      .from('ai_personalization_engines')
      .update({
        learning_style: updates.learningStyle,
        preferred_pace: updates.preferredPace,
        strengths: updates.strengths,
        weaknesses: updates.weaknesses,
        interests: updates.interests,
        goals: updates.goals,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId);

    if (error) throw error;
  },

  // Adaptive Learning Paths
  async getAdaptiveLearningPath(studentId: string, courseId: string): Promise<AdaptiveLearningPath | null> {
    const { data, error } = await supabase
      .from('adaptive_learning_paths')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      id: data.id,
      studentId: data.student_id,
      courseId: data.course_id,
      currentLessonId: data.current_lesson_id,
      nextLessonId: data.next_lesson_id,
      difficultyLevel: data.difficulty_level,
      completionPercentage: data.completion_percentage,
      estimatedCompletionDate: data.estimated_completion_date,
      adaptationHistory: data.adaptation_history,
      performanceMetrics: data.performance_metrics,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateAdaptivePath(
    studentId: string,
    courseId: string,
    performanceScore: number
  ): Promise<void> {
    const { error } = await supabase.rpc('update_adaptive_learning_metrics', {
      p_student_id: studentId,
      p_course_id: courseId,
      p_performance_score: performanceScore,
    });

    if (error) throw error;
  },

  // AI Recommendations
  async getAIRecommendations(studentId: string): Promise<AIRecommendation[]> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('student_id', studentId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(rec => ({
      id: rec.id,
      studentId: rec.student_id,
      recommendationType: rec.recommendation_type,
      contentId: rec.content_id,
      contentType: rec.content_type,
      title: rec.title,
      description: rec.description,
      reason: rec.reason,
      confidenceScore: rec.confidence_score,
      priority: rec.priority,
      isAccepted: rec.is_accepted,
      acceptedAt: rec.accepted_at,
      expiresAt: rec.expires_at,
      metadata: rec.metadata,
      createdAt: rec.created_at,
    }));
  },

  async acceptRecommendation(recommendationId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({
        is_accepted: true,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', recommendationId);

    if (error) throw error;
  },

  // Learning Behavior Analytics
  async getLearningBehavior(studentId: string, days: number = 30): Promise<LearningBehaviorAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('learning_behavior_analytics')
      .select('*')
      .eq('student_id', studentId)
      .gte('session_date', startDate.toISOString().split('T')[0])
      .order('session_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(behavior => ({
      id: behavior.id,
      studentId: behavior.student_id,
      sessionDate: behavior.session_date,
      totalStudyTimeMinutes: behavior.total_study_time_minutes,
      lessonsCompleted: behavior.lessons_completed,
      quizzesAttempted: behavior.quizzes_attempted,
      averageQuizScore: behavior.average_quiz_score,
      videosWatched: behavior.videos_watched,
      articlesRead: behavior.articles_read,
      questionsAsked: behavior.questions_asked,
      peakActivityHour: behavior.peak_activity_hour,
      engagementLevel: behavior.engagement_level,
      focusScore: behavior.focus_score,
      createdAt: behavior.created_at,
    }));
  },

  // AI Content Suggestions
  async getContentSuggestions(studentId: string, lessonId: string): Promise<AIContentSuggestion[]> {
    const { data, error } = await supabase
      .from('ai_content_suggestions')
      .select('*')
      .eq('student_id', studentId)
      .eq('lesson_id', lessonId)
      .order('confidence_score', { ascending: false });

    if (error) throw error;

    return (data || []).map(suggestion => ({
      id: suggestion.id,
      studentId: suggestion.student_id,
      lessonId: suggestion.lesson_id,
      suggestionType: suggestion.suggestion_type,
      originalContent: suggestion.original_content,
      suggestedContent: suggestion.suggested_content,
      difficultyAdjustment: suggestion.difficulty_adjustment,
      reasoning: suggestion.reasoning,
      aiModel: suggestion.ai_model,
      confidenceScore: suggestion.confidence_score,
      isApplied: suggestion.is_applied,
      appliedAt: suggestion.applied_at,
      feedback: suggestion.feedback,
      createdAt: suggestion.created_at,
    }));
  },

  async applySuggestion(suggestionId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_content_suggestions')
      .update({
        is_applied: true,
        applied_at: new Date().toISOString(),
      })
      .eq('id', suggestionId);

    if (error) throw error;
  },
};