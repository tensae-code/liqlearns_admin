import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TimeSlot {
  id: string;
  tutor_id: string;
  day_of_week?: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  max_students: number;
  current_bookings: number;
  status: string;
  tutor_name?: string;
}

interface AvailabilitySchedulerProps {
  courseId?: string;
}

const AvailabilityScheduler: React.FC<AvailabilitySchedulerProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDay]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      // Fetch available tutor slots
      const { data, error } = await supabase
        .from('tutor_availability')
        .select(`
          *,
          user_profiles!tutor_availability_tutor_id_fkey (
            full_name
          )
        `)
        .eq('status', 'available')
        .or(`day_of_week.eq.${selectedDay},is_recurring.eq.false`)
        .order('start_time', { ascending: true });

      if (error) throw error;

      const slotsWithTutorName = (data || []).map(slot => ({
        ...slot,
        tutor_name: slot.user_profiles?.full_name || 'Unknown Tutor'
      }));

      setAvailableSlots(slotsWithTutorName);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !user?.id) return;

    try {
      // Here you would implement booking logic
      // For now, just show success message
      alert('Slot booked successfully! The tutor will be notified.');
      setSelectedSlot(null);
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error booking slot:', error);
      alert('Failed to book slot. Please try again.');
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Select a Day</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                selectedDay === day.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day.label.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Available Slots */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-2" />
          Available Time Slots
        </h3>
        
        {availableSlots.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-600">No available slots for this day</p>
            <p className="text-sm text-gray-500 mt-2">Try selecting a different day</p>
          </div>
        ) : (
          availableSlots.map(slot => {
            const isSelected = selectedSlot === slot.id;
            const isFull = slot.current_bookings >= slot.max_students;
            
            return (
              <div
                key={slot.id}
                onClick={() => !isFull && handleSlotSelection(slot.id)}
                className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 shadow-lg'
                    : isFull
                    ? 'border-gray-200 opacity-50 cursor-not-allowed' :'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {slot.tutor_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {slot.current_bookings}/{slot.max_students} students
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && !isFull && (
                    <Check className="w-6 h-6 text-blue-600" />
                  )}
                  {isFull && (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Button */}
      {selectedSlot && (
        <button
          onClick={handleBookSlot}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Book Selected Time Slot
        </button>
      )}
    </div>
  );
};

export default AvailabilityScheduler;