import React from 'react';
import { format } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Event } from '../types';

interface EventListProps {
  events: Event[];
  onEventEdit: (event: Event) => void;
  onEventDelete: (eventId: string) => void;
  onEventView: (event: Event) => void;
  className?: string;
}

const EventList = ({
  events,
  onEventEdit,
  onEventDelete,
  onEventView,
  className = ''
}: EventListProps) => {
  const getEventTypeIcon = (type: Event['type']): string => {
    switch (type) {
      case 'live-session': return 'Video';
      case 'tutoring': return 'UserCheck';
      case 'cultural': return 'Calendar';
      case 'competition': return 'Trophy';
      case 'announcement': return 'Megaphone';
      case 'group-class': return 'Users';
      default: return 'Calendar';
    }
  };

  const getEventTypeColor = (type: Event['type']): string => {
    switch (type) {
      case 'live-session': return 'text-primary bg-primary/10';
      case 'tutoring': return 'text-accent bg-accent/10';
      case 'cultural': return 'text-success bg-success/10';
      case 'competition': return 'text-warning bg-warning/10';
      case 'announcement': return 'text-secondary bg-secondary/10';
      case 'group-class': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusColor = (status: Event['status']): string => {
    switch (status) {
      case 'scheduled': return 'text-primary bg-primary/10';
      case 'ongoing': return 'text-success bg-success/10';
      case 'completed': return 'text-muted-foreground bg-muted';
      case 'cancelled': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatEventTime = (event: Event): string => {
    return `${event.startTime} - ${event.endTime}`;
  };

  const getCapacityStatus = (event: Event): { color: string; percentage: number } => {
    const percentage = (event.registeredCount / event.capacity) * 100;
    if (percentage >= 90) return { color: 'text-error', percentage };
    if (percentage >= 70) return { color: 'text-warning', percentage };
    return { color: 'text-success', percentage };
  };

  if (events.length === 0) {
    return (
      <div className={`bg-card rounded-lg border border-border p-8 text-center ${className}`}>
        <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-lg text-card-foreground mb-2">
          No Events Found
        </h3>
        <p className="font-body text-muted-foreground">
          No events match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {events.map(event => {
        const capacityStatus = getCapacityStatus(event);
        
        return (
          <div
            key={event.id}
            className="bg-card rounded-lg border border-border p-6 hover:shadow-card transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                {/* Event Type Icon */}
                <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                  <Icon name={getEventTypeIcon(event.type)} size={20} />
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-heading font-semibold text-lg text-card-foreground truncate">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                    {event.isRecurring && (
                      <Icon name="Repeat" size={16} className="text-muted-foreground" title="Recurring event" />
                    )}
                  </div>

                  <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Icon name="Calendar" size={14} className="text-muted-foreground" />
                      <span className="font-body text-card-foreground">
                        {format(event.date, 'dd/MM/yyyy')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Icon name="Clock" size={14} className="text-muted-foreground" />
                      <span className="font-body text-card-foreground">
                        {formatEventTime(event)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Icon name="Globe" size={14} className="text-muted-foreground" />
                      <span className="font-body text-card-foreground capitalize">
                        {event.language}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Icon name="Target" size={14} className="text-muted-foreground" />
                      <span className="font-body text-card-foreground capitalize">
                        {event.targetLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Eye"
                  onClick={() => onEventView(event)}
                  aria-label="View event details"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Edit"
                  onClick={() => onEventEdit(event)}
                  aria-label="Edit event"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Trash2"
                  onClick={() => onEventDelete(event.id)}
                  aria-label="Delete event"
                />
              </div>
            </div>

            {/* Instructor and Capacity Info */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-3">
                <Image
                  src={event.instructor.avatar}
                  alt={event.instructor.alt}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-body font-medium text-sm text-card-foreground">
                    {event.instructor.name}
                  </p>
                  <p className="font-caption text-xs text-muted-foreground">
                    Instructor
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Capacity Status */}
                <div className="flex items-center space-x-2">
                  <Icon name="Users" size={14} className="text-muted-foreground" />
                  <span className={`font-body text-sm ${capacityStatus.color}`}>
                    {event.registeredCount}/{event.capacity}
                  </span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        capacityStatus.percentage >= 90 ? 'bg-error' :
                        capacityStatus.percentage >= 70 ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${Math.min(capacityStatus.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Location/Link */}
                {event.location && (
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} className="text-muted-foreground" />
                    <span className="font-body text-xs text-muted-foreground">
                      {event.location}
                    </span>
                  </div>
                )}

                {event.meetingLink && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Link" size={14} className="text-muted-foreground" />
                    <span className="font-body text-xs text-muted-foreground">
                      Online
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;