import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import UserProfileIndicator from '../../components/ui/UserProfileIndicator';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NotificationCenter from '../../components/ui/NotificationCenter';
import ProductApprovalQueue from './components/ProductApprovalQueue';
import StorefrontManagement from './components/StorefrontManagement';
import PriceModificationPanel from './components/PriceModificationPanel';
import SalesMetricsOverview from './components/SalesMetricsOverview';
import FilterControls from './components/FilterControls';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import {
  Product,
  Store,
  PriceModification,
  SalesMetrics,
  FilterOptions,
  BulkAction,
  UserLevel } from
'./types';

const StoreManagementSystem = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'stores' | 'pricing'>('overview');
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    sellerLevel: 'all',
    priceRange: { min: 0, max: 0 },
    status: 'all',
    dateRange: { start: null, end: null }
  });

  // Mock data
  const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Amharic Language Learning Book Set',
    description: 'Comprehensive collection of Amharic learning materials including grammar, vocabulary, and cultural context for beginners to advanced learners.',
    category: 'Educational Books',
    price: 850.00,
    proposedPrice: 750.00,
    images: ["https://images.unsplash.com/photo-1592503286362-34e28f5a5ff7"],
    imageAlts: ['Stack of colorful educational books on wooden table with reading glasses'],
    sellerId: 'seller1',
    sellerName: 'Alemayehu Tadesse',
    sellerLevel: 'Ambassador',
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    qualityScore: 8.5,
    complianceChecks: [
    { id: '1', name: 'Content Quality', status: 'passed', description: 'Educational content meets standards' },
    { id: '2', name: 'Cultural Sensitivity', status: 'passed', description: 'Culturally appropriate content' },
    { id: '3', name: 'Language Accuracy', status: 'pending', description: 'Native speaker review required' }]

  },
  {
    id: '2',
    name: 'Tigrinya Audio Course Collection',
    description: 'Professional audio lessons for Tigrinya language learning with native speaker pronunciation guides and interactive exercises.',
    category: 'Audio Courses',
    price: 1200.00,
    proposedPrice: 1200.00,
    images: ["https://images.unsplash.com/photo-1615458318132-1f151a3d18f4"],
    imageAlts: ['Professional recording studio setup with microphone and headphones for audio production'],
    sellerId: 'seller2',
    sellerName: 'Meron Gebremedhin',
    sellerLevel: 'Journeyman',
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'under_review',
    qualityScore: 9.2,
    complianceChecks: [
    { id: '4', name: 'Audio Quality', status: 'passed', description: 'Clear audio recording' },
    { id: '5', name: 'Content Accuracy', status: 'passed', description: 'Linguistically accurate' },
    { id: '6', name: 'Technical Standards', status: 'passed', description: 'Meets technical requirements' }]

  },
  {
    id: '3',
    name: 'Oromifa Cultural Stories Collection',
    description: 'Traditional Oromo stories and folktales with modern interpretations, perfect for cultural learning and language immersion.',
    category: 'Stories & Literature',
    price: 650.00,
    proposedPrice: 580.00,
    images: ["https://img.rocket.new/generatedImages/rocket_gen_img_1714b05d2-1764648938351.png"],
    imageAlts: ['Open storybook with colorful illustrations showing traditional African cultural scenes'],
    sellerId: 'seller3',
    sellerName: 'Bekele Worku',
    sellerLevel: 'Brand Ambassador',
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'approved',
    qualityScore: 7.8,
    complianceChecks: [
    { id: '7', name: 'Cultural Authenticity', status: 'passed', description: 'Authentic cultural content' },
    { id: '8', name: 'Educational Value', status: 'passed', description: 'High educational merit' },
    { id: '9', name: 'Age Appropriateness', status: 'passed', description: 'Suitable for all ages' }]

  }];


  const mockStores: Store[] = [
  {
    id: '1',
    ownerId: 'owner1',
    ownerName: 'Alemayehu Tadesse',
    ownerLevel: 'Ambassador',
    storeName: 'Ethiopian Language Hub',
    storeImage: "https://images.unsplash.com/photo-1590598615450-49a8e4aecfd4",
    storeImageAlt: 'Modern educational bookstore interior with shelves of language learning materials',
    isActive: true,
    totalProducts: 45,
    totalSales: 1250,
    monthlyRevenue: 125000.00,
    commissionRate: 15,
    createdDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    performanceRating: 4.8
  },
  {
    id: '2',
    ownerId: 'owner2',
    ownerName: 'Meron Gebremedhin',
    ownerLevel: 'Journeyman',
    storeName: 'Tigrinya Learning Center',
    storeImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1861e0419-1764648939630.png",
    storeImageAlt: 'Cozy learning space with traditional Ethiopian decorations and educational materials',
    isActive: true,
    totalProducts: 28,
    totalSales: 890,
    monthlyRevenue: 89000.00,
    commissionRate: 12,
    createdDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
    performanceRating: 4.5
  },
  {
    id: '3',
    ownerId: 'owner3',
    ownerName: 'Bekele Worku',
    ownerLevel: 'Brand Ambassador',
    storeName: 'Oromo Cultural Academy',
    storeImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1bc38c8a9-1764648941192.png",
    storeImageAlt: 'Traditional Ethiopian classroom setting with cultural artifacts and learning materials',
    isActive: false,
    totalProducts: 32,
    totalSales: 650,
    monthlyRevenue: 65000.00,
    commissionRate: 13,
    createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 48 * 60 * 60 * 1000),
    performanceRating: 4.2
  }];


  const mockPriceModifications: PriceModification[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Amharic Language Learning Book Set',
    originalPrice: 850.00,
    newPrice: 750.00,
    reason: 'Market competition analysis shows lower pricing needed to maintain competitiveness while ensuring quality education accessibility.',
    modifiedBy: 'Administrator',
    modifiedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    sellerNotified: true
  },
  {
    id: '2',
    productId: '3',
    productName: 'Oromifa Cultural Stories Collection',
    originalPrice: 650.00,
    newPrice: 580.00,
    reason: 'Promotional pricing to increase adoption of cultural learning materials and support community engagement.',
    modifiedBy: 'Administrator',
    modifiedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    sellerNotified: false
  }];


  const mockSalesMetrics: SalesMetrics = {
    totalSales: 2790,
    totalRevenue: 279000.00,
    totalCommissions: 36270.00,
    activeStores: 2,
    pendingApprovals: 1,
    topSellingProducts: [
    {
      id: '1',
      name: 'Amharic Language Learning Book Set',
      image: "https://images.unsplash.com/photo-1592503286362-34e28f5a5ff7",
      imageAlt: 'Stack of colorful educational books on wooden table with reading glasses',
      sales: 450,
      revenue: 337500.00
    },
    {
      id: '2',
      name: 'Tigrinya Audio Course Collection',
      image: "https://images.unsplash.com/photo-1615458318132-1f151a3d18f4",
      imageAlt: 'Professional recording studio setup with microphone and headphones for audio production',
      sales: 320,
      revenue: 384000.00
    },
    {
      id: '3',
      name: 'Oromifa Cultural Stories Collection',
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1714b05d2-1764648938351.png",
      imageAlt: 'Open storybook with colorful illustrations showing traditional African cultural scenes',
      sales: 280,
      revenue: 162400.00
    }],

    topPerformingStores: [
    {
      id: '1',
      name: 'Ethiopian Language Hub',
      owner: 'Alemayehu Tadesse',
      sales: 1250,
      revenue: 125000.00,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Tigrinya Learning Center',
      owner: 'Meron Gebremedhin',
      sales: 890,
      revenue: 89000.00,
      rating: 4.5
    },
    {
      id: '3',
      name: 'Oromo Cultural Academy',
      owner: 'Bekele Worku',
      sales: 650,
      revenue: 65000.00,
      rating: 4.2
    }]

  };

  const productCategories = [
  'Educational Books',
  'Audio Courses',
  'Video Lessons',
  'Stories & Literature',
  'Games & Activities',
  'Cultural Materials',
  'Assessment Tools'];


  // Filter products based on current filters
  const filteredProducts = mockProducts.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.sellerLevel !== 'all' && product.sellerLevel !== filters.sellerLevel) return false;
    if (filters.status !== 'all' && product.status !== filters.status) return false;
    if (filters.priceRange.min > 0 && product.proposedPrice < filters.priceRange.min) return false;
    if (filters.priceRange.max > 0 && product.proposedPrice > filters.priceRange.max) return false;
    if (filters.dateRange.start && product.submissionDate < filters.dateRange.start) return false;
    if (filters.dateRange.end && product.submissionDate > filters.dateRange.end) return false;
    return true;
  });

  // Event handlers
  const handleApproveProduct = (productId: string) => {
    console.log('Approving product:', productId);
    // Implementation would update product status
  };

  const handleRejectProduct = (productId: string, reason: string) => {
    console.log('Rejecting product:', productId, 'Reason:', reason);
    // Implementation would update product status and add rejection reason
  };

  const handleBulkAction = (action: BulkAction) => {
    console.log('Bulk action:', action);
    // Implementation would process bulk actions
  };

  const handleProductClick = (product: Product) => {
    console.log('Viewing product details:', product);
    // Implementation would open product detail modal or navigate to detail page
  };

  const handleStoreClick = (store: Store) => {
    console.log('Viewing store details:', store);
    // Implementation would open store detail modal or navigate to store page
  };

  const handleToggleStoreStatus = (storeId: string) => {
    console.log('Toggling store status:', storeId);
    // Implementation would toggle store active/inactive status
  };

  const handleUpgradePrivilege = (storeId: string, newLevel: UserLevel) => {
    console.log('Upgrading privilege:', storeId, 'to', newLevel);
    // Implementation would update user privilege level
  };

  const handleDowngradePrivilege = (storeId: string, newLevel: UserLevel) => {
    console.log('Downgrading privilege:', storeId, 'to', newLevel);
    // Implementation would update user privilege level
  };

  const handleCreatePriceModification = (modification: Omit<PriceModification, 'id' | 'modifiedDate' | 'sellerNotified'>) => {
    console.log('Creating price modification:', modification);
    // Implementation would create new price modification
  };

  const handleNotifySeller = (modificationId: string) => {
    console.log('Notifying seller about modification:', modificationId);
    // Implementation would send notification to seller
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      sellerLevel: 'all',
      priceRange: { min: 0, max: 0 },
      status: 'all',
      dateRange: { start: null, end: null }
    });
  };

  const tabs = [
  { id: 'overview', label: 'Overview', icon: 'BarChart3' },
  { id: 'approvals', label: 'Product Approvals', icon: 'CheckCircle' },
  { id: 'stores', label: 'Store Management', icon: 'Store' },
  { id: 'pricing', label: 'Price Modifications', icon: 'DollarSign' }];


  return (
    <>
      <Helmet>
        <title>Store Management System - LiqLearns Admin</title>
        <meta name="description" content="Comprehensive store management system for Ethiopian language learning platform with product approvals, pricing controls, and seller oversight." />
      </Helmet>

      <div className="min-h-screen bg-background overflow-x-hidden">
        <NavigationSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />


        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} overflow-x-hidden`}>
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4 overflow-x-hidden">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <BreadcrumbNavigation
                  items={[
                  { label: 'Admin', href: '/admin' },
                  { label: 'Store Management', href: '/admin/store-management' }]
                  } />

              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter
                  onNotificationClick={(id) => console.log('Notification clicked:', id)}
                  onMarkAsRead={(id) => console.log('Mark as read:', id)}
                  onMarkAllAsRead={() => console.log('Mark all as read')} />

                <UserProfileIndicator
                  userAvatar="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
                  onLogout={() => console.log('Logout')}
                  onProfileClick={() => console.log('Profile clicked')} />

              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="font-heading font-bold text-2xl text-foreground truncate">
                    Store Management System
                  </h1>
                  <p className="font-body text-muted-foreground mt-1 break-words">
                    Oversee product approvals, store operations, and pricing across the Ethiopian language learning platform
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" iconName="Download">
                    Export Report
                  </Button>
                  <Button variant="default" iconName="Plus">
                    Add Store
                  </Button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-border overflow-x-auto">
                <nav className="flex space-x-8 min-w-max">
                  {tabs.map((tab) =>
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 font-body font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id ?
                    'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`
                    }>

                      <Icon name={tab.icon} size={16} />
                      {tab.label}
                    </button>
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'overview' &&
                <SalesMetricsOverview metrics={mockSalesMetrics} />
                }

                {activeTab === 'approvals' &&
                <>
                    <FilterControls
                    filters={filters}
                    onFiltersChange={setFilters}
                    onResetFilters={handleResetFilters}
                    productCategories={productCategories} />

                    <ProductApprovalQueue
                    products={filteredProducts}
                    onApprove={handleApproveProduct}
                    onReject={handleRejectProduct}
                    onBulkAction={handleBulkAction}
                    onProductClick={handleProductClick} />

                  </>
                }

                {activeTab === 'stores' &&
                <StorefrontManagement
                  stores={mockStores}
                  onStoreClick={handleStoreClick}
                  onToggleStoreStatus={handleToggleStoreStatus}
                  onUpgradePrivilege={handleUpgradePrivilege}
                  onDowngradePrivilege={handleDowngradePrivilege} />

                }

                {activeTab === 'pricing' &&
                <PriceModificationPanel
                  modifications={mockPriceModifications}
                  onCreateModification={handleCreatePriceModification}
                  onNotifySeller={handleNotifySeller} />

                }
              </div>
            </div>
          </main>
        </div>
      </div>
    </>);

};

export default StoreManagementSystem;