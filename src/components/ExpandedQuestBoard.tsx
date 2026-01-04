import React, { useEffect, useState } from 'react';
import { Target, Trophy, Gift, Play, Users, Book, Calendar } from 'lucide-react';
import { getQuestTemplates, QuestTemplate } from '../services/gamificationService';

const ExpandedQuestBoard: React.FC = () => {
  const [quests, setQuests] = useState<QuestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadQuests();
  }, [selectedDifficulty]);

  const loadQuests = async () => {
    try {
      const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty;
      const questsData = await getQuestTemplates(difficulty);
      setQuests(questsData);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'watch_minutes':
        return <Play className="w-6 h-6" />;
      case 'complete_assignment':
        return <Book className="w-6 h-6" />;
      case 'help_teammate':
        return <Users className="w-6 h-6" />;
      case 'daily_login':
        return <Calendar className="w-6 h-6" />;
      case 'study_session':
        return <Target className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'hard':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'epic':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
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
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-8 h-8 text-indigo-600" />
          Available Quest Types
        </h2>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="epic">Epic</option>
        </select>
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="border-2 border-gray-200 rounded-lg p-5 hover:border-indigo-500 transition-colors hover:shadow-lg"
          >
            {/* Quest Header */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-full ${
                quest.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                quest.difficulty === 'medium' ? 'bg-blue-100 text-blue-600' :
                quest.difficulty === 'hard'? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {getQuestIcon(quest.quest_type)}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getDifficultyColor(quest.difficulty)}`}>
                {quest.difficulty.toUpperCase()}
              </span>
            </div>

            {/* Quest Info */}
            <h3 className="font-bold text-gray-900 mb-2">{quest.quest_name}</h3>
            <p className="text-sm text-gray-600 mb-4">{quest.description}</p>

            {/* Quest Target */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">Target:</span>
                <span>{quest.target_value} {quest.quest_type === 'watch_minutes' ? 'minutes' : 'completions'}</span>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-indigo-600">{quest.xp_reward} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-indigo-600">{quest.gold_reward} Gold</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quests.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No quests available for this difficulty</p>
        </div>
      )}

      {/* Quest Type Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-bold text-gray-900 mb-3">Quest Types:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-indigo-600" />
            <span className="text-gray-700">Watch Minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4 text-indigo-600" />
            <span className="text-gray-700">Complete Assignment</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-gray-700">Help Teammate</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-gray-700">Daily Login</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span className="text-gray-700">Study Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedQuestBoard;