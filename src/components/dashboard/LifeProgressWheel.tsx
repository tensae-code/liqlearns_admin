import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Save, X, AlertTriangle, Lightbulb, CheckCircle, Zap } from 'lucide-react';
import { 
  lifeProgressService, 
  LifeCategory, 
  CategoryProgress, 
  OverallProgress,
  ImbalancedCategory,
  LifeProgressSuggestion,
  CategoryMission
} from '../../services/lifeProgressService';

interface LifeProgressWheelProps {
  studentId: string;
  onClose?: () => void;
}

const LifeProgressWheel: React.FC<LifeProgressWheelProps> = ({ studentId, onClose }) => {
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const [dailyScores, setDailyScores] = useState<Record<LifeCategory, number>>({
    spiritual: 50,
    health: 50,
    wealth: 50,
    service: 50,
    education: 50,
    family: 50,
    social: 50
  });
  const [notes, setNotes] = useState<Record<LifeCategory, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory | null>(null);
  const [imbalancedCategories, setImbalancedCategories] = useState<ImbalancedCategory[]>([]);
  const [suggestions, setSuggestions] = useState<LifeProgressSuggestion[]>([]);
  const [categoryMissions, setCategoryMissions] = useState<CategoryMission[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  useEffect(() => {
    loadProgress();
    loadTodayEntries();
    loadImbalanceData();
  }, [studentId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const progress = await lifeProgressService.getOverallProgress(studentId, 30);
      setOverallProgress(progress);
      setError(null);
    } catch (err) {
      console.error('Error loading life progress:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayEntries = async () => {
    try {
      const entries = await lifeProgressService.getTodayEntries(studentId);
      const scores: Record<LifeCategory, number> = {} as any;
      const entryNotes: Record<LifeCategory, string> = {} as any;
      
      entries.forEach(entry => {
        scores[entry.category] = entry.satisfactionScore;
        if (entry.notes) {
          entryNotes[entry.category] = entry.notes;
        }
      });

      setDailyScores(prev => ({ ...prev, ...scores }));
      setNotes(prev => ({ ...prev, ...entryNotes }));
    } catch (err) {
      console.error('Error loading today entries:', err);
    }
  };

  const loadImbalanceData = async () => {
    try {
      // Load imbalanced categories
      const imbalanced = await lifeProgressService.getImbalancedCategories(studentId, 50, 7);
      setImbalancedCategories(imbalanced);

      // Load suggestions
      const categorySuggestions = await lifeProgressService.getCategorySuggestions(studentId);
      setSuggestions(categorySuggestions);

      // Load category missions
      const missions = await lifeProgressService.getCategoryMissions(studentId);
      setCategoryMissions(missions);
    } catch (err) {
      console.error('Error loading imbalance data:', err);
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      setGeneratingSuggestions(true);
      const count = await lifeProgressService.generateSuggestions(studentId);
      await loadImbalanceData();
      setShowSuggestions(true);
      setError(null);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    try {
      await lifeProgressService.createMissionFromSuggestion(studentId, suggestionId);
      await loadImbalanceData();
    } catch (err) {
      console.error('Error applying suggestion:', err);
      setError('Failed to apply suggestion');
    }
  };

  const getCategoryImbalance = (category: LifeCategory): ImbalancedCategory | undefined => {
    return imbalancedCategories.find(ic => ic.category === category);
  };

  const getCategorySuggestions = (category: LifeCategory): LifeProgressSuggestion[] => {
    return suggestions.filter(s => s.category === category);
  };

  const getCategoryMissionsForCategory = (category: LifeCategory): CategoryMission[] => {
    return categoryMissions.filter(m => m.category === category);
  };

  const handleScoreChange = (category: LifeCategory, score: number) => {
    setDailyScores(prev => ({ ...prev, [category]: score }));
  };

  const handleNoteChange = (category: LifeCategory, note: string) => {
    setNotes(prev => ({ ...prev, [category]: note }));
  };

  const handleSaveEntry = async (category: LifeCategory) => {
    try {
      setSaving(true);
      await lifeProgressService.saveDailyEntry(
        studentId,
        category,
        dailyScores[category],
        notes[category]
      );
      await loadProgress();
      setSelectedCategory(null);
      setError(null);
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryScore = (category: LifeCategory): CategoryProgress | undefined => {
    return overallProgress?.categoryScores.find(c => c.category === category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Target className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Life Progress Wheel</h2>
            <p className="text-sm text-gray-600">Track your holistic growth across 7 life areas</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Imbalance Alert Banner */}
      {imbalancedCategories.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-orange-300">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Life Imbalance Detected</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {imbalancedCategories.length} {imbalancedCategories.length === 1 ? 'area needs' : 'areas need'} attention. 
                  We have personalized suggestions to help you improve.
                </p>
                <div className="flex flex-wrap gap-2">
                  {imbalancedCategories.map(ic => (
                    <span
                      key={ic.category}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${lifeProgressService.getSeverityColor(ic.imbalanceSeverity)}20`,
                        color: lifeProgressService.getSeverityColor(ic.imbalanceSeverity)
                      }}
                    >
                      {lifeProgressService.getCategoryLabel(ic.category)} ({Math.round(ic.averageScore)}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateSuggestions}
              disabled={generatingSuggestions}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Lightbulb className="w-4 h-4" />
              {generatingSuggestions ? 'Generating...' : 'Get Suggestions'}
            </button>
          </div>
        </div>
      )}

      {/* Overall Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Overall Life Balance</span>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-orange-600">
              {Math.round(overallProgress?.overallScore || 0)}%
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress?.overallScore || 0}%` }}
          />
        </div>
      </div>

      {/* Category Grid with Imbalance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(['spiritual', 'health', 'wealth', 'service', 'education', 'family', 'social'] as LifeCategory[]).map(category => {
          const categoryData = getCategoryScore(category);
          const imbalance = getCategoryImbalance(category);
          const categorySuggestions = getCategorySuggestions(category);
          const missions = getCategoryMissionsForCategory(category);
          const color = lifeProgressService.getCategoryColor(category);
          const isSelected = selectedCategory === category;
          const hasImbalance = !!imbalance;

          return (
            <div
              key={category}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                hasImbalance && !isSelected
                  ? 'border-orange-400 bg-orange-50 shadow-md'
                  : isSelected 
                  ? 'border-orange-500 bg-orange-50' :'border-gray-200 hover:border-orange-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedCategory(isSelected ? null : category)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-semibold text-gray-900 capitalize">
                    {lifeProgressService.getCategoryLabel(category)}
                  </span>
                  {hasImbalance && (
                    <AlertTriangle 
                      className="w-4 h-4" 
                      style={{ color: lifeProgressService.getSeverityColor(imbalance.imbalanceSeverity) }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {categoryData && getTrendIcon(categoryData.trend)}
                  <span 
                    className="text-lg font-bold"
                    style={{ color: hasImbalance ? lifeProgressService.getSeverityColor(imbalance.imbalanceSeverity) : '#111827' }}
                  >
                    {Math.round(categoryData?.averageScore || 0)}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${categoryData?.averageScore || 0}%`,
                    backgroundColor: hasImbalance 
                      ? lifeProgressService.getSeverityColor(imbalance.imbalanceSeverity)
                      : color
                  }}
                />
              </div>

              {/* Imbalance Warning */}
              {hasImbalance && !isSelected && (
                <div className="mt-2 p-2 bg-white rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-700 font-medium">
                    {lifeProgressService.getSeverityLabel(imbalance.imbalanceSeverity)}
                  </p>
                  {categorySuggestions.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {categorySuggestions.length} suggestion{categorySuggestions.length > 1 ? 's' : ''} available
                    </p>
                  )}
                </div>
              )}

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Satisfaction (1-100)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={dailyScores[category]}
                    onChange={(e) => handleScoreChange(category, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${dailyScores[category]}%, #E5E7EB ${dailyScores[category]}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span className="font-bold text-gray-900">{dailyScores[category]}</span>
                    <span>100</span>
                  </div>

                  <textarea
                    value={notes[category] || ''}
                    onChange={(e) => handleNoteChange(category, e.target.value)}
                    placeholder="Optional notes about your day..."
                    className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={2}
                  />

                  {/* Suggestions Section */}
                  {categorySuggestions.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-sm text-gray-900">Personalized Suggestions</h4>
                      </div>
                      <div className="space-y-2">
                        {categorySuggestions.slice(0, 3).map(suggestion => (
                          <div key={suggestion.id} className="flex items-start gap-2 p-2 bg-white rounded border border-blue-100">
                            <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800">{suggestion.suggestionText}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplySuggestion(suggestion.id);
                                }}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Create Mission →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daily Missions Section */}
                  {missions.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-sm text-gray-900">Daily Missions</h4>
                      </div>
                      <div className="space-y-2">
                        {missions.slice(0, 3).map(mission => (
                          <div key={mission.id} className="flex items-start gap-2 p-2 bg-white rounded border border-green-100">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{mission.title}</p>
                              <p className="text-xs text-gray-600">{mission.description}</p>
                              <span className="inline-block mt-1 text-xs text-green-600 font-medium">
                                +{mission.xpReward} XP
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleSaveEntry(category)}
                    disabled={saving}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>How to use:</strong> Click on any category to rate your satisfaction for today (1-100). 
          Your progress is calculated from the last 30 days of entries. Aim for balance across all areas!
        </p>
      </div>
    </div>
  );
};

export default LifeProgressWheel;