import React, { useState, useEffect } from 'react';
import { X, Search, Award, Trophy, AlertCircle, Calendar, Crown, Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// Types for public badge profiles - FIXED to match actual database schema
interface PublicBadgeProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  total_badges: number;
  total_xp: number;
  current_level: number;
  level_name: string;
  rank_title: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface BadgeCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BadgeCheckModal: React.FC<BadgeCheckModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicBadgeProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PublicBadgeProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search for public badge profiles
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a username to search');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase
        .from('public_badge_profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .eq('is_public', true)
        .limit(10);

      if (searchError) throw searchError;

      setSearchResults(data || []);
      
      if (data?.length === 0) {
        setError('No public profiles found matching your search');
      }
    } catch (err: any) {
      console.error('Badge search error:', err);
      setError(err?.message || 'Failed to search for badges. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // View detailed profile
  const handleViewProfile = (profile: PublicBadgeProfile) => {
    setSelectedProfile(profile);
  };

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedProfile(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Badge Checker</h2>
              <p className="text-orange-100 text-sm">Search and view public badge profiles</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter username to search..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {selectedProfile ? (
            // Detailed Profile View
            <div className="space-y-6">
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-2"
              >
                <span>← Back to search results</span>
              </button>

              {/* Profile Header */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {selectedProfile.profile_image_url ? (
                    <img 
                      src={selectedProfile.profile_image_url} 
                      alt={selectedProfile.display_name || selectedProfile.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedProfile.display_name || selectedProfile.username}
                    </h3>
                    <p className="text-orange-600">@{selectedProfile.username}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                        {selectedProfile.level_name}
                      </span>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                        {selectedProfile.rank_title}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedProfile.bio && (
                  <p className="text-gray-700 mb-4">{selectedProfile.bio}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Award className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-gray-600 font-medium">Badges</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{selectedProfile.total_badges}</span>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600 font-medium">Total XP</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{selectedProfile.total_xp}</span>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Trophy className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600 font-medium">Level</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{selectedProfile.current_level}</span>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600 font-medium">Member Since</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {new Date(selectedProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Achievement Showcase */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Crown className="w-5 h-5 text-orange-500 mr-2" />
                  Achievement Stats
                </h4>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Badge Collection</p>
                        <p className="text-xl font-bold text-gray-900">{selectedProfile.total_badges} Badges</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Experience Points</p>
                        <p className="text-xl font-bold text-gray-900">{selectedProfile.total_xp.toLocaleString()} XP</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Level</p>
                        <p className="text-xl font-bold text-gray-900">Level {selectedProfile.current_level}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Rank</p>
                        <p className="text-lg font-bold text-gray-900">{selectedProfile.rank_title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            // Search Results List
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Search Results ({searchResults.length})</h3>
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleViewProfile(profile)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {profile.profile_image_url ? (
                        <img 
                          src={profile.profile_image_url} 
                          alt={profile.display_name || profile.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900">{profile.display_name || profile.username}</h4>
                        <p className="text-sm text-gray-600">@{profile.username}</p>
                        {profile.bio && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{profile.bio}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                            {profile.level_name}
                          </span>
                          <span className="text-xs text-gray-500">Level {profile.current_level}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-orange-600 font-medium">
                        <Award className="w-5 h-5" />
                        <span>{profile.total_badges}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">badges earned</p>
                      <div className="flex items-center space-x-2 text-purple-600 font-medium mt-1">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs">{profile.total_xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Search for Badge Profiles</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter a username to discover public badge profiles and see what achievements learners have earned
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeCheckModal;