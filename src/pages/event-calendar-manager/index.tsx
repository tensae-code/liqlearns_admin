import React, { useState, useMemo } from 'react';
import { format, isAfter, isBefore, isSameDay } from 'date-fns';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import UserProfileIndicator from '../../components/ui/UserProfileIndicator';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NotificationCenter from '../../components/ui/NotificationCenter';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import CalendarView from './components/CalendarView';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import EventFilters from './components/EventFilters';
import EventStats from './components/EventStats';
import { Event, EventFormData, EventFilter, Instructor, EventStats as EventStatsType } from './types';

const EventCalendarManager = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<EventFilter>({});

  // Mock data
  const mockInstructors: Instructor[] = [
  {
    id: '1',
    name: 'Dr. Alemayehu Tadesse',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb44758a-1763293761079.png",
    alt: 'Middle-aged Ethiopian man with glasses and traditional white shirt smiling at camera',
    languages: ['Amharic', 'English'],
    specializations: ['Literature', 'Grammar'],
    rating: 4.9,
    totalSessions: 245
  },
  {
    id: '2',
    name: 'Tigist Mekonnen',
    avatar: "https://images.unsplash.com/photo-1690005903231-478a53feb401",
    alt: 'Young Ethiopian woman with braided hair wearing colorful traditional dress',
    languages: ['Tigrinya', 'Amharic'],
    specializations: ['Conversation', 'Cultural Studies'],
    rating: 4.8,
    totalSessions: 189
  },
  {
    id: '3',
    name: 'Bekele Worku',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bb44758a-1763293761079.png",
    alt: 'Ethiopian man in his thirties wearing blue collared shirt with warm smile',
    languages: ['Oromifa', 'English'],
    specializations: ['Business Language', 'Pronunciation'],
    rating: 4.7,
    totalSessions: 156
  },
  {
    id: '4',
    name: 'Hanan Ahmed',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19d90f11a-1763294201313.png",
    alt: 'Professional Ethiopian woman with hijab wearing navy blue blazer',
    languages: ['Somali', 'Arabic', 'English'],
    specializations: ['Translation', 'Advanced Grammar'],
    rating: 4.9,
    totalSessions: 203
  }];


  const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Amharic Beginner Class - Letters & Sounds',
    description: 'Introduction to Amharic alphabet (Fidel) and basic pronunciation. Learn the fundamental building blocks of Ethiopian writing system.',
    type: 'group-class',
    date: new Date(2024, 11, 15),
    startTime: '09:00',
    endTime: '10:30',
    language: 'amharic',
    targetLevel: 'beginner',
    instructor: mockInstructors[0],
    capacity: 25,
    registeredCount: 18,
    status: 'scheduled',
    isRecurring: true,
    recurringPattern: 'weekly',
    location: 'Online',
    meetingLink: 'https://meet.liqlearns.com/amharic-beginners',
    participants: [],
    createdBy: 'admin',
    createdAt: new Date(2024, 10, 1),
    updatedAt: new Date(2024, 10, 1)
  },
  {
    id: '2',
    title: 'Ethiopian Coffee Culture & Language',
    description: 'Explore Ethiopian coffee traditions while learning related vocabulary and cultural expressions in multiple languages.',
    type: 'cultural',
    date: new Date(2024, 11, 18),
    startTime: '14:00',
    endTime: '16:00',
    language: 'amharic',
    targetLevel: 'basic',
    instructor: mockInstructors[1],
    capacity: 30,
    registeredCount: 27,
    status: 'scheduled',
    isRecurring: false,
    location: 'Cultural Center, Addis Ababa',
    participants: [],
    createdBy: 'admin',
    createdAt: new Date(2024, 10, 5),
    updatedAt: new Date(2024, 10, 5)
  },
  {
    id: '3',
    title: 'Tigrinya Conversation Practice',
    description: 'Interactive session focusing on daily conversation skills, common phrases, and pronunciation improvement.',
    type: 'live-session',
    date: new Date(2024, 11, 20),
    startTime: '16:00',
    endTime: '17:00',
    language: 'tigrinya',
    targetLevel: 'advanced',
    instructor: mockInstructors[1],
    capacity: 15,
    registeredCount: 12,
    status: 'scheduled',
    isRecurring: true,
    recurringPattern: 'weekly',
    location: 'Online',
    meetingLink: 'https://meet.liqlearns.com/tigrinya-conversation',
    participants: [],
    createdBy: 'admin',
    createdAt: new Date(2024, 10, 8),
    updatedAt: new Date(2024, 10, 8)
  },
  {
    id: '4',
    title: 'Oromifa Business Language Workshop',
    description: 'Professional Oromifa language skills for business communication, presentations, and formal correspondence.',
    type: 'tutoring',
    date: new Date(2024, 11, 22),
    startTime: '10:00',
    endTime: '12:00',
    language: 'oromifa',
    targetLevel: 'pro',
    instructor: mockInstructors[2],
    capacity: 8,
    registeredCount: 6,
    status: 'scheduled',
    isRecurring: false,
    location: 'Online',
    meetingLink: 'https://meet.liqlearns.com/oromifa-business',
    participants: [],
    createdBy: 'admin',
    createdAt: new Date(2024, 10, 12),
    updatedAt: new Date(2024, 10, 12)
  },
  {
    id: '5',
    title: 'Multi-Language Poetry Competition',
    description: 'Annual poetry competition featuring works in Amharic, Tigrinya, and Oromifa. Participants showcase their linguistic creativity.',
    type: 'competition',
    date: new Date(2024, 11, 25),
    startTime: '18:00',
    endTime: '20:30',
    language: 'amharic',
    targetLevel: 'elite',
    instructor: mockInstructors[0],
    capacity: 50,
    registeredCount: 43,
    status: 'scheduled',
    isRecurring: false,
    location: 'National Theater, Addis Ababa',
    participants: [],
    createdBy: 'admin',
    createdAt: new Date(2024, 9, 15),
    updatedAt: new Date(2024, 9, 15)
  },
  {
    id: '6',
    title: 'Platform Maintenance Announcement',
    description: 'Scheduled maintenance window for system updates and performance improvements. All live sessions will be temporarily unavailable.',
    type: 'announcement',
    date: new Date(2024, 11, 28),
    startTime: '02:00',
    endTime: '06:00',
    language: 'amharic',
    targetLevel: 'beginner',
    instructor: mockInstructors[3],
    capacity: 1000,
    registeredCount: 0,
    status: 'scheduled',
    isRecurring: false,
    participants: [],
    createdBy: 'admin',
    createdAt: new Date(2024, 10, 20),
    updatedAt: new Date(2024, 10, 20)
  }];


  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      if (filters.type && event.type !== filters.type) return false;
      if (filters.language && event.language !== filters.language) return false;
      if (filters.targetLevel && event.targetLevel !== filters.targetLevel) return false;
      if (filters.instructorId && event.instructor.id !== filters.instructorId) return false;
      if (filters.status && event.status !== filters.status) return false;

      if (filters.dateRange) {
        if (filters.dateRange.start && isBefore(event.date, filters.dateRange.start)) return false;
        if (filters.dateRange.end && isAfter(event.date, filters.dateRange.end)) return false;
      }

      return true;
    });
  }, [filters]);

  // Calculate event statistics
  const eventStats: EventStatsType = useMemo(() => {
    const now = new Date();
    const upcomingEvents = mockEvents.filter((event) => isAfter(event.date, now) && event.status === 'scheduled').length;
    const ongoingEvents = mockEvents.filter((event) => event.status === 'ongoing').length;
    const completedEvents = mockEvents.filter((event) => event.status === 'completed').length;
    const totalParticipants = mockEvents.reduce((sum, event) => sum + event.registeredCount, 0);
    const averageAttendance = Math.round(
      mockEvents.reduce((sum, event) => sum + event.registeredCount / event.capacity * 100, 0) / mockEvents.length
    );

    return {
      totalEvents: mockEvents.length,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalParticipants,
      averageAttendance
    };
  }, []);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      console.log('Deleting event:', eventId);
      // In a real app, this would make an API call
    }
  };

  const handleViewEvent = (event: Event) => {
    console.log('Viewing event details:', event);
    // In a real app, this would open a detailed view modal
  };

  const handleEventSubmit = (formData: EventFormData) => {
    console.log('Submitting event:', formData);
    // In a real app, this would make an API call
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleEventClick = (event: Event) => {
    handleViewEvent(event);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const sidebarWidth = isSidebarCollapsed ? 'ml-16' : 'ml-60';

  // Add breadcrumb items
  const breadcrumbItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Events', href: '/events' },
  { label: 'Calendar Manager' }];


  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />


      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarWidth}`}>
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BreadcrumbNavigation items={breadcrumbItems} />
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter
                onNotificationClick={(id) => console.log('Notification clicked:', id)}
                onMarkAsRead={(id) => console.log('Mark as read:', id)}
                onMarkAllAsRead={() => console.log('Mark all as read')} />

              <UserProfileIndicator
                userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                onLogout={() => console.log('Logout')}
                onProfileClick={() => console.log('Profile clicked')} />

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Event Calendar Manager
              </h1>
              <p className="font-body text-muted-foreground">
                Schedule and manage educational events, live sessions, and community activities
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'calendar' ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`
                  }>

                  <Icon name="Calendar" size={16} className="mr-2" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list' ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`
                  }>

                  <Icon name="List" size={16} className="mr-2" />
                  List
                </button>
              </div>

              <Button
                onClick={handleCreateEvent}
                iconName="Plus"
                iconPosition="left">

                Create Event
              </Button>
            </div>
          </div>

          {/* Event Statistics */}
          <EventStats stats={eventStats} />

          {/* Event Filters */}
          <EventFilters
            filters={filters}
            instructors={mockInstructors}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters} />


          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar/List View */}
            <div className="lg:col-span-2">
              {viewMode === 'calendar' ?
              <CalendarView
                events={filteredEvents}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onEventClick={handleEventClick} /> :


              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading font-semibold text-xl text-foreground">
                      Events List
                    </h2>
                    <span className="font-body text-sm text-muted-foreground">
                      {filteredEvents.length} events found
                    </span>
                  </div>
                  <EventList
                  events={filteredEvents}
                  onEventEdit={handleEditEvent}
                  onEventDelete={handleDeleteEvent}
                  onEventView={handleViewEvent} />

                </div>
              }
            </div>

            {/* Upcoming Events Sidebar */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-heading font-semibold text-lg text-card-foreground mb-4">
                  Today's Events
                </h3>
                
                {filteredEvents.
                filter((event) => isSameDay(event.date, selectedDate)).
                slice(0, 3).
                map((event) =>
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors duration-200"
                  onClick={() => handleViewEvent(event)}>

                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-medium text-sm text-card-foreground truncate">
                          {event.title}
                        </p>
                        <p className="font-caption text-xs text-muted-foreground">
                          {event.startTime} - {event.endTime}
                        </p>
                        <p className="font-caption text-xs text-muted-foreground">
                          {event.instructor.name}
                        </p>
                      </div>
                    </div>
                )}

                {filteredEvents.filter((event) => isSameDay(event.date, selectedDate)).length === 0 &&
                <div className="text-center py-8">
                    <Icon name="Calendar" size={32} className="text-muted-foreground mx-auto mb-2" />
                    <p className="font-body text-sm text-muted-foreground">
                      No events scheduled for {format(selectedDate, 'dd/MM/yyyy')}
                    </p>
                  </div>
                }
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-heading font-semibold text-lg text-card-foreground mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Video"
                    iconPosition="left"
                    onClick={() => console.log('Start live session')}>

                    Start Live Session
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Users"
                    iconPosition="left"
                    onClick={() => console.log('Manage participants')}>

                    Manage Participants
                  </Button>
                  
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Download"
                    iconPosition="left"
                    onClick={() => console.log('Export calendar')}>

                    Export Calendar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Event Form Modal */}
      {showEventForm &&
      <div className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4">
         <div className="relative z-[1110] bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="font-heading font-semibold text-xl text-card-foreground">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
            </div>
            
            <div className="p-6">
              <EventForm
              initialData={editingEvent ? {
                title: editingEvent.title,
                description: editingEvent.description,
                type: editingEvent.type,
                date: format(editingEvent.date, 'yyyy-MM-dd'),
                startTime: editingEvent.startTime,
                endTime: editingEvent.endTime,
                language: editingEvent.language,
                targetLevel: editingEvent.targetLevel,
                instructorId: editingEvent.instructor.id,
                capacity: editingEvent.capacity,
                isRecurring: editingEvent.isRecurring,
                recurringPattern: editingEvent.recurringPattern,
                location: editingEvent.location,
                meetingLink: editingEvent.meetingLink
              } : undefined}
              instructors={mockInstructors}
              onSubmit={handleEventSubmit}
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }} />

            </div>
          </div>
        </div>
      }
    </div>);

};

export default EventCalendarManager;