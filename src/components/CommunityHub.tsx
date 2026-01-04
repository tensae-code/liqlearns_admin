import React, { useEffect, useState } from 'react';
import { Users, Trophy, Plus, UserPlus } from 'lucide-react';
import { fetchStudyGroups, createStudyGroup, joinStudyGroup, findMentors, requestMentorship, fetchUserChallenges,  } from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

const CommunityHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'groups' | 'mentors' | 'challenges'>('groups');
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    try {
      if (activeTab === 'groups') {
        const groups = await fetchStudyGroups();
        setStudyGroups(groups);
      } else if (activeTab === 'mentors') {
        const mentorList = await findMentors();
        setMentors(mentorList);
      } else if (activeTab === 'challenges' && user) {
        const userChallenges = await fetchUserChallenges(user.id);
        setChallenges(userChallenges);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    try {
      await createStudyGroup({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        creatorId: user.id,
        maxMembers: parseInt(formData.get('maxMembers') as string) || 10,
        isPrivate: formData.get('isPrivate') === 'on',
      });
      alert('Study group created successfully!');
      setShowCreateGroup(false);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to create study group');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    try {
      await joinStudyGroup(groupId, user.id);
      alert('Successfully joined study group!');
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to join study group');
    }
  };

  const handleRequestMentorship = async (mentorId: string) => {
    if (!user) return;
    try {
      await requestMentorship(mentorId, user.id, []);
      alert('Mentorship request sent!');
    } catch (error: any) {
      alert(error.message || 'Failed to send mentorship request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'groups' ?'border-b-2 border-purple-600 text-purple-600' :'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Study Groups
        </button>
        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'mentors' ?'border-b-2 border-purple-600 text-purple-600' :'text-gray-600 hover:text-gray-900'
          }`}
        >
          <UserPlus className="w-5 h-5 inline mr-2" />
          Find Mentors
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'challenges' ?'border-b-2 border-purple-600 text-purple-600' :'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Trophy className="w-5 h-5 inline mr-2" />
          Peer Challenges
        </button>
      </div>

      {/* Study Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Study Groups</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>

          {showCreateGroup && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg mb-4">Create New Study Group</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <input
                  name="name"
                  placeholder="Group Name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  name="maxMembers"
                  type="number"
                  placeholder="Max Members (default: 10)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isPrivate" />
                  <span>Private Group</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyGroups.map((group) => (
              <div key={group.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">{group.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {group.study_group_members?.[0]?.count || 0} / {group.max_members} members
                  </span>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Tab */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Find a Mentor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((mentor) => (
              <div key={mentor.user_id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {mentor.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{mentor.username}</h3>
                    <p className="text-sm text-gray-600 mb-2">{mentor.bio || 'Experienced educator'}</p>
                    <button
                      onClick={() => handleRequestMentorship(mentor.user_id)}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      Request Mentorship
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Peer Challenges</h2>
          {challenges.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No active challenges</p>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {challenge.challenger?.user_profiles?.username} vs{' '}
                        {challenge.challenged?.user_profiles?.username}
                      </h4>
                      <p className="text-sm text-gray-600">{challenge.challenge_type}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        challenge.status === 'pending' ?'bg-yellow-100 text-yellow-700'
                          : challenge.status === 'completed' ?'bg-green-100 text-green-700' :'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {challenge.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityHub;