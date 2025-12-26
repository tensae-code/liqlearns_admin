import React, { useState, useEffect } from 'react';
import { Headphones, MessageSquare, Clock, CheckCircle, User, Star, FileText, Users as UsersIcon, Ticket, MessageCircle, BarChart3 } from 'lucide-react';
import Icon from '../../../components/AppIcon';

export interface SupportDashboardProps {
  activeSection?: string;
}

export default function SupportDashboard({ activeSection = 'tickets' }: SupportDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(activeSection);

  // Update active tab when activeSection prop changes
  useEffect(() => {
    setActiveTab(activeSection);
  }, [activeSection]);

  const supportStats = [
    { title: 'Open Tickets', value: '23', change: '-5%', trend: 'down', icon: MessageSquare, color: 'orange', openTickets: 23 },
    { title: 'Resolved Today', value: '47', change: '+12%', trend: 'up', icon: CheckCircle, color: 'green' },
    { title: 'Avg Response', value: '2.4h', change: '-15%', trend: 'down', icon: Clock, color: 'blue', avgResponseTime: 2.4 },
    { title: 'Satisfaction', value: '4.8/5', change: '+0.2', trend: 'up', icon: Star, color: 'purple', satisfaction: 4.8 }
  ];

  const activeTickets = [
    { 
      id: '#T001', 
      user: 'Alice Johnson', 
      issue: 'Login problems with premium account', 
      priority: 'High', 
      time: '15 mins ago',
      status: 'In Progress'
    },
    { 
      id: '#T002', 
      user: 'Bob Wilson', 
      issue: 'Course video not loading', 
      priority: 'Medium', 
      time: '45 mins ago',
      status: 'New'
    },
    { 
      id: '#T003', 
      user: 'Carol Smith', 
      issue: 'Payment refund request', 
      priority: 'High', 
      time: '1 hour ago',
      status: 'Awaiting Response'
    },
    { 
      id: '#T004', 
      user: 'David Brown', 
      issue: 'Certificate download issue', 
      priority: 'Low', 
      time: '2 hours ago',
      status: 'New'
    }
  ];

  const userSupportRequests = [
    { id: '1', user: 'Emma Davis', type: 'Account Issue', request: 'Need help with password recovery', status: 'Active', time: '30 mins ago' },
    { id: '2', user: 'Frank Miller', type: 'Billing Query', request: 'Question about subscription charges', status: 'Pending', time: '1 hour ago' },
    { id: '3', user: 'Grace Wilson', type: 'Technical', request: 'Course materials not accessible', status: 'Active', time: '2 hours ago' },
    { id: '4', user: 'Henry Brown', type: 'General', request: 'How to navigate the platform', status: 'Resolved', time: '3 hours ago' }
  ];

  const knowledgeBaseArticles = [
    { title: 'Password Recovery Guide', views: 1250, category: 'Account', lastUpdated: '2 days ago', helpfulness: 95 },
    { title: 'Payment Methods Setup', views: 890, category: 'Billing', lastUpdated: '5 days ago', helpfulness: 88 },
    { title: 'Course Access Troubleshooting', views: 745, category: 'Technical', lastUpdated: '1 week ago', helpfulness: 92 },
    { title: 'Certificate Generation', views: 620, category: 'Certificates', lastUpdated: '3 days ago', helpfulness: 85 },
    { title: 'Platform Navigation Tutorial', views: 510, category: 'Getting Started', lastUpdated: '1 day ago', helpfulness: 90 }
  ];

  const recentResolutions = [
    { user: 'Emma Davis', issue: 'Password reset assistance', resolvedBy: 'You', time: '30 mins ago', rating: 5 },
    { user: 'Frank Miller', issue: 'Billing inquiry', resolvedBy: 'Sarah T.', time: '1 hour ago', rating: 4 },
    { user: 'Grace Wilson', issue: 'Course access problem', resolvedBy: 'You', time: '2 hours ago', rating: 5 },
    { user: 'Henry Brown', issue: 'Technical support', resolvedBy: 'Mike J.', time: '3 hours ago', rating: 4 }
  ];

  const liveChatSessions = [
    { id: '1', user: 'John Smith', message: 'How do I reset my password?', status: 'Active', time: '2 mins ago', duration: '5:32' },
    { id: '2', user: 'Mary Johnson', message: 'Billing question about subscription', status: 'Active', time: '5 mins ago', duration: '3:45' },
    { id: '3', user: 'Bob Williams', message: 'Technical issue with video playback', status: 'Waiting', time: '8 mins ago', duration: '0:00' },
    { id: '4', user: 'Alice Brown', message: 'Certificate download problem', status: 'Typing', time: '12 mins ago', duration: '2:15' }
  ];

  const chatTemplates = [
    { id: '1', title: 'Password Reset', message: 'Hi! I can help you reset your password. Please click on "Forgot Password" on the login page...' },
    { id: '2', title: 'Billing Support', message: 'Thank you for contacting billing support. I\'ll be happy to help with your subscription inquiry...' },
    { id: '3', title: 'Technical Issue', message: 'I understand you\'re experiencing a technical issue. Let me help troubleshoot this for you...' },
    { id: '4', title: 'General Welcome', message: 'Welcome to our support chat! How can I assist you today?' }
  ];

  const supportReports = [
    { 
      title: 'Ticket Volume', 
      value: '1,234', 
      change: '+12%', 
      trend: 'up',
      description: 'Total tickets this month',
      icon: Ticket,
      color: 'blue'
    },
    { 
      title: 'Avg Resolution Time', 
      value: '4.2h', 
      change: '-15%', 
      trend: 'down',
      description: 'Average time to resolve',
      icon: Clock,
      color: 'green'
    },
    { 
      title: 'Customer Satisfaction', 
      value: '4.8/5', 
      change: '+0.3', 
      trend: 'up',
      description: 'Average rating this month',
      icon: Star,
      color: 'yellow'
    },
    { 
      title: 'First Response Time', 
      value: '1.2h', 
      change: '-8%', 
      trend: 'down',
      description: 'Average first response',
      icon: MessageCircle,
      color: 'purple'
    }
  ];

  const teamPerformance = [
    { agent: 'You', ticketsResolved: 87, avgRating: 4.9, responseTime: '1.5h', status: 'Top Performer' },
    { agent: 'Sarah Thompson', ticketsResolved: 72, avgRating: 4.7, responseTime: '2.1h', status: 'Active' },
    { agent: 'Mike Johnson', ticketsResolved: 65, avgRating: 4.6, responseTime: '2.4h', status: 'Active' },
    { agent: 'Emma Wilson', ticketsResolved: 58, avgRating: 4.8, responseTime: '1.9h', status: 'Active' }
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'tickets':
        return (
          <div className="space-y-6">
            {/* Active Support Tickets */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Active Support Tickets</h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {supportStats.openTickets} Open
                </span>
              </div>

              <div className="space-y-4">
                {activeTickets.map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        ticket.priority === 'High' ? 'bg-red-100' :
                        ticket.priority === 'Medium'? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <MessageSquare className={`w-5 h-5 ${
                          ticket.priority === 'High' ? 'text-red-600' :
                          ticket.priority === 'Medium'? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{ticket.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'New' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'In Progress'? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{ticket.user}</p>
                        <p className="text-sm text-gray-600">{ticket.issue}</p>
                        <p className="text-xs text-gray-500 mt-1">{ticket.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'Medium'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority}
                      </span>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                        Respond
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Resolved */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recently Resolved</h2>
                <button className="text-purple-600 hover:text-purple-700 font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {recentResolutions.map((resolution, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{resolution.user}</p>
                      <p className="text-sm text-gray-600">{resolution.issue}</p>
                      <p className="text-xs text-gray-500">Resolved by {resolution.resolvedBy} • {resolution.time}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-4 h-4 ${
                          i < resolution.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'live_chat':
        return (
          <div className="space-y-6">
            {/* Active Chat Sessions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Active Chat Sessions</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {liveChatSessions.filter(s => s.status === 'Active').length} active
                </span>
              </div>
              <div className="space-y-4">
                {liveChatSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.status === 'Active' ? 'bg-green-100' :
                        session.status === 'Typing'? 'bg-blue-100' : 'bg-yellow-100'
                      }`}>
                        <MessageCircle className={`w-5 h-5 ${
                          session.status === 'Active' ? 'text-green-600' :
                          session.status === 'Typing'? 'text-blue-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{session.user}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'Active' ? 'bg-green-100 text-green-800' :
                            session.status === 'Typing'? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{session.message}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-xs text-gray-500">{session.time}</p>
                          <p className="text-xs text-gray-500">Duration: {session.duration}</p>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                      {session.status === 'Waiting' ? 'Accept' : 'View Chat'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'knowledge_base':
        return (
          <div className="space-y-6">
            {/* Knowledge Base Articles */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Knowledge Base Articles</h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  New Article
                </button>
              </div>
              <div className="space-y-4">
                {knowledgeBaseArticles.map((article, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{article.title}</h3>
                          <p className="text-sm text-gray-600">Last updated: {article.lastUpdated}</p>
                        </div>
                      </div>
                      <span className="text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                        {article.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{article.views} views</span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{article.helpfulness}% helpful</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'user_assistance':
        return (
          <div className="space-y-6">
            {/* User Support Requests */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">User Support Requests</h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  New Request
                </button>
              </div>
              <div className="space-y-4">
                {userSupportRequests.map((request) => (
                  <div key={request.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{request.user}</h3>
                          <p className="text-sm text-gray-600">{request.type}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'Active' ? 'bg-green-100 text-green-800' :
                        request.status === 'Pending'? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{request.request}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{request.time}</p>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                        Assist User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            {/* Support Reports */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Support Reports</h2>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {supportReports.map((report, index) => {
                  const ReportIcon = report.icon;
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600',
                    green: 'bg-green-100 text-green-600',
                    yellow: 'bg-yellow-100 text-yellow-600',
                    purple: 'bg-purple-100 text-purple-600'
                  };
                  
                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[report.color as keyof typeof colorClasses]}`}>
                          <ReportIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-medium ${
                          report.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {report.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{report.value}</p>
                      <p className="text-sm font-medium text-gray-900">{report.title}</p>
                      <p className="text-xs text-gray-600">{report.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-white">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 sm:p-8 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Support Center 🎧</h1>
            <p className="text-purple-100">Helping users succeed, one ticket at a time</p>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{supportStats.openTickets}</div>
              <div className="text-sm text-purple-200">Open Tickets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{supportStats.avgResponseTime}h</div>
              <div className="text-sm text-purple-200">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{supportStats.satisfaction}/5</div>
              <div className="text-sm text-purple-200">Rating</div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <Headphones className="absolute bottom-4 right-4 h-32 w-32 text-purple-400 opacity-10" />
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {supportStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            orange: 'bg-orange-100 text-orange-600',
            green: 'bg-green-100 text-green-600',
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600'
          };
          
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-x-auto">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'tickets' ?'bg-purple-100 text-purple-700 shadow-sm' :'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            All Tickets
          </button>
          
          <button
            onClick={() => setActiveTab('live_chat')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'live_chat' ?'bg-purple-100 text-purple-700 shadow-sm' :'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Live Chat
          </button>

          <button
            onClick={() => setActiveTab('knowledge_base')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'knowledge_base' ?'bg-purple-100 text-purple-700 shadow-sm' :'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-5 w-5 mr-2" />
            Knowledge Base
          </button>

          <button
            onClick={() => setActiveTab('user_assistance')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'user_assistance' ?'bg-purple-100 text-purple-700 shadow-sm' :'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            User Assistance
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'reports' ?'bg-purple-100 text-purple-700 shadow-sm' :'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Reports
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="pb-8">
        {renderContent()}
      </div>
    </div>
  );
}