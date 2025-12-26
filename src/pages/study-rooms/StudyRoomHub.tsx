import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, MessageSquare, Users, Monitor, LogOut, Camera, User, Heart, Gift, Pin, Award } from 'lucide-react';

// Add missing interface
interface StudyRoomHubProps {
  userId: string;
}

// Add missing interfaces
interface Room {
  id: string;
  room_name: string;
  status: string;
  current_participants: number;
  max_participants: number;
  age_group?: string;
}

interface Participant {
  id: string;
  user_id: string;
  display_name?: string;
  camera_enabled: boolean;
  mic_enabled: boolean;
  current_course?: string;
  badge_count: number;
  likes_received: number;
  gifts_received: number;
}

interface Message {
  id: string;
  sender_id: string;
  message_text: string;
  is_announcement: boolean;
  created_at: string;
}

const StudyRoomHub: React.FC<StudyRoomHubProps> = ({ userId: propUserId }) => {
  // Add missing state declarations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [pinnedParticipants, setPinnedParticipants] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<{ id: string } | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Add missing functions
  const loadAvailableRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAvailableRooms([]);
    } catch (err) {
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const room = availableRooms.find(r => r.id === roomId);
      if (room) {
        setCurrentRoom(room);
      }
    } catch (err) {
      console.error('Failed to join room', err);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setParticipants([]);
  };

  const handleCameraToggle = () => {
    setCameraEnabled(!cameraEnabled);
  };

  const handleToggleMic = () => {
    setMicEnabled(!micEnabled);
  };

  const handleSendLike = (participantId: string) => {
    console.log('Sending like to', participantId);
  };

  const handleSendGift = (participantId: string, giftType: string) => {
    console.log('Sending gift to', participantId, giftType);
  };

  const handlePin = (participantId: string) => {
    setPinnedParticipants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        sender_id: user?.id || '',
        message_text: messageInput,
        is_announcement: false,
        created_at: new Date().toISOString()
      }]);
      setMessageInput('');
    }
  };

  useEffect(() => {
    loadAvailableRooms();
    setUser({ id: propUserId });
  }, [propUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="ml-4 text-gray-700">Loading study rooms...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAvailableRooms}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      ) : !currentRoom ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Study Rooms</h1>
                <p className="text-gray-600 mt-2">Join a collaborative study session</p>
              </div>
              <button
                onClick={async () => {
                  // ... keep existing create room logic ...
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <Users className="h-5 w-5" />
                Create Room
              </button>
            </div>
          </div>

          {availableRooms.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No active study rooms available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{room.room_name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        room.status === 'active' ?'bg-green-100 text-green-800'
                          : room.status === 'waiting' ?'bg-yellow-100 text-yellow-800' :'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {room.status === 'active' ? 'Live' : room.status === 'waiting' ? 'Waiting' : 'Ended'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4 text-gray-700">
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      {room.current_participants || 0}/{room.max_participants} participants
                    </p>
                    {room.age_group && (
                      <p className="text-sm text-gray-600">Age Group: {room.age_group}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={
                      room.current_participants >= room.max_participants ||
                      room.status === 'ended'
                    }
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      room.current_participants >= room.max_participants || room.status === 'ended' ?'bg-gray-300 text-gray-500 cursor-not-allowed' :'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {room.current_participants >= room.max_participants
                      ? 'Room Full'
                      : room.status === 'ended' ?'Ended' :'Join Room'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex flex-col bg-white">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentRoom.room_name}</h2>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {participants.length} participants
                  </span>
                  <span className="flex items-center gap-1">
                    <Monitor className="h-4 w-4" />
                    {participants.filter(p => p.camera_enabled).length} cameras
                  </span>
                </div>
              </div>
              <button
                onClick={handleLeaveRoom}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Leave Room
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div
              className={`grid gap-4 ${
                participants.length === 1
                  ? 'grid-cols-1'
                  : participants.length === 2
                  ? 'grid-cols-2'
                  : participants.length <= 4
                  ? 'grid-cols-2' :'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            >
              {/* Local Video */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-lg border-2 border-orange-500">
                {cameraEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                    <div className="text-center">
                      <User className="h-16 w-16 text-white mx-auto mb-2" />
                      <p className="text-white text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">You</span>
                      {!micEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                    </div>
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                      ME
                    </span>
                  </div>
                </div>
              </div>

              {/* Remote Participants */}
              {participants
                .filter((p) => p.user_id !== user?.id)
                .sort((a, b) => {
                  if (pinnedParticipants.has(a.id) && !pinnedParticipants.has(b.id)) return -1;
                  if (!pinnedParticipants.has(a.id) && pinnedParticipants.has(b.id)) return 1;
                  return 0;
                })
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-lg border border-gray-700 group"
                  >
                    {participant.camera_enabled ? (
                      <video
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl font-bold text-white">
                              {participant.display_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <p className="text-white text-sm">Camera Off</p>
                        </div>
                      </div>
                    )}

                    {/* Participant Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">
                          {participant.display_name || 'Participant'}
                        </span>
                        {!participant.mic_enabled && <MicOff className="h-4 w-4 text-red-500" />}
                        {participant.current_course && (
                          <span className="text-xs text-gray-300">
                            ({participant.current_course})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Top Badges */}
                    {participant.badge_count > 0 && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {participant.badge_count}
                      </div>
                    )}
                    {pinnedParticipants.has(participant.id) && (
                      <div className="absolute top-3 left-3 bg-blue-500 text-white p-1.5 rounded-full">
                        <Pin className="h-4 w-4" />
                      </div>
                    )}

                    {/* Stats Badges */}
                    <div className="absolute bottom-16 right-3 flex flex-col gap-1">
                      {participant.likes_received > 0 && (
                        <div className="bg-red-500/90 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          ❤️ {participant.likes_received}
                        </div>
                      )}
                      {participant.gifts_received > 0 && (
                        <div className="bg-purple-500/90 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          🎁 {participant.gifts_received}
                        </div>
                      )}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSendLike(participant.id)}
                        className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        title="Send Like"
                      >
                        <Heart className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleSendGift(participant.id, 'coffee')}
                        className="p-3 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                        title="Send Gift"
                      >
                        <Gift className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={() => handlePin(participant.id)}
                        className={`p-3 rounded-full transition-colors ${
                          pinnedParticipants.has(participant.id)
                            ? 'bg-blue-500 hover:bg-blue-600' :'bg-gray-600 hover:bg-gray-700'
                        }`}
                        title={pinnedParticipants.has(participant.id) ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Control Bar - Light Theme */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={handleCameraToggle}
                className={`p-4 rounded-full transition-all ${
                  cameraEnabled
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' :'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </button>
              <button
                onClick={handleToggleMic}
                className={`p-4 rounded-full transition-all ${
                  micEnabled
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' :'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all"
                title="Toggle chat"
              >
                <MessageSquare className="h-6 w-6" />
              </button>
              <button
                onClick={() => alert('Whiteboard feature coming soon!')}
                className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                title="Whiteboard (coming soon)"
              >
                <Monitor className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Chat Sidebar - Light Theme */}
          {showChat && (
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-2xl flex flex-col z-50">
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.is_announcement
                        ? 'bg-blue-50 border border-blue-200' :'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {message.sender_id === user?.id ? 'You' : 'Participant'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message_text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyRoomHub;