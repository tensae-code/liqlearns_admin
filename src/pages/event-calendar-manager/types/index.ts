export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'live-session' | 'tutoring' | 'cultural' | 'competition' | 'announcement' | 'group-class';
  date: Date;
  startTime: string;
  endTime: string;
  language: string;
  targetLevel: 'beginner' | 'basic' | 'advanced' | 'pro' | 'elite';
  instructor: {
    id: string;
    name: string;
    avatar: string;
    alt: string;
  };
  capacity: number;
  registeredCount: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  location?: string;
  meetingLink?: string;
  participants: EventParticipant[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventParticipant {
  id: string;
  name: string;
  avatar: string;
  alt: string;
  registeredAt: Date;
  attended?: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  type: Event['type'];
  date: string;
  startTime: string;
  endTime: string;
  language: string;
  targetLevel: Event['targetLevel'];
  instructorId: string;
  capacity: number;
  isRecurring: boolean;
  recurringPattern?: Event['recurringPattern'];
  location?: string;
  meetingLink?: string;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  alt: string;
  languages: string[];
  specializations: string[];
  rating: number;
  totalSessions: number;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

export interface EventFilter {
  type?: Event['type'];
  language?: string;
  targetLevel?: Event['targetLevel'];
  instructorId?: string;
  status?: Event['status'];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  totalParticipants: number;
  averageAttendance: number;
}