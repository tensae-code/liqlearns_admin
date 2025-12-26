import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardHeader from './components/DashboardHeader';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import SupportDashboard from './components/SupportDashboard';
import CEODashboard from './components/CEODashboard';
import SettingsProfileManagement from '../settings-profile-management';

const RoleBasedDashboardHub: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  // FIX: Add sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CRITICAL FIX: Wait for userProfile to load from AuthContext
    if (userProfile) {
      setLoading(false);
    } else if (user) {
      // User is authenticated but profile hasn't loaded yet
      setLoading(true);
    } else {
      // No user - should redirect to login
      setLoading(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    // Check authentication using AuthContext
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Listen to hash changes and update active section
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveSection(hash);
      } else {
        setActiveSection('dashboard');
      }
    };

    // Set initial section from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { signOut } = useAuth();
      
      // CRITICAL FIX: Call signOut and wait for completion
      await signOut();
      
      // CRITICAL FIX: Navigate to landing page instead of login
      // This prevents the auto-login loop
      navigate('/landing-page', { replace: true });
      
      console.log('✅ Logout complete, navigating to landing page');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if error occurs, force navigation to landing page
      navigate('/landing-page', { replace: true });
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Update URL hash for proper navigation
    window.location.hash = section;
  };

  // Show loading state while checking authentication and loading profile
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Check if userProfile exists and has required data
  if (!userProfile || !userProfile.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Unable to load user profile</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Create user object from userProfile for components
  const userData = {
    username: userProfile?.email?.split('@')[0] || 'user',
    role: userProfile?.role || 'student',
    fullName: userProfile?.full_name || 'User',
    isAuthenticated: true
  };

  // CRITICAL FIX: Determine which dashboard to show based on userProfile.role
  const renderDashboard = () => {
    const roleKey = userProfile?.role?.toLowerCase() || 'student';

    switch (roleKey) {
      case 'admin':
        return <AdminDashboard activeSection={activeSection} />;
      case 'student':
        return <StudentDashboard activeSection={activeSection} />;
      case 'teacher': case'tutor':
        return <TeacherDashboard activeSection={activeSection} />;
      case 'support':
        return <SupportDashboard />;
      case 'ceo':
        return <CEODashboard activeSection={activeSection} />;
      default:
        // CRITICAL FIX: If role is invalid, show student dashboard as fallback
        console.warn(`Unknown role: ${roleKey}, defaulting to student dashboard`);
        return <StudentDashboard activeSection={activeSection} />;
    }
  };

  const renderContent = () => {
    if (activeSection === 'settings') {
      return <SettingsProfileManagement userRole={userData.role} />;
    }
    
    return renderDashboard();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white flex">
      {/* Sidebar with collapse functionality */}
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={userProfile?.role}
        onCollapse={setIsSidebarCollapsed}
        isCollapsed={isSidebarCollapsed}
      />

      {/* FIX: Main content with responsive width adjustment */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Dashboard Header */}
        <DashboardHeader
          user={user}
          userProfile={userProfile}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default RoleBasedDashboardHub;