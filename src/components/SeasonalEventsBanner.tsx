import React, { useEffect, useState } from 'react';
import { Calendar, Trophy, Gift, Star, X } from 'lucide-react';
import { 
  getActiveEvents, 
  getUserEventProgress, 
  joinEvent, 
  claimEventReward,
  SeasonalEvent,
  EventParticipation 
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

const SeasonalEventsBanner: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [userProgress, setUserProgress] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, [user?.id]);

  const loadEvents = async () => {
    if (!user?.id) return;

    try {
      const [eventsData, progressData] = await Promise.all([
        getActiveEvents(),
        getUserEventProgress(user.id)
      ]);

      setEvents(eventsData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user?.id) return;

    try {
      await joinEvent(user.id, eventId);
      await loadEvents();
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleClaimReward = async (eventId: string) => {
    if (!user?.id) return;

    try {
      await claimEventReward(user.id, eventId);
      await loadEvents();
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getEventProgress = (eventId: string): EventParticipation | undefined => {
    return userProgress.find(p => p.event_id === eventId);
  };

  const isEventJoined = (eventId: string): boolean => {
    return userProgress.some(p => p.event_id === eventId);
  };

  if (loading || events.length === 0) return null;

  return (
    <>
      {/* Events Banner */}
      <div className="mb-6 space-y-4">
        {events.map((event) => {
          const progress = getEventProgress(event.id);
          const joined = isEventJoined(event.id);

          return (
            <div
              key={event.id}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 animate-pulse"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Star className="w-8 h-8 text-yellow-300 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{event.event_name}</h3>
                      <p className="text-sm text-white/80 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {joined && (
                    <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
                      {progress?.completed ? '✅ Completed' : `${progress?.progress || 0}% Complete`}
                    </div>
                  )}
                </div>

                <p className="text-white/90 mb-4">{event.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-300" />
                      <span className="font-bold">{event.reward_xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-yellow-300" />
                      <span className="font-bold">{event.reward_gold} Gold</span>
                    </div>
                  </div>
                  {!joined ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinEvent(event.id);
                      }}
                      className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors"
                    >
                      Join Event
                    </button>
                  ) : progress?.completed && !progress?.reward_claimed ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaimReward(event.id);
                      }}
                      className="bg-yellow-400 text-purple-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors animate-pulse"
                    >
                      Claim Reward! 🎁
                    </button>
                  ) : null}
                </div>

                {joined && !progress?.completed && (
                  <div className="mt-4">
                    <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full">
                <Star className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedEvent.event_name}</h2>
                <p className="text-gray-600">{selectedEvent.event_type.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Event Description</h3>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Requirements</h3>
                <p className="text-gray-700">{selectedEvent.participation_requirement}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <span className="font-bold text-gray-900">XP Reward</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{selectedEvent.reward_xp}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-6 h-6 text-yellow-600" />
                    <span className="font-bold text-gray-900">Gold Reward</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{selectedEvent.reward_gold}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Event Period:</span>
                </div>
                <p className="text-gray-600 mt-1">
                  {new Date(selectedEvent.start_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })} - {new Date(selectedEvent.end_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeasonalEventsBanner;