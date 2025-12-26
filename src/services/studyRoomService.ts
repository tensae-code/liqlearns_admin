import { supabase } from '../lib/supabase';

// Type Definitions - FIXED: Match database age_group enum
export type AgeGroup = '13-16' | '17-20' | '21-25' | '26-30' | '30+';
export type StudyRoomStatus = 'waiting' | 'active' | 'ended';
export type InteractionType = 'like' | 'gift' | 'pin' | 'unpin';
export type GiftType = 'coffee' | 'book' | 'trophy' | 'star' | 'heart';

export interface StudyRoom {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  status: StudyRoomStatus;
  currentParticipants: number;
  maxParticipants: number;
  meetingLink: string | null;
  meetingPassword: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyRoomParticipant {
  id: string;
  roomId: string;
  studentId: string;
  displayName: string;
  avatarUrl: string | null;
  badgeUrl: string | null;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  currentCourse: string | null;
  joinedAt: string;
  leftAt: string | null;
  totalStudyTimeMinutes: number;
  giftsReceived: number;
  likesReceived: number;
  isPinnedByOthers: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  studentId: string;
  message: string;
  isAnnouncement: boolean;
  createdAt: string;
}

export interface StudyRoomInteraction {
  id: string;
  roomId: string;
  fromStudentId: string;
  toStudentId: string;
  interactionType: InteractionType;
  giftType?: GiftType;
  auraPointsSpent: number;
  createdAt: string;
}

class StudyRoomService {
  // Get all available rooms for a student
  async getAvailableRooms(studentId?: string): Promise<StudyRoom[]> {
    try {
      // If studentId provided, filter by age group
      if (studentId) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('date_of_birth')
          .eq('id', studentId)
          .single();

        if (!profileError && profileData?.date_of_birth) {
          return this.getAgeAppropriateRooms(profileData.date_of_birth);
        }
      }

      // Fallback: return all active rooms
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .neq('status', 'ended')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.transformStudyRooms(data || []);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  }

  // Get age-appropriate rooms for a student
  async getAgeAppropriateRooms(dateOfBirth: string): Promise<StudyRoom[]> {
    try {
      // Use database function to calculate age group
      const { data: ageGroupData, error: ageGroupError } = await supabase
        .rpc('calculate_age_group', { birth_date: dateOfBirth });

      if (ageGroupError) {
        console.error('Error calculating age group:', ageGroupError);
        // Fallback to manual calculation
        const ageGroup = this.calculateAgeGroup(dateOfBirth);
        return this.getRoomsByAgeGroup(ageGroup);
      }

      return this.getRoomsByAgeGroup(ageGroupData as AgeGroup);
    } catch (error) {
      console.error('Error fetching age-appropriate rooms:', error);
      throw error;
    }
  }

  // Get rooms by age group
  private async getRoomsByAgeGroup(ageGroup: AgeGroup): Promise<StudyRoom[]> {
    const { data, error } = await supabase
      .from('study_rooms')
      .select('*')
      .eq('age_group', ageGroup)
      .neq('status', 'ended')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return this.transformStudyRooms(data || []);
  }

  // Calculate age group from date of birth - FIXED: Match database enum
  private calculateAgeGroup(dateOfBirth: string): AgeGroup {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;

    if (actualAge >= 13 && actualAge <= 16) return '13-16';
    if (actualAge >= 17 && actualAge <= 20) return '17-20';
    if (actualAge >= 21 && actualAge <= 25) return '21-25';
    if (actualAge >= 26 && actualAge <= 30) return '26-30';
    return '30+';
  }

  // Transform database rows to StudyRoom objects
  private transformStudyRooms(rooms: any[]): StudyRoom[] {
    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      ageGroup: room.age_group,
      status: room.status,
      currentParticipants: room.current_participants,
      maxParticipants: room.max_participants,
      meetingLink: room.meeting_link,
      meetingPassword: room.meeting_password,
      startedAt: room.started_at,
      endedAt: room.ended_at,
      createdAt: room.created_at,
      updatedAt: room.updated_at,
    }));
  }

  // Create a new study room
  async createStudyRoom(name: string, studentDateOfBirth: string, maxParticipants: number = 12): Promise<StudyRoom> {
    try {
      const ageGroup = this.calculateAgeGroup(studentDateOfBirth);
      
      const { data, error } = await supabase
        .from('study_rooms')
        .insert({
          name,
          age_group: ageGroup,
          max_participants: maxParticipants,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformStudyRooms([data])[0];
    } catch (error) {
      console.error('Error creating study room:', error);
      throw error;
    }
  }

  // NEW: Join a study room
  async joinRoom(
    roomId: string,
    participantInfo: {
      display_name: string;
      avatar_url?: string | null;
      current_course?: string | null;
    }
  ): Promise<StudyRoomParticipant> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_room_participants')
        .insert({
          room_id: roomId,
          student_id: user.id,
          display_name: participantInfo.display_name,
          avatar_url: participantInfo.avatar_url || null,
          current_course: participantInfo.current_course || null,
          camera_enabled: false,
          microphone_enabled: false,
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformParticipant(data);
    } catch (error) {
      console.error('Error joining study room:', error);
      throw error;
    }
  }

  // NEW: Leave study room
  async leaveRoom(roomId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('study_room_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('student_id', user.id)
        .is('left_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving study room:', error);
      throw error;
    }
  }

  // Get participants in a room
  async getRoomParticipants(roomId: string): Promise<StudyRoomParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('study_room_participants')
        .select('*')
        .eq('room_id', roomId)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.transformParticipant);
    } catch (error) {
      console.error('Error fetching room participants:', error);
      throw error;
    }
  }

  // Transform participant data
  private transformParticipant(p: any): StudyRoomParticipant {
    return {
      id: p.id,
      roomId: p.room_id,
      studentId: p.student_id,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      badgeUrl: p.badge_url,
      cameraEnabled: p.camera_enabled,
      microphoneEnabled: p.microphone_enabled,
      currentCourse: p.current_course,
      joinedAt: p.joined_at,
      leftAt: p.left_at,
      totalStudyTimeMinutes: p.total_study_time_minutes,
      giftsReceived: p.gifts_received,
      likesReceived: p.likes_received,
      isPinnedByOthers: p.is_pinned_by_others,
    };
  }

  // NEW: Update participant media settings
  async updateMediaStatus(
    roomId: string,
    cameraEnabled: boolean,
    microphoneEnabled: boolean
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('study_room_participants')
        .update({
          camera_enabled: cameraEnabled,
          microphone_enabled: microphoneEnabled,
        })
        .eq('room_id', roomId)
        .eq('student_id', user.id)
        .is('left_at', null);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating media settings:', error);
      throw error;
    }
  }

  // NEW: Send chat message
  async sendMessage(
    roomId: string,
    message: string,
    isAnnouncement: boolean = false
  ): Promise<ChatMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_room_chat')
        .insert({
          room_id: roomId,
          student_id: user.id,
          message,
          is_announcement: isAnnouncement,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        roomId: data.room_id,
        studentId: data.student_id,
        message: data.message,
        isAnnouncement: data.is_announcement,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Get chat messages
  async getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('study_room_chat')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        roomId: msg.room_id,
        studentId: msg.student_id,
        message: msg.message,
        isAnnouncement: msg.is_announcement,
        createdAt: msg.created_at,
      })).reverse();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  // NEW: Send interaction (like, gift, pin)
  async sendInteraction(
    roomId: string,
    toStudentId: string,
    interactionType: InteractionType,
    giftType?: GiftType
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // For gifts, calculate aura points (example: 10 points per gift)
      const auraPointsSpent = interactionType === 'gift' ? 10 : 0;

      const { error } = await supabase
        .from('study_room_interactions')
        .insert({
          room_id: roomId,
          from_student_id: user.id,
          to_student_id: toStudentId,
          interaction_type: interactionType,
          gift_type: giftType || null,
          aura_points_spent: auraPointsSpent,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending interaction:', error);
      throw error;
    }
  }

  // NEW: Subscribe to room updates with proper callback structure
  subscribeToRoom(
    roomId: string,
    callbacks: {
      onParticipantChange: (participants: StudyRoomParticipant[]) => void;
      onMessage: (message: ChatMessage) => void;
      onInteraction: (interaction: any) => void;
    }
  ) {
    // Subscribe to participant changes
    const participantChannel = supabase
      .channel(`study_room_participants_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // Reload participants when changes occur
          const participants = await this.getRoomParticipants(roomId);
          callbacks.onParticipantChange(participants);
        }
      )
      .subscribe();

    // Subscribe to chat messages
    const chatChannel = supabase
      .channel(`study_room_chat_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_room_chat',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage: ChatMessage = {
            id: payload.new.id,
            roomId: payload.new.room_id,
            studentId: payload.new.student_id,
            message: payload.new.message,
            isAnnouncement: payload.new.is_announcement,
            createdAt: payload.new.created_at,
          };
          callbacks.onMessage(newMessage);
        }
      )
      .subscribe();

    // Subscribe to interactions
    const interactionChannel = supabase
      .channel(`study_room_interactions_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_room_interactions',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          callbacks.onInteraction(payload.new);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      participantChannel.unsubscribe();
      chatChannel.unsubscribe();
      interactionChannel.unsubscribe();
    };
  }

  // Get age group display name
  getAgeGroupDisplayName(ageGroup: AgeGroup): string {
    const names: Record<AgeGroup, string> = {
      '13-16': 'Teens (13-16)',
      '17-20': 'Young Adults (17-20)',
      '21-25': 'Adults (21-25)',
      '26-30': 'Mature Adults (26-30)',
      '30+': 'Experienced (30+)',
    };
    return names[ageGroup];
  }
}

export const studyRoomService = new StudyRoomService();