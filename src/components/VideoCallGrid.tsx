import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { Video, VideoOff, Mic, MicOff, Monitor, X, Maximize2 } from 'lucide-react';
import { StudyRoomParticipant } from '../services/studyRoomService';

interface VideoCallGridProps {
  participants: StudyRoomParticipant[];
  currentUserId: string;
  onMediaToggle: (cameraEnabled: boolean, micEnabled: boolean) => void;
}

interface PeerConnection {
  participantId: string;
  peer: SimplePeer.Instance;
  stream: MediaStream | null;
}

export const VideoCallGrid: React.FC<VideoCallGridProps> = ({
  participants,
  currentUserId,
  onMediaToggle,
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize local media stream
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setCameraEnabled(true);
      setMicEnabled(true);
      onMediaToggle(true, true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
        onMediaToggle(videoTrack.enabled, micEnabled);
      }
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
        onMediaToggle(cameraEnabled, audioTrack.enabled);
      }
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      screenStreamRef.current = screenStream;
      setScreenSharing(true);

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      peers.forEach(({ peer }) => {
        const sender = peer._pc
          ?.getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Stop screen sharing when user stops it
      videoTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setScreenSharing(false);

    // Restore camera stream
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      peers.forEach(({ peer }) => {
        const sender = peer._pc
          ?.getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peers.forEach(({ peer }) => peer.destroy());
    };
  }, [localStream, peers]);

  // Get current user participant
  const currentParticipant = participants.find(p => p.studentId === currentUserId);

  // Get grid layout classes based on participant count
  const getGridCols = () => {
    const totalParticipants = participants.length;
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      {/* Video Grid */}
      <div className={`grid ${expandedVideo ? 'grid-cols-1' : getGridCols()} gap-4 mb-4`}>
        {/* Local Video (Current User) */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-white">
                    {currentParticipant?.displayName?.[0]?.toUpperCase() || 'Y'}
                  </span>
                </div>
                <p className="text-white text-sm">Camera Off</p>
              </div>
            </div>
          )}
          
          {/* Participant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">
                  {currentParticipant?.displayName} (You)
                </span>
                {currentParticipant?.currentCourse && (
                  <span className="text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                    {currentParticipant.currentCourse}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!micEnabled && (
                  <div className="bg-red-500 p-1 rounded">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
                {screenSharing && (
                  <div className="bg-blue-500 p-1 rounded">
                    <Monitor className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expand Button */}
          {!expandedVideo && (
            <button
              onClick={() => setExpandedVideo('local')}
              className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-700 p-2 rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Remote Participants (Placeholder for peer connections) */}
        {participants
          .filter(p => p.studentId !== currentUserId)
          .map(participant => (
            <div
              key={participant.id}
              className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
            >
              {participant.cameraEnabled ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p className="text-sm">Video stream would appear here</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="text-center">
                    {participant.avatarUrl ? (
                      <img
                        src={participant.avatarUrl}
                        alt={participant.displayName}
                        className="w-16 h-16 rounded-full mx-auto mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-white">
                          {participant.displayName[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-white text-sm">Camera Off</p>
                  </div>
                </div>
              )}

              {/* Participant Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                      {participant.displayName}
                    </span>
                    {participant.currentCourse && (
                      <span className="text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                        {participant.currentCourse}
                      </span>
                    )}
                  </div>
                  {!participant.microphoneEnabled && (
                    <div className="bg-red-500 p-1 rounded">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Expand Button */}
              {!expandedVideo && (
                <button
                  onClick={() => setExpandedVideo(participant.id)}
                  className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-700 p-2 rounded transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          ))}
      </div>

      {/* Close Expanded View */}
      {expandedVideo && (
        <button
          onClick={() => setExpandedVideo(null)}
          className="absolute top-4 right-4 bg-gray-800/90 hover:bg-gray-700 p-2 rounded-full z-10 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Control Bar */}
      <div className="flex items-center justify-center gap-4">
        {/* Camera Toggle */}
        <button
          onClick={cameraEnabled ? toggleCamera : initializeMedia}
          className={`p-4 rounded-full transition-all ${
            cameraEnabled
              ? 'bg-gray-700 hover:bg-gray-600' :'bg-red-500 hover:bg-red-600'
          }`}
          title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraEnabled ? (
            <Video className="w-5 h-5 text-white" />
          ) : (
            <VideoOff className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Microphone Toggle */}
        <button
          onClick={toggleMicrophone}
          className={`p-4 rounded-full transition-all ${
            micEnabled
              ? 'bg-gray-700 hover:bg-gray-600' :'bg-red-500 hover:bg-red-600'
          }`}
          title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
          disabled={!localStream}
        >
          {micEnabled ? (
            <Mic className="w-5 h-5 text-white" />
          ) : (
            <MicOff className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={screenSharing ? stopScreenShare : startScreenShare}
          className={`p-4 rounded-full transition-all ${
            screenSharing
              ? 'bg-blue-500 hover:bg-blue-600' :'bg-gray-700 hover:bg-gray-600'
          }`}
          title={screenSharing ? 'Stop sharing' : 'Share screen'}
          disabled={!localStream}
        >
          <Monitor className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Info Message */}
      {!localStream && (
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Click the camera button to start your video
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoCallGrid;