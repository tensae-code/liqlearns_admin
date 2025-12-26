import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Shield, Loader2, Settings as SettingsIcon, Bell, Headphones, MessageSquare, Search, User, BarChart3, FileText, BookOpen } from 'lucide-react';

// Import services
import { getSystemStats, getPendingApprovals, getSystemAlerts, handleApprovalAction } from '../../../services/adminDashboardService';
import type { SystemStats, PendingApproval, SystemAlert } from '../../../services/adminDashboardService';
import { getSupportMetrics, getTickets, updateTicketStatus, getFAQs, type SupportMetrics, type Ticket, type TicketFilters, type FAQ } from '../../../services/supportDashboardService';
import Icon from '../../../components/AppIcon';
import SecurityComplianceTab from '../../../components/SecurityComplianceTab';


interface AdminDashboardProps {
  activeSection?: string;
}

export default function AdminDashboard({ activeSection: initialActiveSection = 'dashboard' }: AdminDashboardProps) {
  // Initialize state with the prop value
  const [activeSection, setActiveSection] = useState<string>(initialActiveSection);
  
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  // Support section state
  const [supportMetrics, setSupportMetrics] = useState<SupportMetrics | null>(null);
  const [supportTickets, setSupportTickets] = useState<Ticket[]>([]);
  const [supportFaqs, setSupportFaqs] = useState<FAQ[]>([]);
  const [supportLoading, setSupportLoading] = useState<boolean>(false);
  const [supportActiveTab, setSupportActiveTab] = useState('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [processingTicket, setProcessingTicket] = useState<string | null>(null);

  // NEW: User Management state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // NEW: Analytics state
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('7days');

  // Tabs for navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  // Navigation handler
  const onSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Load dashboard data
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async (): Promise<void> => {
      try {
        const [statsData, approvalsData, alertsData] = await Promise.all([
          getSystemStats(),
          getPendingApprovals(),
          getSystemAlerts()
        ]);

        if (isMounted) {
          setStats(statsData);
          setPendingApprovals(approvalsData);
          setSystemAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load support data when support section is active
  useEffect(() => {
    if (activeSection === 'support') {
      loadSupportData();
    }
  }, [activeSection]);

  // Reload support tickets when filters change
  useEffect(() => {
    if (activeSection === 'support' && !supportLoading) {
      loadSupportTickets();
    }
  }, [selectedPriority, selectedStatus, selectedCategory, searchQuery]);

  const loadSupportData = async () => {
    try {
      setSupportLoading(true);
      const [metricsData, ticketsData, faqsData] = await Promise.all([
        getSupportMetrics(),
        getTickets(),
        getFAQs()
      ]);

      setSupportMetrics(metricsData);
      setSupportTickets(ticketsData);
      setSupportFaqs(faqsData);
    } catch (err) {
      console.error('Error loading support dashboard:', err);
    } finally {
      setSupportLoading(false);
    }
  };

  const loadSupportTickets = async () => {
    try {
      const filters: TicketFilters = {
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        searchQuery: searchQuery || undefined
      };

      const ticketsData = await getTickets(filters);
      setSupportTickets(ticketsData);
    } catch (err) {
      console.error('Error loading tickets:', err);
    }
  };

  const handleSupportTicketStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    setProcessingTicket(ticketId);
    try {
      const result = await updateTicketStatus(ticketId, newStatus);
      if (result.success) {
        await loadSupportTickets();
        alert(result.message);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
      alert('Failed to update ticket status');
    } finally {
      setProcessingTicket(null);
    }
  };

  const getSupportPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSupportStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSupportDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const systemStatsCards = [
    { title: 'Total Users', value: stats?.totalUsers.toLocaleString() || '0', change: '+12%', trend: 'up', icon: Users, color: 'orange' },
    { title: 'Active Today', value: Math.floor((stats?.totalUsers || 0) * 0.71).toString(), change: '+8%', trend: 'up', icon: TrendingUp, color: 'green' },
    { title: 'Active Courses', value: stats?.activeCourses.toString() || '0', change: '+5%', trend: 'up', icon: DollarSign, color: 'blue' },
    { title: 'Pending', value: pendingApprovals.length.toString(), change: '-5%', trend: 'down', icon: Clock, color: 'purple' }
  ];

  const handleApproval = async (approval: PendingApproval, action: 'approve' | 'reject') => {
    setProcessingApproval(approval.id);
    try {
      const result = await handleApprovalAction(approval.id, approval.type, action);
      if (result.success) {
        // Refresh approvals list
        const updatedApprovals = await getPendingApprovals();
        setPendingApprovals(updatedApprovals);
      }
    } catch (error) {
      console.error('Error processing approval:', error);
    } finally {
      setProcessingApproval(null);
    }
  };

  // NEW: Approvals Section
  const renderApprovalsSection = () => {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Approval Management</h1>
              <p className="text-orange-100 text-lg">Review and process pending approvals</p>
            </div>
            <Bell className="w-16 h-16 text-orange-200" />
          </div>
        </div>

        {/* Pending Approvals List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Pending Approvals</h2>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold border border-orange-200">
              {pendingApprovals.length} items
            </span>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-500 font-medium">All caught up! No pending approvals.</p>
                </div>
              ) : (
                pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-5 border-2 border-gray-100 rounded-xl hover:shadow-md hover:border-orange-200 transition-all duration-200">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border-2 border-orange-200 flex-shrink-0">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">{approval.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{approval.details}</p>
                        <p className="text-xs text-gray-500">{approval.submitted}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        approval.priority === 'High' ? 'bg-red-50 text-red-800 border-red-200' :
                        approval.priority === 'Medium' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-green-50 text-green-800 border-green-200'
                      }`}>
                        {approval.priority}
                      </span>
                      {processingApproval === approval.id ? (
                        <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                      ) : (
                        <>
                          <button 
                            onClick={() => handleApproval(approval, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleApproval(approval, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // NEW: Settings Section
  const renderSettingsSection = () => {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
              <p className="text-blue-100 text-lg">Configure system settings and preferences</p>
            </div>
            <SettingsIcon className="w-16 h-16 text-blue-200" />
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-600">Enable system maintenance mode</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-blue-500 rounded" />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">Auto-Approve Content</p>
                <p className="text-sm text-gray-600">Automatically approve new content submissions</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-blue-500 rounded" />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Send email notifications for important events</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-500 rounded" />
            </div>
          </div>
        </div>

        {/* User Management Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Upload Size (MB)</label>
              <input 
                type="number" 
                defaultValue="100" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input 
                type="number" 
                defaultValue="30" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default User Role</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm">
          Save All Settings
        </button>
      </div>
    );
  };

  // NEW: Support Section
  const renderSupportSection = () => {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Support Dashboard</h1>
              <p className="text-purple-100 mb-6 text-lg">Manage customer inquiries and provide assistance</p>
              {supportLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading support data...</span>
                </div>
              ) : (
                <div className="flex items-center flex-wrap gap-6">
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-semibold">{supportMetrics?.totalTickets || 0} Total Tickets</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">{supportMetrics?.openTickets || 0} Open</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">{supportMetrics?.resolvedToday || 0} Resolved Today</span>
                  </div>
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Headphones className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {supportLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{supportMetrics?.totalTickets || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900">{supportMetrics?.openTickets || 0}</p>
                  <p className="text-sm text-orange-600">Needs attention</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                  <p className="text-3xl font-bold text-gray-900">{supportMetrics?.resolvedToday || 0}</p>
                  <p className="text-sm text-green-600">Great job!</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-3xl font-bold text-gray-900">{supportMetrics?.avgResponseTime || '0h'}</p>
                  <p className="text-sm text-blue-600">Under target</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-3xl font-bold text-gray-900">{supportMetrics?.satisfaction?.toFixed(1) || '0.0'}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★★★★★</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'tickets', label: 'All Tickets', icon: MessageSquare },
                { id: 'knowledge', label: 'Knowledge Base', icon: CheckCircle },
                { id: 'analytics', label: 'Analytics', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSupportActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      supportActiveTab === tab.id
                        ? 'border-purple-500 text-purple-600' :'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {supportActiveTab === 'tickets' && (
              <div>
                {/* Filters */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ticket Management</h3>
                  <div className="flex items-center space-x-4 flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="account">Account</option>
                      <option value="learning">Learning</option>
                      <option value="payments">Payments</option>
                      <option value="technical">Technical</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                {/* Tickets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Ticket ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            No tickets found
                          </td>
                        </tr>
                      ) : (
                        supportTickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <span className="font-mono text-sm text-blue-600">
                                {ticket.id.substring(0, 8)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{ticket.title}</p>
                                <p className="text-sm text-gray-500">{ticket.category}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{ticket.user}</p>
                                  <p className="text-sm text-gray-500">{ticket.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSupportPriorityColor(ticket.priority)}`}>
                                {ticket.priority.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSupportStatusColor(ticket.status)}`}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <p className="text-gray-900">{formatSupportDate(ticket.createdAt)}</p>
                                <p className="text-gray-500">Updated: {formatSupportDate(ticket.updatedAt)}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                {processingTicket === ticket.id ? (
                                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                                ) : (
                                  <select
                                    value={ticket.status}
                                    onChange={(e) => handleSupportTicketStatusChange(ticket.id, e.target.value as Ticket['status'])}
                                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                  >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {supportActiveTab === 'knowledge' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {supportFaqs.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No FAQs available</p>
                  ) : (
                    supportFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                            <p className="text-gray-600 text-sm mb-3">{faq.answer}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{faq.category}</span>
                              <span>👁 {faq.viewCount} views</span>
                              <span>👍 {faq.helpfulCount} helpful</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {supportActiveTab === 'analytics' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-600 mb-4">
                  Advanced analytics features are being developed.
                </p>
                <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                  Coming Soon
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // NEW: User Management Section
  const renderUserManagementSection = () => {
    // Mock user data - replace with actual API call
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', joinedDate: '2025-01-15', courses: 5 },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'teacher', status: 'active', joinedDate: '2025-02-20', courses: 12 },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'student', status: 'suspended', joinedDate: '2024-12-10', courses: 2 }
    ];

    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-blue-100 text-lg">Manage users, roles, and permissions</p>
            </div>
            <Users className="w-16 h-16 text-blue-200" />
          </div>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalTeachers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-3xl font-bold text-gray-900">{Math.floor((stats?.totalUsers || 0) * 0.71)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Courses</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                      {user.courses}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Analytics Section
  const renderAnalyticsSection = () => {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-indigo-100 text-lg">Platform metrics and performance insights</p>
            </div>
            <BarChart3 className="w-16 h-16 text-indigo-200" />
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          {['24h', '7days', '30days', '90days'].map((range) => (
            <button
              key={range}
              onClick={() => setAnalyticsTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                analyticsTimeRange === range
                  ? 'bg-indigo-500 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' :
               range === '7days' ? 'Last 7 Days' :
               range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Analytics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">$45,231</p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last period</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">1,284</p>
                <p className="text-sm text-green-600 mt-1">+8.2% from last period</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
                <p className="text-3xl font-bold text-gray-900">42m</p>
                <p className="text-sm text-orange-600 mt-1">-2.1% from last period</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Uploads</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalContentUploads || 0}</p>
                <p className="text-sm text-green-600 mt-1">+15.3% from last period</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>

          {/* Course Performance Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>

          {/* Engagement Metrics Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Content Management Section
  const renderContentManagementSection = () => {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Content Management</h1>
              <p className="text-teal-100 text-lg">Manage courses, resources, and learning materials</p>
            </div>
            <FileText className="w-16 h-16 text-teal-200" />
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeCourses || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Uploads</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalContentUploads || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published Today</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Management Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-teal-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Content Management Hub
            </h3>
            <p className="text-gray-600 mb-4">
              Navigate to the dedicated Content Management page for full content control
            </p>
            <button 
              onClick={() => window.location.href = '/content-management-hub'}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 font-medium"
            >
              Open Content Management Hub
            </button>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Security & Compliance Section
  const renderSecurityComplianceSection = () => {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Security & Compliance</h1>
              <p className="text-red-100 text-lg">Data protection, access control, and compliance monitoring</p>
            </div>
            <Shield className="w-16 h-16 text-red-200" />
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-sm text-orange-600">Needs review</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-1">Last active: 2 minutes ago</p>
              <p className="mb-1">Location: 192.168.1.100</p>
              <p className="mb-1">Device: Windows 11</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Access</p>
                <p className="text-3xl font-bold text-gray-900">42</p>
                <p className="text-sm text-green-600">Within limits</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-1">Compliance: GDPR, CCPA, HIPAA</p>
              <p className="mb-1">Last audit: 3 days ago</p>
              <p className="mb-1">Status: All systems compliant</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-green-600">No incidents</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-1">Last scan: 1 hour ago</p>
              <p className="mb-1">Vulnerabilities: 0 critical</p>
              <p className="mb-1">Patch level: 100%</p>
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Controls</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">Multi-Factor Authentication</p>
                <p className="text-sm text-gray-600">Enabled for all users</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-500 rounded" />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">Data Encryption</p>
                <p className="text-sm text-gray-600">AES-256 encryption in transit and at rest</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-500 rounded" />
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-600">30 minutes inactive</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-500 rounded" />
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">GDPR Compliance</span>
              </div>
              <p className="text-sm text-green-700">All data processing activities documented and compliant</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">CCPA Compliance</span>
              </div>
              <p className="text-sm text-green-700">User data access and processing transparent</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">HIPAA Compliance</span>
              </div>
              <p className="text-sm text-yellow-700">HIPAA data handling requires additional review</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Data Retention</span>
              </div>
              <p className="text-sm text-blue-700">Retention policy in place for 7 years</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 p-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
          {/* Add Security & Compliance Tab */}
          <button
            onClick={() => onSectionChange('security')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
              activeSection === 'security' ?'bg-orange-500 text-white shadow-md' :'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Security & Compliance</span>
          </button>
        </div>
      </div>

      {/* Render content based on active section */}
      {activeSection === 'dashboard' && (
        <>
          {/* Welcome header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-orange-100">System Overview & Management</p>
              </div>
              <Shield className="h-16 w-16 text-orange-200" />
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Students</span>
                <span className="font-bold text-gray-900 text-lg">{stats?.totalStudents || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Teachers</span>
                <span className="font-bold text-gray-900 text-lg">{stats?.totalTeachers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Admins</span>
                <span className="font-bold text-gray-900 text-lg">{stats?.totalAdmins || 0}</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {systemStatsCards.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                orange: 'bg-orange-50 text-orange-600 border-orange-200',
                green: 'bg-green-50 text-green-600 border-green-200', 
                blue: 'bg-blue-50 text-blue-600 border-blue-200',
                purple: 'bg-purple-50 text-purple-600 border-purple-200'
              };
              
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]} border-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-base font-semibold px-3 py-1 rounded-lg ${
                      stat.trend === 'up' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Three column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System alerts */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">System Alerts</h2>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {systemAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p className="text-gray-500">No system alerts</p>
                      </div>
                    ) : (
                      systemAlerts.map((alert) => (
                        <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
                          alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                          alert.type === 'error' ? 'bg-red-50 border-red-500' :
                          alert.type === 'info'? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'
                        }`}>
                          <div className="flex items-start space-x-3">
                            {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />}
                            {alert.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />}
                            {alert.type === 'info' && <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
                            {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pending approvals */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
                  <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold border border-orange-200">
                    {pendingApprovals.length} items
                  </span>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p className="text-gray-500 font-medium">All caught up! No pending approvals.</p>
                      </div>
                    ) : (
                      pendingApprovals.map((approval) => (
                        <div key={approval.id} className="flex items-center justify-between p-5 border-2 border-gray-100 rounded-xl hover:shadow-md hover:border-orange-200 transition-all duration-200">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border-2 border-orange-200 flex-shrink-0">
                              <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1">{approval.name}</h3>
                              <p className="text-sm text-gray-600 mb-1">{approval.details}</p>
                              <p className="text-xs text-gray-500">{approval.submitted}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                              approval.priority === 'High' ? 'bg-red-50 text-red-800 border-red-200' :
                              approval.priority === 'Medium'? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-green-50 text-green-800 border-green-200'
                            }`}>
                              {approval.priority}
                            </span>
                            {processingApproval === approval.id ? (
                              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleApproval(approval, 'approve')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleApproval(approval, 'reject')}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'approvals' && renderApprovalsSection()}
      {activeSection === 'settings' && renderSettingsSection()}
      {activeSection === 'support' && renderSupportSection()}
      {activeSection === 'users' && renderUserManagementSection()}
      {activeSection === 'analytics' && renderAnalyticsSection()}
      {activeSection === 'content' && renderContentManagementSection()}
      {activeSection === 'security' && <SecurityComplianceTab />}
    </div>
  );
}