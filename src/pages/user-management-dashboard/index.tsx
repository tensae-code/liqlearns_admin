import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import UserProfileIndicator from '../../components/ui/UserProfileIndicator';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NotificationCenter from '../../components/ui/NotificationCenter';
import UserMetricsCards from './components/UserMetricsCards';
import UserFiltersPanel from './components/UserFiltersPanel';
import UserTable from './components/UserTable';
import MLMGenealogyTree from './components/MLMGenealogyTree';
import UserDetailModal from './components/UserDetailModal';
import {
  User,
  UserMetrics,
  UserFilters,
  MLMNode,
  SortConfig,
  BanAction,
  UserProgress } from
'./types';

const UserManagementDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'joinDate', direction: 'desc' });

  // Mock data
  const mockUsers: User[] = [
  {
    id: '1',
    username: 'abebeK',
    fullName: 'Abebe Kebede',
    email: 'abebe.kebede@email.com',
    sponsor: 'mesfinT',
    currentLevel: 'Team Leader',
    auraPoints: 15420,
    accountStatus: 'active',
    joinDate: new Date('2024-01-15'),
    lastLogin: new Date('2024-12-10T14:30:00'),
    totalEarnings: 45000,
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_13998e68a-1763293762914.png",
    profileImageAlt: 'Professional Ethiopian man in blue shirt smiling at camera',
    phoneNumber: '+251911234567',
    language: 'amharic',
    referralCode: 'ABE2024',
    isVerified: true
  },
  {
    id: '2',
    username: 'maryamA',
    fullName: 'Maryam Ahmed',
    email: 'maryam.ahmed@email.com',
    sponsor: 'abebeK',
    currentLevel: 'Salesman',
    auraPoints: 8750,
    accountStatus: 'pending',
    joinDate: new Date('2024-02-20'),
    lastLogin: new Date('2024-12-09T16:45:00'),
    totalEarnings: 12500,
    profileImage: "https://images.unsplash.com/photo-1664764731538-69a2b571e5a6",
    profileImageAlt: 'Young Ethiopian woman with hijab smiling warmly',
    phoneNumber: '+251922345678',
    language: 'tigrinya',
    referralCode: 'MAR2024',
    isVerified: false
  },
  {
    id: '3',
    username: 'dawit123',
    fullName: 'Dawit Tesfaye',
    email: 'dawit.tesfaye@email.com',
    sponsor: 'abebeK',
    currentLevel: 'Ambassador',
    auraPoints: 32100,
    accountStatus: 'active',
    joinDate: new Date('2023-11-10'),
    lastLogin: new Date('2024-12-10T09:15:00'),
    totalEarnings: 125000,
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1d80cb3da-1763293763014.png",
    profileImageAlt: 'Ethiopian businessman in formal suit with confident expression',
    phoneNumber: '+251933456789',
    language: 'oromifa',
    referralCode: 'DAW2023',
    isVerified: true
  },
  {
    id: '4',
    username: 'hanaM',
    fullName: 'Hana Mulugeta',
    email: 'hana.mulugeta@email.com',
    sponsor: 'dawit123',
    currentLevel: 'Student',
    auraPoints: 2340,
    accountStatus: 'banned',
    joinDate: new Date('2024-03-05'),
    lastLogin: new Date('2024-11-28T11:20:00'),
    totalEarnings: 0,
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2617586-1763301756396.png",
    profileImageAlt: 'Young Ethiopian student with bright smile and casual attire',
    phoneNumber: '+251944567890',
    language: 'amharic',
    referralCode: 'HAN2024',
    isVerified: false,
    banReason: 'Violation of platform terms - reselling content',
    banExpiryDate: new Date('2025-01-15')
  },
  {
    id: '5',
    username: 'solomon99',
    fullName: 'Solomon Girma',
    email: 'solomon.girma@email.com',
    sponsor: 'maryamA',
    currentLevel: 'Supervisor',
    auraPoints: 19800,
    accountStatus: 'temporary_ban',
    joinDate: new Date('2024-01-30'),
    lastLogin: new Date('2024-12-05T13:10:00'),
    totalEarnings: 67500,
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_153951ed6-1763294769986.png",
    profileImageAlt: 'Middle-aged Ethiopian man with glasses in professional setting',
    phoneNumber: '+251955678901',
    language: 'english',
    referralCode: 'SOL2024',
    isVerified: true,
    banReason: 'Temporary suspension for review',
    banExpiryDate: new Date('2024-12-20')
  }];


  const mockMetrics: UserMetrics = {
    totalActiveUsers: 1247,
    pendingApprovals: 23,
    dailyRegistrations: 8,
    totalBannedUsers: 15,
    monthlyGrowthRate: 12.5
  };

  const mockMLMTree: MLMNode = {
    id: 'root-1',
    userId: '1',
    username: 'abebeK',
    fullName: 'Abebe Kebede',
    level: 'Team Leader',
    auraPoints: 15420,
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_13998e68a-1763293762914.png",
    profileImageAlt: 'Professional Ethiopian man in blue shirt smiling at camera',
    leg: 'A',
    totalDownline: 12,
    monthlyVolume: 45000,
    isExpanded: true,
    children: [
    {
      id: 'node-2',
      userId: '2',
      username: 'maryamA',
      fullName: 'Maryam Ahmed',
      level: 'Salesman',
      auraPoints: 8750,
      profileImage: "https://images.unsplash.com/photo-1664764731538-69a2b571e5a6",
      profileImageAlt: 'Young Ethiopian woman with hijab smiling warmly',
      leg: 'A',
      totalDownline: 3,
      monthlyVolume: 12500,
      isExpanded: false,
      children: []
    },
    {
      id: 'node-3',
      userId: '3',
      username: 'dawit123',
      fullName: 'Dawit Tesfaye',
      level: 'Ambassador',
      auraPoints: 32100,
      profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1d80cb3da-1763293763014.png",
      profileImageAlt: 'Ethiopian businessman in formal suit with confident expression',
      leg: 'B',
      totalDownline: 8,
      monthlyVolume: 125000,
      isExpanded: false,
      children: []
    },
    {
      id: 'node-4',
      userId: '4',
      username: 'hanaM',
      fullName: 'Hana Mulugeta',
      level: 'Student',
      auraPoints: 2340,
      profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2617586-1763301756396.png",
      profileImageAlt: 'Young Ethiopian student with bright smile and casual attire',
      leg: 'C',
      totalDownline: 0,
      monthlyVolume: 0,
      isExpanded: false,
      children: []
    },
    {
      id: 'node-5',
      userId: '5',
      username: 'solomon99',
      fullName: 'Solomon Girma',
      level: 'Supervisor',
      auraPoints: 19800,
      profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_153951ed6-1763294769986.png",
      profileImageAlt: 'Middle-aged Ethiopian man with glasses in professional setting',
      leg: 'D',
      totalDownline: 1,
      monthlyVolume: 67500,
      isExpanded: false,
      children: []
    }]

  };

  const mockUserProgress: UserProgress = {
    userId: '1',
    learningLevel: 'Advanced',
    skillScores: {
      listening: 85,
      speaking: 78,
      writing: 92,
      reading: 88
    },
    streakDays: 45,
    totalPoints: 15420,
    completedCourses: 12,
    timeSpentLearning: 2340
  };

  const [filters, setFilters] = useState<UserFilters>({
    level: 'all',
    language: 'all',
    status: 'all',
    searchQuery: '',
    dateRange: {
      start: null,
      end: null
    }
  });

  const [mlmTree, setMLMTree] = useState<MLMNode>(mockMLMTree);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = mockUsers.filter((user) => {
      const matchesLevel = filters.level === 'all' || user.currentLevel === filters.level;
      const matchesLanguage = filters.language === 'all' || user.language === filters.language;
      const matchesStatus = filters.status === 'all' || user.accountStatus === filters.status;
      const matchesSearch = !filters.searchQuery ||
      user.username.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesDateRange = (!filters.dateRange.start || user.joinDate >= filters.dateRange.start) && (
      !filters.dateRange.end || user.joinDate <= filters.dateRange.end);

      return matchesLevel && matchesLanguage && matchesStatus && matchesSearch && matchesDateRange;
    });

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [filters, sortConfig]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleBanAction = (action: BanAction) => {
    console.log('Ban action:', action);
    // In a real app, this would make an API call
  };

  const handleNodeClick = (node: MLMNode) => {
    const user = mockUsers.find((u) => u.id === node.userId);
    if (user) {
      handleUserClick(user);
    }
  };

  const handleNodeExpand = (nodeId: string) => {
    const updateNodeExpansion = (node: MLMNode): MLMNode => {
      if (node.id === nodeId) {
        return { ...node, isExpanded: !node.isExpanded };
      }
      return {
        ...node,
        children: node.children.map(updateNodeExpansion)
      };
    };

    setMLMTree(updateNodeExpansion(mlmTree));
  };

  const handleResetFilters = () => {
    setFilters({
      level: 'all',
      language: 'all',
      status: 'all',
      searchQuery: '',
      dateRange: {
        start: null,
        end: null
      }
    });
  };

  const handleBanUser = (userId: string) => {
    handleBanAction({
      userId,
      type: 'ban',
      reason: 'Manual admin action',
      adminId: 'admin-001',
      timestamp: new Date()
    });
    setIsUserModalOpen(false);
  };

  const handleApproveUser = (userId: string) => {
    handleBanAction({
      userId,
      type: 'approve',
      adminId: 'admin-001',
      timestamp: new Date()
    });
    setIsUserModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>User Management Dashboard - LiqLearns Admin</title>
        <meta name="description" content="Manage users, genealogy networks, and approval workflows for the Ethiopian language learning platform" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <NavigationSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />


        <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BreadcrumbNavigation
                  items={[
                  { label: 'Dashboard', href: '/admin' },
                  { label: 'User Management', href: '/admin/users' }]
                  } />

              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter
                  onNotificationClick={(id) => console.log('Notification clicked:', id)}
                  onMarkAsRead={(id) => console.log('Mark as read:', id)}
                  onMarkAllAsRead={() => console.log('Mark all as read')} />

                <UserProfileIndicator
                  userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                  onLogout={() => console.log('Logout clicked')}
                  onProfileClick={() => console.log('Profile clicked')} />

              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
                User Management Dashboard
              </h1>
              <p className="font-body text-muted-foreground">
                Manage user profiles, genealogy networks, and approval workflows across the platform
              </p>
            </div>

            {/* Metrics Cards */}
            <UserMetricsCards metrics={mockMetrics} />

            {/* Filters */}
            <UserFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              onResetFilters={handleResetFilters} />


            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* User Table */}
              <div className="xl:col-span-2">
                <UserTable
                  users={filteredAndSortedUsers}
                  onUserClick={handleUserClick}
                  onBanAction={handleBanAction}
                  onSortChange={setSortConfig}
                  sortConfig={sortConfig} />

              </div>

              {/* MLM Genealogy Tree */}
              <div className="xl:col-span-1">
                <MLMGenealogyTree
                  rootNode={mlmTree}
                  onNodeClick={handleNodeClick}
                  onNodeExpand={handleNodeExpand} />

              </div>
            </div>
          </div>
        </main>

        {/* User Detail Modal */}
        <UserDetailModal
          user={selectedUser}
          userProgress={selectedUser?.id === '1' ? mockUserProgress : undefined}
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onBanUser={handleBanUser}
          onApproveUser={handleApproveUser} />

      </div>
    </>);

};

export default UserManagementDashboard;