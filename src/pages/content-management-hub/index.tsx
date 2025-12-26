import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import UserProfileIndicator from '../../components/ui/UserProfileIndicator';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NotificationCenter from '../../components/ui/NotificationCenter';
import ContentUploadZone from './components/ContentUploadZone';
import ContentLibraryTable from './components/ContentLibraryTable';
import ContentFilters from './components/ContentFilters';
import BulkOperations from './components/BulkOperations';
import ContentPreviewModal from './components/ContentPreviewModal';
import ContentStats from './components/ContentStats';
import Button from '../../components/ui/Button';

import { ContentItem, UploadZoneConfig, FilterOptions, BulkOperation, UploadProgress, ContentStats as ContentStatsType, ApprovalStatus } from './types';

const ContentManagementHub = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    language: 'all',
    contentType: 'all',
    approvalStatus: 'all',
    searchQuery: ''
  });
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadZones, setShowUploadZones] = useState(true);

  // Mock data
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
    description: `Comprehensive Amharic alphabet learning course designed for beginners. This interactive course covers all 33 basic characters of the Amharic script with pronunciation guides, writing exercises, and cultural context.\n\nThe course includes audio pronunciations by native speakers, visual memory aids, and progressive exercises to help learners master the Ethiopian script effectively.`,
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_158c9c539-1765698808674.png",
    fileUrl: '/content/amharic-alphabet-course.mp4',
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
    description: `A curated collection of traditional Ethiopian folktales and stories translated into Tigrinya. These stories preserve cultural heritage while providing engaging reading material for language learners.\n\nEach story includes cultural notes, vocabulary explanations, and comprehension questions to enhance the learning experience.`,
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_158c9c539-1765698808674.png",
    fileUrl: '/content/tigrinya-stories.pdf',
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
    description: `Interactive grammar exercises for intermediate Oromifa learners. Covers verb conjugations, noun declensions, and sentence structure with detailed explanations and examples.\n\nIncludes answer keys and progress tracking to help learners monitor their improvement in Oromifa grammar mastery.`,
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_141d82cc4-1765709289183.png",
    fileUrl: '/content/oromifa-grammar.docx',
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
    description: `Traditional Ethiopian songs with lyrics in Amharic, designed to help learners improve pronunciation and cultural understanding through music.\n\nIncludes lyric sheets, cultural context explanations, and pronunciation guides for each song.`,
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_158c9c539-1765698808674.png",
    fileUrl: '/content/ethiopian-music.mp3',
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
    description: `Professional Amharic conversation guide for business contexts. Covers formal greetings, business negotiations, presentations, and professional correspondence in Ethiopian business culture.\n\nFeatures native speaker dialogues, cultural etiquette tips, and practical vocabulary for professional settings.`,
    thumbnailUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_11408f658-1764657846652.png",
    fileUrl: '/content/business-amharic.mp3',
    viewCount: 445,
    downloadCount: 234,
    tags: ['business', 'professional', 'conversations', 'advanced']
  }];


  const uploadZoneConfigs: UploadZoneConfig[] = [
  {
    type: 'books',
    title: 'Books',
    icon: 'Book',
    acceptedFormats: ['pdf', 'epub', 'docx'],
    maxFileSize: '50 MB',
    description: 'Upload educational books and textbooks',
    color: 'bg-blue-500'
  },
  {
    type: 'courses',
    title: 'Courses',
    icon: 'GraduationCap',
    acceptedFormats: ['mp4', 'avi', 'mov', 'pdf'],
    maxFileSize: '500 MB',
    description: 'Upload structured learning courses',
    color: 'bg-green-500'
  },
  {
    type: 'videos',
    title: 'Videos',
    icon: 'Video',
    acceptedFormats: ['mp4', 'avi', 'mov', 'webm'],
    maxFileSize: '200 MB',
    description: 'Upload educational videos',
    color: 'bg-red-500'
  },
  {
    type: 'music',
    title: 'Music',
    icon: 'Music',
    acceptedFormats: ['mp3', 'wav', 'aac'],
    maxFileSize: '100 MB',
    description: 'Upload music and audio content',
    color: 'bg-purple-500'
  },
  {
    type: 'games',
    title: 'Games',
    icon: 'Gamepad2',
    acceptedFormats: ['zip', 'apk', 'exe'],
    maxFileSize: '300 MB',
    description: 'Upload educational games',
    color: 'bg-orange-500'
  },
  {
    type: 'stories',
    title: 'Stories',
    icon: 'BookOpen',
    acceptedFormats: ['pdf', 'epub', 'txt'],
    maxFileSize: '25 MB',
    description: 'Upload stories and literature',
    color: 'bg-teal-500'
  }];


  const mockStats: ContentStatsType = {
    totalContent: 1247,
    pendingApproval: 23,
    approvedContent: 1156,
    rejectedContent: 68,
    totalViews: 45678,
    totalDownloads: 23456
  };

  // Add breadcrumb items - Add this block
  const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Content Management', href: '/admin/content' }];


  // Add notification handlers - Add this block
  const handleNotificationClick = (notificationId: string) => {
    console.log('Notification clicked:', notificationId);
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Mark as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
  };

  // Add user profile handlers - Add this block
  const handleLogout = () => {
    console.log('Logging out');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  // Filter content based on current filters
  const filteredContent = mockContent.filter((item) => {
    const matchesLanguage = filters.language === 'all' || item.language.toLowerCase().includes(filters.language.toLowerCase());
    const matchesType = filters.contentType === 'all' || item.contentType === filters.contentType;
    const matchesStatus = filters.approvalStatus === 'all' || item.approvalStatus === filters.approvalStatus;
    const matchesSearch = filters.searchQuery === '' ||
    item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
    item.tags.some((tag) => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));

    return matchesLanguage && matchesType && matchesStatus && matchesSearch;
  });

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFileUpload = (files: FileList, type: string) => {
    Array.from(files).forEach((file, index) => {
      const fileId = `${Date.now()}-${index}`;
      const newUpload: UploadProgress = {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      };

      setUploadProgress((prev) => [...prev, newUpload]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) =>
        prev.map((upload) => {
          if (upload.fileId === fileId) {
            const newProgress = Math.min(upload.progress + Math.random() * 20, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...upload, progress: 100, status: 'completed' };
            }
            return { ...upload, progress: Math.floor(newProgress) };
          }
          return upload;
        })
        );
      }, 500);
    });
  };

  const handleItemSelect = (id: string) => {
    setSelectedItems((prev) =>
    prev.includes(id) ?
    prev.filter((item) => item !== id) :
    [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedItems(selected ? filteredContent.map((item) => item.id) : []);
  };

  const handleStatusChange = (id: string, status: ApprovalStatus) => {
    console.log(`Changing status of ${id} to ${status}`);
    // In a real app, this would make an API call
  };

  const handlePointsChange = (id: string, points: number) => {
    console.log(`Changing points of ${id} to ${points}`);
    // In a real app, this would make an API call
  };

  const handlePreview = (item: ContentItem) => {
    setPreviewContent(item);
    setShowPreview(true);
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting content ${id}`);
    // In a real app, this would make an API call
  };

  const handleBulkOperation = (operation: BulkOperation) => {
    console.log('Executing bulk operation:', operation);
    // In a real app, this would make an API call
    setSelectedItems([]);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      language: 'all',
      contentType: 'all',
      approvalStatus: 'all',
      searchQuery: ''
    });
  };

  const handleApprove = (id: string) => {
    handleStatusChange(id, 'approved');
    setShowPreview(false);
  };

  const handleReject = (id: string) => {
    handleStatusChange(id, 'rejected');
    setShowPreview(false);
  };

  return (
    <>
      <Helmet>
        <title>Content Management Hub - LiqLearns Admin</title>
        <meta name="description" content="Upload, organize, and control access to multi-format educational materials across 80+ Ethiopian tribal languages" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <NavigationSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle} />


        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BreadcrumbNavigation items={breadcrumbItems} />
              </div>
              
              <div className="flex items-center space-x-4">
                <NotificationCenter
                  onNotificationClick={handleNotificationClick}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead} />

                <UserProfileIndicator
                  userAvatar="/default-avatar.png"
                  onLogout={handleLogout}
                  onProfileClick={handleProfileClick} />

              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="font-heading font-bold text-2xl text-foreground">
                  Content Management Hub
                </h1>
                <p className="font-body text-muted-foreground mt-1">
                  Upload, organize, and control access to educational materials across Ethiopian languages
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadZones(!showUploadZones)}
                  iconName={showUploadZones ? 'EyeOff' : 'Eye'}
                  iconPosition="left">

                  {showUploadZones ? 'Hide' : 'Show'} Upload Zones
                </Button>
                
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left">

                  Quick Upload
                </Button>
              </div>
            </div>

            {/* Content Stats */}
            <ContentStats stats={mockStats} />

            {/* Upload Zones */}
            {showUploadZones &&
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-semibold text-lg text-foreground">
                    Upload Content
                  </h2>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadZones(false)}
                  iconName="ChevronUp"
                  iconSize={16}>

                    Collapse
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploadZoneConfigs.map((config) =>
                <ContentUploadZone
                  key={config.type}
                  config={config}
                  onFileUpload={handleFileUpload}
                  uploadProgress={uploadProgress} />

                )}
                </div>
              </div>
            }

            {/* Content Filters */}
            <ContentFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters} />


            {/* Bulk Operations */}
            <BulkOperations
              selectedCount={selectedItems.length}
              onBulkOperation={handleBulkOperation}
              onClearSelection={handleClearSelection} />


            {/* Content Library */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg text-foreground">
                  Content Library ({filteredContent.length} items)
                </h2>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Filter"
                    iconPosition="left">

                    Advanced Filters
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Download"
                    iconPosition="left">

                    Export
                  </Button>
                </div>
              </div>

              <ContentLibraryTable
                content={filteredContent}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onSelectAll={handleSelectAll}
                onStatusChange={handleStatusChange}
                onPointsChange={handlePointsChange}
                onPreview={handlePreview}
                onDelete={handleDelete} />

            </div>
          </main>
        </div>

        {/* Preview Modal */}
        <ContentPreviewModal
          content={previewContent}
          isVisible={showPreview}
          onClose={() => setShowPreview(false)}
          onApprove={handleApprove}
          onReject={handleReject} />

      </div>
    </>);

};

export default ContentManagementHub;