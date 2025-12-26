import React, { useEffect, useState } from 'react';
import { Calendar, Video, Users, MessageSquare, Presentation, Share2, Brain } from 'lucide-react';
import { phase7Service, VirtualClassroom, AIRecommendation } from '../../../services/phase7Service';
import { useAuth } from '../../../contexts/AuthContext';

interface VirtualClassroomHubProps {
  courseId?: string;
}

export const VirtualClassroomHub: React.FC<VirtualClassroomHubProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<VirtualClassroom[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past' | 'ai'>('upcoming');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Load classrooms
        const classroomData = await phase7Service.getVirtualClassrooms(courseId);
        if (isMounted) setClassrooms(classroomData);

        // Load AI recommendations if student
        if (user.id) {
          const aiRecs = await phase7Service.getAIRecommendations(user.id);
          if (isMounted) setRecommendations(aiRecs);
        }
      } catch (error) {
        console.error('Error loading classroom data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, courseId]);

  const filterClassrooms = (status: VirtualClassroom['status'][]) => {
    return classrooms.filter(c => status.includes(c.status));
  };

  const handleJoinClassroom = async (classroomId: string) => {
    if (!user?.id) return;
    
    try {
      await phase7Service.joinClassroom(classroomId, user.id);
      await phase7Service.updateClassroomStatus(classroomId, 'live');
      // Redirect to classroom or open in new window
      alert('Joining classroom...');
    } catch (error) {
      console.error('Error joining classroom:', error);
      alert('Failed to join classroom');
    }
  };

  const handleAcceptRecommendation = async (recommendationId: string) => {
    try {
      await phase7Service.acceptRecommendation(recommendationId);
      setRecommendations(prev => 
        prev.map(r => r.id === recommendationId ? { ...r, isAccepted: true } : r)
      );
    } catch (error) {
      console.error('Error accepting recommendation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Virtual Classrooms</h2>
          <p className="text-gray-600 mt-1">Join live sessions, collaborate, and learn together</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Video className="w-5 h-5" />
          Schedule Classroom
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: Calendar },
            { id: 'live', label: 'Live Now', icon: Video },
            { id: 'past', label: 'Past Sessions', icon: Users },
            { id: 'ai', label: 'AI Insights', icon: Brain },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filterClassrooms(['scheduled']).map(classroom => (
            <div key={classroom.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{classroom.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{classroom.description}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Scheduled
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(classroom.scheduledStart).toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Max {classroom.maxParticipants} participants
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {classroom.whiteboardEnabled && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
                    <Presentation className="w-3 h-3" />
                    Whiteboard
                  </span>
                )}
                {classroom.screenShareEnabled && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    Screen Share
                  </span>
                )}
                {classroom.chatEnabled && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Chat
                  </span>
                )}
              </div>

              <button
                onClick={() => handleJoinClassroom(classroom.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Classroom
              </button>
            </div>
          ))}

          {filterClassrooms(['scheduled']).length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500">
              No upcoming classrooms scheduled
            </div>
          )}
        </div>
      )}

      {activeTab === 'live' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filterClassrooms(['live']).map(classroom => (
            <div key={classroom.id} className="bg-white rounded-lg border-2 border-green-500 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{classroom.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{classroom.description}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full animate-pulse flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Live Now
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Active session
                </div>
              </div>

              <button
                onClick={() => handleJoinClassroom(classroom.id)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Join Live Session
              </button>
            </div>
          ))}

          {filterClassrooms(['live']).length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500">
              No live classrooms at the moment
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-4">
          {filterClassrooms(['ended']).map(classroom => (
            <div key={classroom.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{classroom.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{classroom.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(classroom.actualStart || classroom.scheduledStart).toLocaleDateString()}
                    </span>
                    {classroom.recordingUrl && (
                      <span className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        Watch Recording
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filterClassrooms(['ended']).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No past sessions available
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Learning Insights</h3>
                <p className="text-gray-600 mt-1">
                  Personalized recommendations based on your learning behavior and performance
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                    {rec.confidenceScore.toFixed(0)}% match
                  </span>
                </div>

                {rec.reason && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Why:</span> {rec.reason}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {!rec.isAccepted ? (
                    <>
                      <button
                        onClick={() => handleAcceptRecommendation(rec.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center">
                      ✓ Accepted
                    </div>
                  )}
                </div>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-500">
                No AI recommendations available yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualClassroomHub;