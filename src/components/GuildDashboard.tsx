import React, { useEffect, useState } from 'react';
import { Shield, Users, Trophy, Target, Crown, TrendingUp } from 'lucide-react';
import { 
  getUserGuild, 
  getGuildMembers, 
  getGuildChallenges, 
  getTopGuilds,
  createGuild,
  LearningGuild,
  GuildMember,
  GuildChallenge 
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

const GuildDashboard: React.FC = () => {
  const { user } = useAuth();
  const [guild, setGuild] = useState<LearningGuild | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [challenges, setChallenges] = useState<GuildChallenge[]>([]);
  const [topGuilds, setTopGuilds] = useState<LearningGuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGuildData();
  }, [user?.id]);

  const loadGuildData = async () => {
    if (!user?.id) return;

    try {
      const [userGuildData, topGuildsData] = await Promise.all([
        getUserGuild(user.id),
        getTopGuilds(10)
      ]);

      setGuild(userGuildData);
      setTopGuilds(topGuildsData);

      if (userGuildData) {
        const [membersData, challengesData] = await Promise.all([
          getGuildMembers(userGuildData.id),
          getGuildChallenges(userGuildData.id)
        ]);
        setMembers(membersData);
        setChallenges(challengesData);
      }
    } catch (error) {
      console.error('Error loading guild data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!user?.id || !guildName.trim()) return;

    setCreating(true);
    try {
      await createGuild(user.id, guildName.trim());
      await loadGuildData();
      setShowCreateGuild(false);
      setGuildName('');
    } catch (error) {
      console.error('Error creating guild:', error);
      alert('Failed to create guild. You may already be in a guild or the name is taken.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Guild Header */}
      {guild ? (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <Shield className="w-12 h-12 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{guild.guild_name}</h2>
                <p className="text-white/80 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Led by {guild.leader_username || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-yellow-300">Lv. {guild.guild_level}</div>
              <p className="text-sm text-white/80">Guild Level</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
              <Users className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl font-bold">{guild.total_members}</p>
              <p className="text-xs text-white/80">Members</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl font-bold">{guild.total_xp.toLocaleString()}</p>
              <p className="text-xs text-white/80">Total XP</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
              <Target className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl font-bold">{challenges.filter(c => c.completed).length}</p>
              <p className="text-xs text-white/80">Challenges Done</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-8 text-white shadow-lg text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-bold mb-2">No Guild Yet</h3>
          <p className="text-gray-300 mb-6">Create your own learning guild and invite your referral network!</p>
          <button
            onClick={() => setShowCreateGuild(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            Create Your Guild
          </button>
        </div>
      )}

      {/* Guild Members */}
      {guild && members.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Guild Members
          </h3>
          <div className="space-y-3">
            {members.slice(0, 5).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.username || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Level {member.level || 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{member.contribution_xp.toLocaleString()} XP</p>
                  <p className="text-xs text-gray-600">Contributed</p>
                </div>
              </div>
            ))}
          </div>
          {members.length > 5 && (
            <p className="text-center text-gray-600 mt-4">+ {members.length - 5} more members</p>
          )}
        </div>
      )}

      {/* Guild Challenges */}
      {guild && challenges.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Active Challenges
          </h3>
          <div className="space-y-4">
            {challenges.filter(c => !c.completed).map((challenge) => (
              <div key={challenge.id} className="border-2 border-indigo-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{challenge.challenge_name}</h4>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Reward</p>
                    <p className="font-bold text-indigo-600">{challenge.reward_xp} XP</p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-indigo-600">
                      {challenge.current_xp.toLocaleString()} / {challenge.target_xp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((challenge.current_xp / challenge.target_xp) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Ends: {new Date(challenge.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Guilds Leaderboard */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Top Guilds
        </h3>
        <div className="space-y-2">
          {topGuilds.map((topGuild, index) => (
            <div 
              key={topGuild.id} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                topGuild.id === guild?.id ? 'bg-indigo-50 border-2 border-indigo-500' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-900': 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{topGuild.guild_name}</p>
                  <p className="text-sm text-gray-600">{topGuild.total_members} members</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600">{topGuild.total_xp.toLocaleString()} XP</p>
                <p className="text-xs text-gray-600">Level {topGuild.guild_level}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Guild Modal */}
      {showCreateGuild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Guild</h2>
            <p className="text-gray-600 mb-6">
              Your guild will automatically include your referral network. Choose a name that represents your team!
            </p>
            <input
              type="text"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              placeholder="Enter guild name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none mb-6"
              maxLength={50}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateGuild(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGuild}
                disabled={creating || !guildName.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-bold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Guild'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildDashboard;