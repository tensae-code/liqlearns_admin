import { supabase } from '../lib/supabase';

export interface CalendarEvent {
  id: string;
  hostId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  maxParticipants?: number;
  participantCount: number;
  eventType: 'workshop' | 'cultural' | 'study' | 'competition' | 'celebration' | 'other';
  createdAt: string;
  updatedAt: string;
  hostName?: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  joinedAt: string;
  userName?: string;
}

class CalendarEventsService {
  async createEvent(eventData: {
    hostId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    isPublic: boolean;
    eventType: string;
    maxParticipants?: number;
  }): Promise<CalendarEvent> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          host_id: eventData.hostId,
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          is_public: eventData.isPublic,
          requires_approval: eventData.isPublic, // Public events require CEO approval
          is_approved: !eventData.isPublic, // Private events auto-approved
          event_type: eventData.eventType,
          max_participants: eventData.maxParticipants,
          participant_count: 0
        })
        .select(`
          *,
          user_profiles!calendar_events_host_id_fkey(full_name, email)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        hostId: data.host_id,
        title: data.title,
        description: data.description,
        startTime: data.start_time,
        endTime: data.end_time,
        isPublic: data.is_public,
        requiresApproval: data.requires_approval,
        isApproved: data.is_approved,
        approvedBy: data.approved_by,
        maxParticipants: data.max_participants,
        participantCount: data.participant_count,
        eventType: data.event_type,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        hostName: data.user_profiles?.full_name || data.user_profiles?.email?.split('@')[0]
      };
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw new Error(error.message || 'Failed to create event');
    }
  }

  async getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
    try {
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          user_profiles!calendar_events_host_id_fkey(full_name, email)
        `)
        .eq('is_approved', true)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map(event => ({
        id: event.id,
        hostId: event.host_id,
        title: event.title,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        isPublic: event.is_public,
        requiresApproval: event.requires_approval,
        isApproved: event.is_approved,
        approvedBy: event.approved_by,
        maxParticipants: event.max_participants,
        participantCount: event.participant_count,
        eventType: event.event_type,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        hostName: event.user_profiles?.full_name || event.user_profiles?.email?.split('@')[0]
      }));
    } catch (error: any) {
      console.error('Error fetching events:', error);
      throw new Error(error.message || 'Failed to fetch events');
    }
  }

  async joinEvent(eventId: string, userId: string): Promise<void> {
    try {
      // Check if already joined
      const { data: existing } = await supabase
        .from('calendar_event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        throw new Error('Already joined this event');
      }

      // Check max participants
      const { data: event } = await supabase
        .from('calendar_events')
        .select('max_participants, participant_count')
        .eq('id', eventId)
        .single();

      if (event?.max_participants && event.participant_count >= event.max_participants) {
        throw new Error('Event is full');
      }

      await supabase
        .from('calendar_event_participants')
        .insert({
          event_id: eventId,
          user_id: userId
        });
    } catch (error: any) {
      console.error('Error joining event:', error);
      throw new Error(error.message || 'Failed to join event');
    }
  }

  async leaveEvent(eventId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('calendar_event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
    } catch (error: any) {
      console.error('Error leaving event:', error);
      throw new Error(error.message || 'Failed to leave event');
    }
  }

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_event_participants')
        .select(`
          *,
          user_profiles!calendar_event_participants_user_id_fkey(full_name, email)
        `)
        .eq('event_id', eventId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(participant => ({
        id: participant.id,
        eventId: participant.event_id,
        userId: participant.user_id,
        joinedAt: participant.joined_at,
        userName: participant.user_profiles?.full_name || participant.user_profiles?.email?.split('@')[0]
      }));
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      throw new Error(error.message || 'Failed to fetch participants');
    }
  }

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          user_profiles!calendar_events_host_id_fkey(full_name, email)
        `)
        .eq('is_approved', true)
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) throw error;

      return (data || []).map(event => ({
        id: event.id,
        hostId: event.host_id,
        title: event.title,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        isPublic: event.is_public,
        requiresApproval: event.requires_approval,
        isApproved: event.is_approved,
        approvedBy: event.approved_by,
        maxParticipants: event.max_participants,
        participantCount: event.participant_count,
        eventType: event.event_type,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        hostName: event.user_profiles?.full_name || event.user_profiles?.email?.split('@')[0]
      }));
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error);
      throw new Error(error.message || 'Failed to fetch upcoming events');
    }
  }
}

export const calendarEventsService = new CalendarEventsService();