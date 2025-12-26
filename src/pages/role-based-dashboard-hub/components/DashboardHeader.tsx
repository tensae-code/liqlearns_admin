import React, { useState } from 'react';
import { User, LogOut, Crown, Shield, BookOpen, Headphones, GraduationCap, Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  role: string;
  loginTime: string;
  sessionId: string;
  isAuthenticated: boolean;
}

interface DashboardHeaderProps {
  user: any;
  userProfile?: any;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, userProfile, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const navigate = useNavigate();

  // CRITICAL FIX: Add null/undefined safety checks
  if (!user) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </header>
    );
  }

  const getRoleIcon = () => {
    if (!user?.role) return <User className="w-4 h-4 text-gray-400" />;
    
    const roleKey = user.role.toLowerCase().replace(/\s+/g, '');
    switch (roleKey) {
      case 'admin': case'systemadministrator':
        return <Shield className="w-4 h-4 text-red-400" />;
      case 'teacher': case'instructor': case'contentmanager':
        return <GraduationCap className="w-4 h-4 text-green-400" />;
      case 'student': case'learner':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'support': case'helpdesk':
        return <Headphones className="w-4 h-4 text-purple-400" />;
      case 'ceo': case'executive':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = () => {
    if (!user?.role) return 'bg-gray-100 text-gray-700 border border-gray-200';
    
    const roleKey = user.role.toLowerCase().replace(/\s+/g, '');
    switch (roleKey) {
      case 'admin': case'systemadministrator':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'teacher': case'instructor': case'contentmanager':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'student': case'learner':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'support': case'helpdesk':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'ceo': case'executive':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // CRITICAL FIX: Add home navigation handler
  const handleHomeClick = () => {
    navigate('/landing-page');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button + Welcome Message */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button - Now stable in header */}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="lg:hidden p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showProfileMenu ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
          </button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.username || userProfile?.full_name || 'User'}
            </h2>
          </div>
        </div>

        {/* Right Side - User Profile & Actions */}
        <div className="flex items-center space-x-4">
          {/* CRITICAL FIX: Add Home button in header */}
          <button
            onClick={handleHomeClick}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go to home page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </button>

          {/* Role badge from userProfile */}
          {userProfile?.role && (
            <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium capitalize">
              {userProfile.role}
            </div>
          )}

          {/* User Profile Dropdown */}
          <div className="relative group">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              {/* Display full_name from userProfile */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || user?.email?.split('@')?.[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userProfile?.role || user?.role || 'User'}
                </p>
              </div>
              
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                {(userProfile?.full_name || user?.email || 'U')?.[0]?.toUpperCase()}
              </div>
              
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{user?.username || userProfile?.full_name || 'User'}</p>
                  <p className="text-sm text-gray-600 capitalize">{userProfile?.role || user?.role || 'User'}</p>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    Preferences
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;