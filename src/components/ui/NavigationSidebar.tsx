import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface NavigationItem {
  label: string;
  section: string;
  icon: string;
}

interface NavigationCategory {
  label: string;
  icon: string;
  items: NavigationItem[];
}

interface NavigationSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onSectionChange?: (section: string) => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  isOpen, 
  onClose,
  onSectionChange
}) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigationCategories: NavigationCategory[] = [
    {
      label: 'Users & Network',
      icon: 'Users',
      items: [
        { label: 'User Management', section: 'users', icon: 'UserCheck' },
        { label: 'Progress Analytics', section: 'analytics', icon: 'BarChart3' },
      ],
    },
    {
      label: 'Content & Events',
      icon: 'BookOpen',
      items: [
        { label: 'Content Management', section: 'content', icon: 'FileText' },
        { label: 'Event Calendar', section: 'events', icon: 'Calendar' },
      ],
    },
    {
      label: 'Financial & Commerce',
      icon: 'DollarSign',
      items: [
        { label: 'Financial Dashboard', section: 'financial', icon: 'TrendingUp' },
        { label: 'Store Management', section: 'store', icon: 'Store' },
      ],
    },
  ];

  const handleNavigationClick = (section: string) => {
    setActiveSection(section);
    
    // Use hash-based navigation for embedded sections
    window.location.hash = section;
    
    // If callback is provided, notify parent component
    if (onSectionChange) {
      onSectionChange(section);
    }
    
    // Close mobile menu if open
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white z-50 transition-all duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
        } lg:w-64 lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={20} color="white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="font-heading font-semibold text-lg text-foreground">
                    LiqLearns
                  </h1>
                  <p className="font-caption text-xs text-muted-foreground">
                    Admin Dashboard
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6">
              {navigationCategories.map((category) => (
                <div key={category.label} className="px-3">
                  {!isCollapsed && (
                    <div className="flex items-center space-x-2 px-3 py-2 mb-2">
                      <Icon name={category.icon} size={16} className="text-muted-foreground" />
                      <span className="font-body font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {category.label}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const isActive = activeSection === item.section;
                      return (
                        <button
                          key={item.section}
                          onClick={() => handleNavigationClick(item.section)}
                          className={`
                            flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ease-out w-full
                            ${isActive 
                              ? 'bg-primary text-primary-foreground shadow-card' 
                              : 'text-foreground hover:bg-muted hover:text-foreground'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                          `}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <Icon 
                            name={item.icon} 
                            size={20} 
                            className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'} 
                          />
                          {!isCollapsed && (
                            <span className="font-body font-medium text-sm">
                              {item.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Collapse Toggle (Desktop Only) */}
          {onToggle && (
            <div className="hidden lg:block p-3 border-t border-border">
              <button
                onClick={onToggle}
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Icon 
                  name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
                  size={20} 
                  className="text-muted-foreground" 
                />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default NavigationSidebar;