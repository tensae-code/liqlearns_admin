import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, MessageSquare, Users, Heart, Gift, Pin, Camera, LogOut, Award, User, Monitor, X, Plus } from 'lucide-react';
import { studyRoomService, StudyRoom, StudyRoomParticipant, ChatMessage } from '../services/studyRoomService';
import { useAuth } from '../contexts/AuthContext';
import Peer from 'simple-peer';


interface StudyRoomHubProps {
  userId?: string;
}

const StudyRoomHub: React.FC<StudyRoomHubProps> = ({ userId }) => {
  // State management
  const [availableRooms, setAvailableRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [participants, setParticipants] = useState<StudyRoomParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'public' | 'private' | 'active' | 'scheduled'>('all');

  // Media state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [pinnedParticipants, setPinnedParticipants] = useState<Set<string>>(new Set());
  const [messageInput, setMessageInput] = useState('');

  // WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, { peer: Peer.Instance, stream?: MediaStream }>>(new Map());
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  // Handle real-time interactions
  const handleInteraction = (interaction: any) => {
    // Update participant stats based on interaction type
    setParticipants(prev => prev.map(p => {
      if (p.student_id === interaction.to_student_id) {
        const updates: Partial<StudyRoomParticipant> = {};
        if (interaction.interaction_type === 'like') {
          updates.likes_received = (p.likes_received || 0) + 1;
        } else if (interaction.interaction_type === 'gift') {
          updates.gifts_received = (p.gifts_received || 0) + 1;
        }
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  // Load available rooms - FIXED: Pass userId
  const loadAvailableRooms = async () => {
    try {
      setLoading(true);
      const rooms = await studyRoomService.getAvailableRooms(user?.id);
      setAvailableRooms(rooms);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load study rooms');
    } finally {
      setLoading(false);
    }
  };

  // Join room
  const handleJoinRoom = async (room: StudyRoom) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Join the room in database
      await studyRoomService.joinRoom(room.id, {
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        avatar_url: user.user_metadata?.avatar_url,
        current_course: 'Mathematics Advanced' // Get from user profile
      });

      setCurrentRoom(room);
      
      // Load initial data
      const [roomParticipants, chatHistory] = await Promise.all([
        studyRoomService.getRoomParticipants(room.id),
        studyRoomService.getChatMessages(room.id)
      ]);
      
      setParticipants(roomParticipants);
      setChatMessages(chatHistory);

      // Subscribe to real-time updates
      const unsubscribe = studyRoomService.subscribeToRoom(room.id, {
        onParticipantChange: setParticipants,
        onMessage: (message) => setChatMessages(prev => [...prev, message]),
        onInteraction: handleInteraction
      });

      // Clean up subscription on unmount or room change
      return () => unsubscribe();

    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  // Leave room
  const handleLeaveRoom = async () => {
    if (!currentRoom) return;

    try {
      await studyRoomService.leaveRoom(currentRoom.id);
      
      // Stop local media
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Clean up peers
      peers.forEach(({ peer }) => peer.destroy());
      setPeers(new Map());

      // Reset state
      setCurrentRoom(null);
      setParticipants([]);
      setChatMessages([]);
      setCameraEnabled(false);
      setMicEnabled(false);
      setPinnedParticipants(new Set());

    } catch (err) {
      console.error('Error leaving room:', err);
      setError('Failed to leave room');
    }
  };

  // Toggle camera
  const handleCameraToggle = async () => {
    try {
      if (!cameraEnabled) {
        // Enable camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: micEnabled 
        });
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        // Disable camera
        if (localStream) {
          localStream.getVideoTracks().forEach(track => track.stop());
        }
      }

      const newCameraState = !cameraEnabled;
      setCameraEnabled(newCameraState);

      // Update in database
      if (currentRoom) {
        await studyRoomService.updateMediaStatus(currentRoom.id, newCameraState, micEnabled);
      }
    } catch (err) {
      console.error('Error toggling camera:', err);
      setError('Failed to access camera');
    }
  };

  // Toggle microphone
  const handleMicToggle = async () => {
    try {
      const newMicState = !micEnabled;
      setMicEnabled(newMicState);

      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = newMicState;
        });
      }

      // Update in database
      if (currentRoom) {
        await studyRoomService.updateMediaStatus(currentRoom.id, cameraEnabled, newMicState);
      }
    } catch (err) {
      console.error('Error toggling microphone:', err);
      setError('Failed to access microphone');
    }
  };

  // Send chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentRoom) return;

    try {
      await studyRoomService.sendMessage(currentRoom.id, messageInput.trim());
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle interactions (likes, gifts, pins)
  const handleSendLike = async (participantId: string) => {
    if (!currentRoom) return;
    try {
      await studyRoomService.sendInteraction(currentRoom.id, participantId, 'like');
    } catch (err) {
      console.error('Error sending like:', err);
    }
  };

  const handleSendGift = async (participantId: string, giftType: 'coffee' | 'book' | 'trophy' | 'star' | 'heart') => {
    if (!currentRoom) return;
    try {
      await studyRoomService.sendInteraction(currentRoom.id, participantId, 'gift', giftType);
    } catch (err) {
      console.error('Error sending gift:', err);
    }
  };

  const handlePin = async (participantId: string) => {
    if (!currentRoom) return;
    const isCurrentlyPinned = pinnedParticipants.has(participantId);
    
    try {
      await studyRoomService.sendInteraction(
        currentRoom.id, 
        participantId, 
        isCurrentlyPinned ? 'unpin' : 'pin'
      );
      
      setPinnedParticipants(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyPinned) {
          newSet.delete(participantId);
        } else {
          newSet.add(participantId);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Error pinning participant:', err);
    }
  };

  // Initialize component
  useEffect(() => {
    loadAvailableRooms();
  }, [user?.id]);

  // Filter rooms based on active filter
  const filteredRooms = availableRooms.filter(room => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'public') return room.roomType === 'public';
    if (activeFilter === 'private') return room.roomType === 'private';
    if (activeFilter === 'active') return room.status === 'active';
    if (activeFilter === 'scheduled') return room.status === 'scheduled';
    return true;
  });

  // Loading state
  if (loading && !currentRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading study rooms...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => {
                setError(null);
                loadAvailableRooms();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room selection view - ENHANCED with Create Room button
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Study Rooms</h1>
                <p className="text-sm text-gray-600">Collaborate with peers in real-time</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Room
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'public', 'private', 'active', 'scheduled'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center text-gray-400 bg-gray-800 rounded-2xl p-12">
            <Users className="h-24 w-24 mx-auto mb-4 text-gray-600" />
            <p className="text-xl text-white mb-2">No study rooms available</p>
            <p>Create a room to start studying with others!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleJoinRoom(room)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {room.description}
                    </p>
                  </div>
                  {room.isActive && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    {room.currentParticipants}/{room.maxParticipants}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.roomType === 'public' ?'bg-blue-100 text-blue-700' :'bg-purple-100 text-purple-700'
                  }`}>
                    {room.roomType}
                  </span>
                </div>

                <button
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 group-hover:shadow-md transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  Join Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Active study room view - ENHANCED with collaborative features
  if (currentRoom) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header with room info */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{currentRoom.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {participants.length} participants
                </span>
                <span className="flex items-center gap-1">
                  <Monitor className="h-4 w-4" />
                  {participants.filter(p => p.cameraEnabled).length} cameras on
                </span>
              </div>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Leave Room
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Main video grid area */}
          <div className="flex-1 relative p-4 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Local video - Current user */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                {cameraEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-sm text-gray-300">Camera Off</p>
                    </div>
                  </div>
                )}
                
                {/* User overlay info */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">You</span>
                    {!micEnabled && <MicOff className="h-3 w-3 text-red-400" />}
                  </div>
                </div>

                {/* Indicator that you're live */}
                <div className="absolute top-2 right-2 bg-blue-500 px-2 py-1 rounded text-xs font-bold">
                  ME
                </div>
              </div>

              {/* Remote participants */}
              {participants
                .filter((p) => p.studentId !== user?.id)
                .sort((a, b) => {
                  // Sort pinned participants first
                  const aPinned = pinnedParticipants.has(a.studentId);
                  const bPinned = pinnedParticipants.has(b.studentId);
                  if (aPinned && !bPinned) return -1;
                  if (!aPinned && bPinned) return 1;
                  return 0;
                })
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video group"
                  >
                    {participant.cameraEnabled ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-500" />
                        <p className="text-xs text-gray-500 ml-2">Camera Active</p>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xl font-bold text-white">
                              {participant.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Camera Off</p>
                        </div>
                      </div>
                    )}

                    {/* Participant info overlay */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{participant.displayName}</span>
                        {!participant.microphoneEnabled && <MicOff className="h-3 w-3 text-red-400" />}
                      </div>
                      {participant.currentCourse && (
                        <div className="text-xs text-gray-300 mt-1">
                          {participant.currentCourse}
                        </div>
                      )}
                    </div>

                    {/* Badge indicator */}
                    {participant.badgeUrl && (
                      <div className="absolute top-2 right-2">
                        <Award className="h-5 w-5 text-yellow-400" />
                      </div>
                    )}

                    {/* Pin indicator */}
                    {pinnedParticipants.has(participant.studentId) && (
                      <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1">
                        <Pin className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* Stats badges */}
                    <div className="absolute bottom-2 right-2 flex gap-1 text-xs">
                      {participant.likesReceived > 0 && (
                        <span className="bg-red-500 bg-opacity-90 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ❤️ {participant.likesReceived}
                        </span>
                      )}
                      {participant.giftsReceived > 0 && (
                        <span className="bg-purple-500 bg-opacity-90 px-2 py-0.5 rounded-full flex items-center gap-1">
                          🎁 {participant.giftsReceived}
                        </span>
                      )}
                    </div>

                    {/* Interaction buttons (show on hover) */}
                    <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleSendLike(participant.studentId)}
                        className="bg-red-500 hover:bg-red-600 p-3 rounded-full transition-colors shadow-lg"
                        title="Send Like"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleSendGift(participant.studentId, 'coffee')}
                        className="bg-purple-500 hover:bg-purple-600 p-3 rounded-full transition-colors shadow-lg"
                        title="Send Gift"
                      >
                        <Gift className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePin(participant.studentId)}
                        className={`p-3 rounded-full transition-colors shadow-lg ${
                          pinnedParticipants.has(participant.studentId)
                            ? 'bg-blue-600 hover:bg-blue-700' :'bg-gray-500 hover:bg-gray-600'
                        }`}
                        title={pinnedParticipants.has(participant.studentId) ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Chat sidebar */}
          {showChat && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`${
                      message.isAnnouncement
                        ? 'bg-blue-500 bg-opacity-20 p-3 rounded-lg border border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {message.studentId === user?.id ? 'You' : 'Participant'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200">{message.message}</p>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Control bar - ENHANCED with whiteboard and screen share */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleCameraToggle}
              className={`p-3 rounded-full transition-colors ${
                cameraEnabled
                  ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
              }`}
              title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            <button
              onClick={handleMicToggle}
              className={`p-3 rounded-full transition-colors ${
                micEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
              }`}
              title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-full transition-colors ${
                showChat
                  ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title="Toggle chat"
            >
              <MessageSquare className="h-5 w-5" />
            </button>

            <button
              onClick={() => alert('Whiteboard feature coming soon!')}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
              title="Open whiteboard"
            >
              <Monitor className="h-5 w-5" />
            </button>

            <button
              onClick={() => alert('Screen sharing feature coming soon!')}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
              title="Share screen"
            >
              <Monitor className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default StudyRoomHub;