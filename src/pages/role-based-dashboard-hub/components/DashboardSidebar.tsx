import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Shield, GraduationCap, Headphones, Crown, User, Store, Calendar, DollarSign, FileText, TrendingUp, MessageSquare, Package, Bell, HelpCircle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


interface User {
  username: string;
  role: string;
  fullName?: string;
  isAuthenticated: boolean;
}

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
  onCollapse?: (collapsed: boolean) => void;
  isCollapsed?: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  userRole,
  onCollapse,
  isCollapsed = false
}) => {
  const navigate = useNavigate();

  // FIX: Handle collapse toggle
  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    if (onCollapse) {
      onCollapse(newCollapsedState);
    }
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const roleKey = userRole.toLowerCase().replace(/\s+/g, '');
    
    const commonItems = [
      { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
      { icon: Settings, label: 'Settings', section: 'settings', route: '#settings' }
    ];

    switch (roleKey) {
      case 'admin': case'systemadministrator':
        return [
          { icon: LayoutDashboard, label: 'Overview', section: 'dashboard' },
          { icon: Users, label: 'User Management', section: 'users', route: '#users' },
          { icon: DollarSign, label: 'Financial', section: 'financial', route: '/financial-dashboard' },
          { icon: FileText, label: 'Content', section: 'content', route: '#content' },
          { icon: BarChart3, label: 'Analytics', section: 'analytics', route: '#analytics' },
          { icon: Store, label: 'Store', section: 'store', route: '/store-management-system' },
          { icon: Calendar, label: 'Events', section: 'events', route: '/event-calendar-manager' },
          { icon: Bell, label: 'Approvals', section: 'approvals', route: '#approvals' },
          { icon: MessageSquare, label: 'Support', section: 'support', route: '#support' },
          { icon: Settings, label: 'Settings', section: 'settings', route: '#settings' }
        ];
      case 'student': case'learner':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
          { icon: Users, label: 'Study Rooms', section: 'study-rooms', route: '#study-rooms' },
          { icon: TrendingUp, label: 'Quest', section: 'progress', route: '#progress' },
          { icon: DollarSign, label: 'Treasury', section: 'earners', route: '#earners' },
          { icon: Calendar, label: 'Events', section: 'events', route: '#events' },
          { icon: Package, label: 'Marketplace', section: 'marketplace', route: '#marketplace' },
          { icon: MessageSquare, label: 'Community', section: 'community', route: '#community' },
          { icon: HelpCircle, label: 'Help', section: 'help', route: '#help' },
          { icon: Settings, label: 'Settings', section: 'settings', route: '#settings' }
        ];
      case 'teacher': case 'tutor': case'instructor': case'contentmanager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
          { icon: BookOpen, label: 'My Classes', section: 'classes', route: '#classes' },
          { icon: Users, label: 'Students', section: 'students', route: '#students' },
          { icon: FileText, label: 'Content', section: 'content', route: '#content' },
          { icon: BarChart3, label: 'Reports', section: 'reports', route: '#reports' },
          { icon: Calendar, label: 'Schedule', section: 'schedule', route: '#schedule' },
          { icon: Store, label: 'Store', section: 'store', route: '#store' },
          { icon: HelpCircle, label: 'Help', section: 'help', route: '#help' },
          { icon: Settings, label: 'Settings', section: 'settings', route: '#settings' }
        ];
      case 'support': case'helpdesk':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
          { icon: MessageSquare, label: 'Tickets', section: 'tickets', route: '#tickets' },
          { icon: Users, label: 'User Support', section: 'support', route: '#support' },
          { icon: BookOpen, label: 'Knowledge Base', section: 'knowledge', route: '#knowledge' },
          { icon: BarChart3, label: 'Reports', section: 'reports', route: '#reports' },
          { icon: Settings, label: 'Settings', section: 'settings', route: '#settings' }
        ];
      case 'ceo': case'executive':
        return [
          { icon: LayoutDashboard, label: 'Executive Dashboard', section: 'dashboard', route: '#dashboard' },
          { icon: BookOpen, label: 'Course Management', section: 'courses', route: '#courses' },
          { icon: BarChart3, label: 'Business Analytics', section: 'analytics', route: '#analytics' },
          { icon: DollarSign, label: 'Financial Overview', section: 'financial', route: '#financial' },
          { icon: Users, label: 'Organization', section: 'organization', route: '#organization' },
          { icon: TrendingUp, label: 'Growth Metrics', section: 'growth', route: '#growth' },
          { icon: Settings, label: 'Settings', section: 'settings', route: '#settings' }
        ];
      default:
        return commonItems;
    }
  };

  const getRoleIcon = () => {
    const roleKey = userRole.toLowerCase().replace(/\s+/g, '');
    switch (roleKey) {
      case 'admin': case'systemadministrator':
        return <Shield className="w-5 h-5 text-red-400" />;
      case 'teacher': case 'tutor': case'instructor': case'contentmanager':
        return <GraduationCap className="w-5 h-5 text-green-400" />;
      case 'student': case'learner':
        return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'support': case'helpdesk':
        return <Headphones className="w-5 h-5 text-purple-400" />;
      case 'ceo': case'executive':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get navigation items based on user role
  const navigationItems = getNavigationItems();

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo and Collapse Button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-orange-600">LiqLearns</h1>
        )}
        <button
          onClick={handleCollapseToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            return (
              <button
                key={index}
               onClick={() => {
                  if (item.route?.startsWith('/')) {
                    navigate(item.route);
                    return;
                  }

                  onSectionChange(item.section);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.section
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
            {getRoleIcon()}
            <div>
              <p className="text-sm font-medium text-gray-900">{userRole}</p>
              <p className="text-xs text-gray-600 capitalize">{userRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <button
            onClick={() => navigate('/login')}
            className="group flex items-center space-x-3 p-3 w-full text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;