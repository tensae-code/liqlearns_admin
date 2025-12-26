import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Image from '../AppImage';

interface UserProfileIndicatorProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

const UserProfileIndicator = ({
  userName = 'Administrator',
  userRole = 'System Admin',
  userAvatar,
  onLogout,
  onProfileClick,
  className = ''
}: UserProfileIndicatorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout?.();
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    onProfileClick?.();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Trigger */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors duration-200 ease-out"
        aria-label="User profile menu"
      >
        {/* Avatar */}
        <div className="relative">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={`${userName} avatar`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
        </div>

        {/* User Info (Hidden on mobile) */}
        <div className="hidden md:block text-left">
          <p className="font-body font-medium text-sm text-foreground">
            {userName}
          </p>
          <p className="font-caption text-xs text-muted-foreground">
            {userRole}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-muted-foreground transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-modal z-[1050]">
          <div className="p-3 border-b border-border">
            <div className="flex items-center space-x-3">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={`${userName} avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} color="white" />
                </div>
              )}
              <div>
                <p className="font-body font-medium text-sm text-popover-foreground">
                  {userName}
                </p>
                <p className="font-caption text-xs text-muted-foreground">
                  {userRole}
                </p>
              </div>
            </div>
          </div>

          <div className="py-2">
            {/* Profile Settings */}
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted transition-colors duration-200"
            >
              <Icon name="Settings" size={16} className="text-muted-foreground" />
              <span className="font-body text-sm text-popover-foreground">
                Profile Settings
              </span>
            </button>

            {/* Account Preferences */}
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted transition-colors duration-200"
            >
              <Icon name="Sliders" size={16} className="text-muted-foreground" />
              <span className="font-body text-sm text-popover-foreground">
                Preferences
              </span>
            </button>

            {/* Help & Support */}
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted transition-colors duration-200"
            >
              <Icon name="HelpCircle" size={16} className="text-muted-foreground" />
              <span className="font-body text-sm text-popover-foreground">
                Help & Support
              </span>
            </button>
          </div>

          <div className="border-t border-border py-2">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-destructive/10 transition-colors duration-200"
            >
              <Icon name="LogOut" size={16} className="text-destructive" />
              <span className="font-body text-sm text-destructive">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileIndicator;