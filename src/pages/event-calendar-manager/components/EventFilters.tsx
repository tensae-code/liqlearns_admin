import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { EventFilter, Instructor } from '../types';

interface EventFiltersProps {
  filters: EventFilter;
  instructors: Instructor[];
  onFiltersChange: (filters: EventFilter) => void;
  onClearFilters: () => void;
  className?: string;
}

const EventFilters = ({
  filters,
  instructors,
  onFiltersChange,
  onClearFilters,
  className = ''
}: EventFiltersProps) => {
  const eventTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'live-session', label: 'Live Sessions' },
    { value: 'tutoring', label: '1-to-1 Tutoring' },
    { value: 'cultural', label: 'Cultural Events' },
    { value: 'competition', label: 'Competitions' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'group-class', label: 'Group Classes' }
  ];

  const languageOptions = [
    { value: '', label: 'All Languages' },
    { value: 'amharic', label: 'Amharic (አማርኛ)' },
    { value: 'tigrinya', label: 'Tigrinya (ትግርኛ)' },
    { value: 'oromifa', label: 'Oromifa (Afaan Oromoo)' },
    { value: 'somali', label: 'Somali' },
    { value: 'sidama', label: 'Sidama' },
    { value: 'wolaytta', label: 'Wolaytta' },
    { value: 'gurage', label: 'Gurage' },
    { value: 'hadiyya', label: 'Hadiyya' }
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner (Letters)' },
    { value: 'basic', label: 'Basic (Words)' },
    { value: 'advanced', label: 'Advanced (Sentences)' },
    { value: 'pro', label: 'Pro (Paragraphs)' },
    { value: 'elite', label: 'Elite (Advanced)' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const instructorOptions = [
    { value: '', label: 'All Instructors' },
    ...instructors.map(instructor => ({
      value: instructor.id,
      label: instructor.name,
      description: `${instructor.languages.join(', ')} • ${instructor.rating}★`
    }))
  ];

  const handleFilterChange = (field: keyof EventFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const dateRange = filters.dateRange || { start: new Date(), end: new Date() };
    const newDateRange = {
      ...dateRange,
      [field]: value ? new Date(value) : undefined
    };

    onFiltersChange({
      ...filters,
      dateRange: newDateRange.start || newDateRange.end ? newDateRange : undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (typeof value !== 'object' || (value && Object.keys(value).length > 0))
  );

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-lg text-card-foreground">
          Filter Events
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Event Type Filter */}
        <Select
          label="Event Type"
          options={eventTypeOptions}
          value={filters.type || ''}
          onChange={(value) => handleFilterChange('type', value)}
          placeholder="Select type"
        />

        {/* Language Filter */}
        <Select
          label="Language"
          options={languageOptions}
          value={filters.language || ''}
          onChange={(value) => handleFilterChange('language', value)}
          placeholder="Select language"
        />

        {/* Target Level Filter */}
        <Select
          label="Target Level"
          options={levelOptions}
          value={filters.targetLevel || ''}
          onChange={(value) => handleFilterChange('targetLevel', value)}
          placeholder="Select level"
        />

        {/* Status Filter */}
        <Select
          label="Status"
          options={statusOptions}
          value={filters.status || ''}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Select status"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Instructor Filter */}
        <Select
          label="Instructor"
          options={instructorOptions}
          value={filters.instructorId || ''}
          onChange={(value) => handleFilterChange('instructorId', value)}
          placeholder="Select instructor"
          searchable
        />

        {/* Date Range Filters */}
        <Input
          label="Start Date"
          type="date"
          value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
          onChange={(e) => handleDateRangeChange('start', e.target.value)}
          placeholder="Select start date"
        />

        <Input
          label="End Date"
          type="date"
          value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
          onChange={(e) => handleDateRangeChange('end', e.target.value)}
          placeholder="Select end date"
        />
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {filters.type && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Type: {eventTypeOptions.find(opt => opt.value === filters.type)?.label}
              </span>
            )}
            {filters.language && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Language: {languageOptions.find(opt => opt.value === filters.language)?.label}
              </span>
            )}
            {filters.targetLevel && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Level: {levelOptions.find(opt => opt.value === filters.targetLevel)?.label}
              </span>
            )}
            {filters.status && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
              </span>
            )}
            {filters.instructorId && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Instructor: {instructors.find(inst => inst.id === filters.instructorId)?.name}
              </span>
            )}
            {filters.dateRange && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Date Range Applied
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilters;