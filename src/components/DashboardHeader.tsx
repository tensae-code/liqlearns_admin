import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, LogOut, Sliders, User } from 'lucide-react';
import NotificationCenter from './ui/NotificationCenter';


// ... existing interfaces ...

interface DashboardHeaderProps {
  user: {
    username: string;
    role: string;
    loginTime?: string;
    sessionId?: string;
    isAuthenticated: boolean;
  };
  onLogout: () => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onLogout,
  onMenuClick,
  isSidebarOpen
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FIX: Added proper handlers for dropdown buttons
  const handleProfileSettings = () => {
    setIsDropdownOpen(false);
    // Navigate to settings page
    window.location.href = '/settings';
  };

  const handlePreferences = () => {
    setIsDropdownOpen(false);
    // Navigate to preferences
    window.location.href = '/preferences';
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const getRoleIcon = () => {
    // ... existing getRoleIcon code ...
  };

  const getRoleBadgeColor = () => {
    // ... existing getRoleBadgeColor code ...
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
          
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-gray-800">
              Welcome back, <span className="text-orange-500">{user.username}</span>
            </h2>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </div>

          {/* Notification Center */}
          <NotificationCenter 
            onNotificationClick={(notification) => {
              console.log('Notification clicked:', notification);
            }}
            onMarkAsRead={(id) => {
              console.log('Mark as read:', id);
            }}
            onMarkAllAsRead={() => {
              console.log('Mark all as read');
            }}
          />

          {/* Role Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${getRoleBadgeColor()}`}>
            {getRoleIcon()}
            <span className="text-sm font-medium capitalize">{user.role}</span>
          </div>

          {/* User Dropdown - FIX: Always visible profile icon with working logout */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </button>

            {/* FIX: Dropdown with working button handlers */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                
                <button 
                  onClick={handleProfileSettings}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                
                <button 
                  onClick={handlePreferences}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                  Preferences
                </button>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;