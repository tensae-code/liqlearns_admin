import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { EventFormData, Instructor } from '../types';

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  instructors: Instructor[];
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const EventForm = ({
  initialData,
  instructors,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}: EventFormProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'live-session',
    date: initialData?.date || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    language: initialData?.language || '',
    targetLevel: initialData?.targetLevel || 'beginner',
    instructorId: initialData?.instructorId || '',
    capacity: initialData?.capacity || 20,
    isRecurring: initialData?.isRecurring || false,
    recurringPattern: initialData?.recurringPattern,
    location: initialData?.location || '',
    meetingLink: initialData?.meetingLink || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  const eventTypeOptions = [
    { value: 'live-session', label: 'Live Session' },
    { value: 'tutoring', label: '1-to-1 Tutoring' },
    { value: 'cultural', label: 'Cultural Event' },
    { value: 'competition', label: 'Competition' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'group-class', label: 'Group Class' }
  ];

  const languageOptions = [
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
    { value: 'beginner', label: 'Beginner (Letters)' },
    { value: 'basic', label: 'Basic (Words)' },
    { value: 'advanced', label: 'Advanced (Sentences)' },
    { value: 'pro', label: 'Pro (Paragraphs)' },
    { value: 'elite', label: 'Elite (Advanced)' }
  ];

  const instructorOptions = instructors.map(instructor => ({
    value: instructor.id,
    label: instructor.name,
    description: `${instructor.languages.join(', ')} • ${instructor.rating}★`
  }));

  const recurringOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Event description is required';
    if (!formData.date) newErrors.date = 'Event date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.language) newErrors.language = 'Language is required';
    if (!formData.instructorId) newErrors.instructorId = 'Instructor is required';
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Event Details
        </h3>

        <Input
          label="Event Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          placeholder="Enter event title"
          required
        />

        <div className="space-y-2">
          <label className="block font-body font-medium text-sm text-foreground">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the event purpose and content"
            rows={3}
            className={`
              w-full px-3 py-2 border rounded-lg font-body text-sm
              ${errors.description 
                ? 'border-error focus:border-error focus:ring-error/20' :'border-border focus:border-primary focus:ring-primary/20'
              }
              focus:outline-none focus:ring-2 transition-colors duration-200
            `}
          />
          {errors.description && (
            <p className="font-body text-xs text-error">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Event Type"
            options={eventTypeOptions}
            value={formData.type}
            onChange={(value) => handleInputChange('type', value)}
            required
          />

          <Select
            label="Language"
            options={languageOptions}
            value={formData.language}
            onChange={(value) => handleInputChange('language', value)}
            error={errors.language}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Target Level"
            options={levelOptions}
            value={formData.targetLevel}
            onChange={(value) => handleInputChange('targetLevel', value)}
            required
          />

          <Select
            label="Instructor"
            options={instructorOptions}
            value={formData.instructorId}
            onChange={(value) => handleInputChange('instructorId', value)}
            error={errors.instructorId}
            searchable
            required
          />
        </div>
      </div>

      {/* Schedule Information */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
            required
          />

          <Input
            label="Start Time"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            error={errors.startTime}
            required
          />

          <Input
            label="End Time"
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            error={errors.endTime}
            required
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20"
            />
            <span className="font-body text-sm text-foreground">Recurring Event</span>
          </label>

          {formData.isRecurring && (
            <Select
              options={recurringOptions}
              value={formData.recurringPattern || ''}
              onChange={(value) => handleInputChange('recurringPattern', value)}
              placeholder="Select pattern"
              className="w-40"
            />
          )}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Additional Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
            error={errors.capacity}
            min="1"
            max="1000"
            required
          />

          <Input
            label="Location (Optional)"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Physical location or 'Online'"
          />
        </div>

        <Input
          label="Meeting Link (Optional)"
          type="url"
          value={formData.meetingLink}
          onChange={(e) => handleInputChange('meetingLink', e.target.value)}
          placeholder="https://meet.example.com/room-id"
          description="For online events, provide the meeting room link"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          iconName="Calendar"
          iconPosition="left"
        >
          {initialData ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;