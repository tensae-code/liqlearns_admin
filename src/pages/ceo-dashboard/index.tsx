import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Globe, 
  BarChart3, 
  Target,
  Crown,
  PieChart,
  Activity,
  Award
} from 'lucide-react';
import Icon from '../../components/AppIcon';


const CEODashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 2450000,
    activeUsers: 15432,
    marketGrowth: 24.5,
    globalReach: 67
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 1000),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10),
        marketGrowth: Math.max(0, prev.marketGrowth + (Math.random() - 0.5) * 0.5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const executiveMetrics = [
    {
      title: 'Total Revenue',
      value: `$${(metrics.totalRevenue / 1000).toFixed(0)}K`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      change: '+8.2%',
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Market Growth',
      value: `${metrics.marketGrowth.toFixed(1)}%`,
      change: '+3.1%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: 'up'
    },
    {
      title: 'Global Reach',
      value: `${metrics.globalReach} Countries`,
      change: '+5 new',
      icon: Globe,
      color: 'bg-purple-500',
      trend: 'up'
    }
  ];

  const strategicInitiatives = [
    {
      title: 'Ethiopian Market Expansion',
      progress: 78,
      status: 'On Track',
      priority: 'High'
    },
    {
      title: 'AI Learning Integration',
      progress: 65,
      status: 'In Progress',
      priority: 'High'
    },
    {
      title: 'MLM Network Optimization',
      progress: 45,
      status: 'Planning',
      priority: 'Medium'
    },
    {
      title: 'Mobile App Enhancement',
      progress: 89,
      status: 'Near Completion',
      priority: 'High'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Crown className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Executive Dashboard</h1>
            </div>
            <p className="text-orange-100 text-lg">
              Strategic oversight and business intelligence for LiqLearns platform
            </p>
          </div>
          <div className="text-right">
            <p className="text-orange-100">Last Updated</p>
            <p className="text-xl font-semibold">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {executiveMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {metric.change}
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-gray-600 text-sm">{metric.title}</p>
              </div>
              
              {/* Real-time indicator */}
              <div className="mt-4 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-gray-500">Live Data</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategic Initiatives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strategic Projects */}
        <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 text-orange-600 mr-2" />
              Strategic Initiatives
            </h2>
          </div>
          
          <div className="space-y-4">
            {strategicInitiatives.map((initiative, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">{initiative.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    initiative.priority === 'High' ?'bg-red-100 text-red-800' :'bg-yellow-100 text-yellow-800'
                  }`}>
                    {initiative.priority}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{initiative.status}</span>
                    <span>{initiative.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${initiative.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Analytics */}
        <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 text-orange-600 mr-2" />
              Market Analytics
            </h2>
          </div>
          
          <div className="space-y-6">
            {/* Growth Metrics */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Revenue Growth</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">$2.45M</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +24.5% from last month
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* User Engagement */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">User Engagement</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">89%</p>
                  <p className="text-xs text-gray-600">Active Rate</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">92%</p>
                  <p className="text-xs text-gray-600">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Key Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Course Completion</span>
                  <span className="text-sm font-medium text-gray-900">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MLM Conversion</span>
                  <span className="text-sm font-medium text-gray-900">12.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Platform Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Reports */}
      <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Award className="w-5 h-5 text-orange-600 mr-2" />
            Executive Reports
          </h2>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Generate Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <PieChart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Monthly Report</h3>
            <p className="text-sm text-gray-600">Comprehensive monthly business analysis</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Performance Metrics</h3>
            <p className="text-sm text-gray-600">Key performance indicators tracking</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Growth Analysis</h3>
            <p className="text-sm text-gray-600">Market expansion and growth trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;