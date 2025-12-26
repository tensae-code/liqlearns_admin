import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import Icon from '../../../components/AppIcon';
import { Event } from '../types';

interface CalendarViewProps {
  events: Event[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: Event) => void;
  className?: string;
}

const CalendarView = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
  className = ''
}: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getEventTypeColor = (type: Event['type']): string => {
    switch (type) {
      case 'live-session': return 'bg-primary text-primary-foreground';
      case 'tutoring': return 'bg-accent text-accent-foreground';
      case 'cultural': return 'bg-success text-success-foreground';
      case 'competition': return 'bg-warning text-warning-foreground';
      case 'announcement': return 'bg-secondary text-secondary-foreground';
      case 'group-class': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-heading font-semibold text-lg text-card-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
            aria-label="Previous month"
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm font-body rounded-lg hover:bg-muted transition-colors duration-200"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
            aria-label="Next month"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center">
              <span className="font-body font-medium text-sm text-muted-foreground">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(date => {
            const dayEvents = getEventsForDate(date);
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            const isCurrentMonthDay = isSameMonth(date, currentMonth);

            return (
              <button
                key={date.toISOString()}
                onClick={() => onDateSelect(date)}
                className={`
                  relative p-2 min-h-[80px] rounded-lg border transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10' :'border-transparent hover:border-border hover:bg-muted/50'
                  }
                  ${!isCurrentMonthDay ? 'opacity-40' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`
                    font-body text-sm
                    ${isCurrentDay 
                      ? 'w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium' 
                      : isCurrentMonthDay 
                        ? 'text-card-foreground' 
                        : 'text-muted-foreground'
                    }
                  `}>
                    {format(date, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>

                {/* Event Indicators */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`
                        px-1 py-0.5 rounded text-xs font-body truncate cursor-pointer
                        ${getEventTypeColor(event.type)}
                      `}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground font-body">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="font-body text-xs text-muted-foreground">Live Sessions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full" />
            <span className="font-body text-xs text-muted-foreground">Tutoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full" />
            <span className="font-body text-xs text-muted-foreground">Cultural Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full" />
            <span className="font-body text-xs text-muted-foreground">Competitions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;