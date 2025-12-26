import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface AvailabilityStepProps {
  formData: {
    availability?: {
      [key: string]: {
        available: boolean;
        startTime?: string;
        endTime?: string;
      };
    };
  };
  onChange: (field: string, value: any) => void;
}

const AvailabilityStep: React.FC<AvailabilityStepProps> = ({ formData, onChange }) => {
  // FIXED: Full day names for better readability
  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const availability = formData.availability || {};

  const handleDayToggle = (day: string) => {
    const newAvailability = {
      ...availability,
      [day]: {
        available: !availability[day]?.available,
        startTime: availability[day]?.startTime || '09:00',
        endTime: availability[day]?.endTime || '17:00'
      }
    };
    onChange('availability', newAvailability);
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    const newAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value
      }
    };
    onChange('availability', newAvailability);
  };

  return (
    <div className="space-y-6">
      {/* FIXED: Clear section header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-orange-600" />
          <h3 className="text-2xl font-bold text-gray-900">Weekly Availability</h3>
        </div>
        <p className="text-gray-600">Select your available days and time slots</p>
      </div>

      {/* FIXED: Better calendar layout with full day names */}
      <div className="space-y-3">
        {daysOfWeek.map((day) => {
          const isAvailable = availability[day.key]?.available;
          
          return (
            <div
              key={day.key}
              className={`border-2 rounded-2xl p-4 transition-all duration-300 ${
                isAvailable
                  ? 'border-orange-500 bg-orange-50' :'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Day Toggle */}
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    id={`day-${day.key}`}
                    checked={isAvailable || false}
                    onChange={() => handleDayToggle(day.key)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor={`day-${day.key}`}
                    className={`font-medium cursor-pointer select-none ${
                      isAvailable ? 'text-orange-900' : 'text-gray-700'
                    }`}
                  >
                    {day.label}
                  </label>
                </div>

                {/* Time Selection */}
                {isAvailable && (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <input
                        type="time"
                        value={availability[day.key]?.startTime || '09:00'}
                        onChange={(e) => handleTimeChange(day.key, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <input
                        type="time"
                        value={availability[day.key]?.endTime || '17:00'}
                        onChange={(e) => handleTimeChange(day.key, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Selection Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            const weekdayAvailability: any = {};
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
              weekdayAvailability[day] = {
                available: true,
                startTime: '09:00',
                endTime: '17:00'
              };
            });
            onChange('availability', weekdayAvailability);
          }}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-colors"
        >
          Weekdays Only
        </button>
        <button
          type="button"
          onClick={() => {
            const allDayAvailability: any = {};
            daysOfWeek.forEach(day => {
              allDayAvailability[day.key] = {
                available: true,
                startTime: '09:00',
                endTime: '17:00'
              };
            });
            onChange('availability', allDayAvailability);
          }}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-colors"
        >
          All Days
        </button>
        <button
          type="button"
          onClick={() => onChange('availability', {})}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default AvailabilityStep;