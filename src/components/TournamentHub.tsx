import React, { useEffect, useState } from 'react';
import { Trophy, Users, Calendar, Award, TrendingUp } from 'lucide-react';
import {
  fetchActiveTournaments,
  joinTournament,
  fetchTournamentLeaderboard,
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

interface Tournament {
  id: string;
  name: string;
  description: string;
  tournament_type: string;
  start_date: string;
  end_date: string;
  entry_fee: number;
  prize_pool: any[];
  max_participants: number;
  status: string;
}

const TournamentHub: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadLeaderboard(selectedTournament.id);
    }
  }, [selectedTournament]);

  const loadTournaments = async () => {
    try {
      const data = await fetchActiveTournaments();
      setTournaments(data);
      if (data.length > 0) {
        setSelectedTournament(data[0]);
      }
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (tournamentId: string) => {
    try {
      const data = await fetchTournamentLeaderboard(tournamentId);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) return;
    try {
      await joinTournament(tournamentId, user.id);
      alert('Successfully joined tournament!');
      loadLeaderboard(tournamentId);
    } catch (error: any) {
      alert(error.message || 'Failed to join tournament');
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tournament List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Active Tournaments
        </h2>

        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            onClick={() => setSelectedTournament(tournament)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTournament?.id === tournament.id
                ? 'border-purple-600 bg-purple-50' :'border-gray-200 hover:border-purple-300'
            }`}
          >
            <h3 className="font-bold text-lg">{tournament.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{tournament.description}</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{getTimeRemaining(tournament.end_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span>
                  Max {tournament.max_participants} participants
                </span>
              </div>
              {tournament.entry_fee > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-gray-500" />
                  <span>Entry: {tournament.entry_fee} gold</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tournament Details & Leaderboard */}
      <div className="lg:col-span-2">
        {selectedTournament ? (
          <div className="space-y-6">
            {/* Tournament Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{selectedTournament.name}</h1>
              <p className="text-purple-100">{selectedTournament.description}</p>
              <div className="mt-4 flex items-center gap-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {selectedTournament.tournament_type}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {selectedTournament.status}
                </span>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Prize Pool
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {selectedTournament.prize_pool?.map((prize: any, index: number) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-yellow-600">
                      #{prize.rank}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{prize.reward}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Leaderboard
                </h3>
                <button
                  onClick={() => handleJoinTournament(selectedTournament.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Join Tournament
                </button>
              </div>

              <div className="space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No participants yet. Be the first to join!
                  </p>
                ) : (
                  leaderboard.map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        index < 3
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50' :'bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? 'bg-yellow-400 text-yellow-900'
                            : index === 1
                            ? 'bg-gray-300 text-gray-700'
                            : index === 2
                            ? 'bg-orange-400 text-orange-900' :'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {participant.rank || index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">
                          {participant.user?.user_profiles?.username || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {participant.score}
                        </div>
                      </div>
                      {participant.eliminated && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                          Eliminated
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Select a tournament to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentHub;