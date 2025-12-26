import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Edit,
  Trash2,
  Filter,
  Search,
  Globe,
  BookOpen,
  Video,
  Music,
  Gamepad2,
  Book,
  GraduationCap,
  BarChart3,
  Users,
  TrendingUp } from
'lucide-react';
import Icon from '../../components/AppIcon';

interface ContentItem {
  id: string;
  title: string;
  language: string;
  contentType: 'books' | 'courses' | 'videos' | 'music' | 'games' | 'stories' | 'exercises' | 'audiobooks';
  format: string;
  uploadDate: Date;
  pointRequirement: number;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'under-review';
  fileSize: string;
  uploadedBy: string;
  description: string;
  thumbnailUrl: string;
  viewCount: number;
  downloadCount: number;
  tags: string[];
}

interface ContentStats {
  totalContent: number;
  pendingApproval: number;
  approvedContent: number;
  rejectedContent: number;
  totalViews: number;
  totalDownloads: number;
}

const ContentManagerDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock content data
  const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Amharic Alphabet Learning Course',
    language: 'Amharic',
    contentType: 'courses',
    format: 'MP4',
    uploadDate: new Date('2024-01-15'),
    pointRequirement: 50,
    approvalStatus: 'approved',
    fileSize: '125 MB',
    uploadedBy: 'Dr. Alemayehu Teshome',
    description: 'Comprehensive Amharic alphabet learning course designed for beginners.',
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1549ec54b-1765075254090.png",
    viewCount: 1247,
    downloadCount: 892,
    tags: ['beginner', 'alphabet', 'pronunciation', 'writing']
  },
  {
    id: '2',
    title: 'Traditional Ethiopian Stories Collection',
    language: 'Tigrinya',
    contentType: 'stories',
    format: 'PDF',
    uploadDate: new Date('2024-01-12'),
    pointRequirement: 30,
    approvalStatus: 'pending',
    fileSize: '45 MB',
    uploadedBy: 'Prof. Meron Haile',
    description: 'A curated collection of traditional Ethiopian folktales and stories.',
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_158c9c539-1765698808674.png",
    viewCount: 634,
    downloadCount: 423,
    tags: ['culture', 'folklore', 'reading', 'intermediate']
  },
  {
    id: '3',
    title: 'Oromifa Grammar Exercises',
    language: 'Oromifa',
    contentType: 'exercises',
    format: 'DOCX',
    uploadDate: new Date('2024-01-10'),
    pointRequirement: 40,
    approvalStatus: 'under-review',
    fileSize: '12 MB',
    uploadedBy: 'Ato Bekele Negash',
    description: 'Interactive grammar exercises for intermediate Oromifa learners.',
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1d7294db8-1764910761384.png",
    viewCount: 892,
    downloadCount: 567,
    tags: ['grammar', 'exercises', 'intermediate', 'practice']
  },
  {
    id: '4',
    title: 'Ethiopian Music and Language',
    language: 'Amharic',
    contentType: 'music',
    format: 'MP3',
    uploadDate: new Date('2024-01-08'),
    pointRequirement: 25,
    approvalStatus: 'approved',
    fileSize: '78 MB',
    uploadedBy: 'Artist Aster Aweke',
    description: 'Traditional Ethiopian songs with lyrics in Amharic.',
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb04e829-1765639163676.png",
    viewCount: 2156,
    downloadCount: 1834,
    tags: ['music', 'culture', 'pronunciation', 'entertainment']
  },
  {
    id: '5',
    title: 'Business Amharic Conversations',
    language: 'Amharic',
    contentType: 'audiobooks',
    format: 'MP3',
    uploadDate: new Date('2024-01-05'),
    pointRequirement: 60,
    approvalStatus: 'rejected',
    fileSize: '156 MB',
    uploadedBy: 'Dr. Yohannes Mehari',
    description: 'Professional Amharic conversation guide for business contexts.',
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_12dc37c0a-1765218518166.png",
    viewCount: 445,
    downloadCount: 234,
    tags: ['business', 'professional', 'conversations', 'advanced']
  }];


  const mockStats: ContentStats = {
    totalContent: 1247,
    pendingApproval: 23,
    approvedContent: 1156,
    rejectedContent: 68,
    totalViews: 45678,
    totalDownloads: 23456
  };

  const languages = [
  'all', 'Amharic', 'Oromifa', 'Tigrinya', 'Somali', 'Afar', 'Sidama', 'Gurage', 'Wolaytta', 'Hadiya', 'Gamo'];


  const contentTypes = [
  'all', 'books', 'courses', 'videos', 'music', 'games', 'stories', 'exercises', 'audiobooks'];


  const statusOptions = [
  'all', 'pending', 'approved', 'rejected', 'under-review'];


  // Filter content
  const filteredContent = mockContent.filter((item) => {
    const matchesSearch = searchQuery === '' ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage = selectedLanguage === 'all' || item.language === selectedLanguage;
    const matchesType = selectedContentType === 'all' || item.contentType === selectedContentType;
    const matchesStatus = selectedStatus === 'all' || item.approvalStatus === selectedStatus;

    return matchesSearch && matchesLanguage && matchesType && matchesStatus;
  });

  const getContentIcon = (type: string) => {
    const iconMap = {
      books: Book,
      courses: GraduationCap,
      videos: Video,
      music: Music,
      games: Gamepad2,
      stories: BookOpen,
      exercises: FileText,
      audiobooks: Music
    };
    return iconMap[type as keyof typeof iconMap] || FileText;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'under-review': 'bg-blue-100 text-blue-800'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const handleApprove = (id: string) => {
    console.log('Approving content:', id);
    // In real app, make API call
  };

  const handleReject = (id: string) => {
    console.log('Rejecting content:', id);
    // In real app, make API call
  };

  const handleDelete = (id: string) => {
    console.log('Deleting content:', id);
    // In real app, make API call
  };

  return (
    <>
      <Helmet>
        <title>Content Manager Dashboard - LiqLearns</title>
        <meta name="description" content="Specialized oversight for educational content creation, approval workflows, and multi-language material management" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-orange-600 to-orange-700 text-white z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-60'}`
        }>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-orange-500">
              {!sidebarCollapsed &&
              <div>
                  <h1 className="text-xl font-bold">LiqLearns</h1>
                  <p className="text-orange-200 text-sm">Content Hub</p>
                </div>
              }
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-orange-500 rounded-lg transition-colors">

                <FileText className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {[
              { icon: BarChart3, label: 'Overview', active: true },
              { icon: Upload, label: 'Upload Center' },
              { icon: Clock, label: 'Approval Queue' },
              { icon: Globe, label: 'Language Management' },
              { icon: CheckCircle, label: 'Quality Control' },
              { icon: TrendingUp, label: 'Analytics' }].
              map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-orange-500 group ${
                    item.active ? 'bg-orange-500 shadow-lg' : ''}`
                    }>

                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed &&
                    <span className="font-medium">{item.label}</span>
                    }
                    {sidebarCollapsed &&
                    <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    }
                  </button>);

              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-orange-500">
              {!sidebarCollapsed ?
              <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Content Manager</p>
                    <p className="text-orange-200 text-sm">Administrator</p>
                  </div>
                </div> :

              <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5" />
                </div>
              }
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-orange-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management Hub</h1>
                <p className="text-gray-600">Educational content oversight for 80+ Ethiopian tribal languages</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">

                <Upload className="w-4 h-4" />
                <span>Upload Content</span>
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{mockStats.totalContent}</p>
                    <p className="text-sm text-gray-600">Total Content</p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{mockStats.pendingApproval}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{mockStats.approvedContent}</p>
                    <p className="text-sm text-gray-600">Approved</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{mockStats.rejectedContent}</p>
                    <p className="text-sm text-gray-600">Rejected</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{mockStats.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Views</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{mockStats.totalDownloads.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Downloads</p>
                  </div>
                  <Download className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />

                  </div>
                </div>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">

                  {languages.map((lang) =>
                  <option key={lang} value={lang}>
                      {lang === 'all' ? 'All Languages' : lang}
                    </option>
                  )}
                </select>

                <select
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">

                  {contentTypes.map((type) =>
                  <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  )}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">

                  {statusOptions.map((status) =>
                  <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredContent.map((item) => {
                const ContentIcon = getContentIcon(item.contentType);
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover" />

                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.approvalStatus)}`}>
                          {item.approvalStatus}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center space-x-2">
                          <ContentIcon className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-900">{item.contentType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.language} • {item.format} • {item.fileSize}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{item.uploadedBy}</span>
                        <span>{item.uploadDate.toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.viewCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{item.downloadCount}</span>
                          </span>
                        </div>
                        <span className="font-medium">{item.pointRequirement} pts</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag, index) =>
                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {tag}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {item.approvalStatus === 'pending' &&
                        <>
                            <button
                            onClick={() => handleApprove(item.id)}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">

                              Approve
                            </button>
                            <button
                            onClick={() => handleReject(item.id)}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">

                              Reject
                            </button>
                          </>
                        }
                        
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">

                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>);

              })}
            </div>

            {filteredContent.length === 0 &&
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </>);

};

export default ContentManagerDashboard;