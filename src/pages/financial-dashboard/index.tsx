import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import UserProfileIndicator from '../../components/ui/UserProfileIndicator';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NotificationCenter from '../../components/ui/NotificationCenter';
import FinancialSummaryCards from './components/FinancialSummaryCards';
import WeeklyPaymentChart from './components/WeeklyPaymentChart';
import TransferApprovalTable from './components/TransferApprovalTable';
import MLMCompensationView from './components/MLMCompensationView';
import BarcodeWalletGenerator from './components/BarcodeWalletGenerator';
import FilterControls from './components/FilterControls';
import {
  FinancialSummary,
  WeeklyPayment,
  MoneyTransfer,
  MLMLeg,
  CommissionStructure,
  BarcodeWallet,
  FilterOptions } from
'./types';

const FinancialDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    userLevel: ['all'],
    transactionType: ['all'],
    status: ['all']
  });

  // Mock data
  const financialSummary: FinancialSummary = {
    totalPlatformEarnings: 2847650.00,
    pendingTransfers: 23,
    approvedTransfers: 156,
    rejectedTransfers: 8,
    monthlyCommissions: 425780.00,
    weeklyGrowth: 15.8
  };

  const weeklyPayments: WeeklyPayment[] = [
  {
    week: "Week 1",
    directReferral: 45000,
    matchBonus: 32000,
    teamLeaderBonus: 18000,
    totalEarnings: 95000
  },
  {
    week: "Week 2",
    directReferral: 52000,
    matchBonus: 38000,
    teamLeaderBonus: 22000,
    totalEarnings: 112000
  },
  {
    week: "Week 3",
    directReferral: 48000,
    matchBonus: 35000,
    teamLeaderBonus: 20000,
    totalEarnings: 103000
  },
  {
    week: "Week 4",
    directReferral: 58000,
    matchBonus: 42000,
    teamLeaderBonus: 25000,
    totalEarnings: 125000
  },
  {
    week: "Week 5",
    directReferral: 55000,
    matchBonus: 40000,
    teamLeaderBonus: 23000,
    totalEarnings: 118000
  },
  {
    week: "Week 6",
    directReferral: 62000,
    matchBonus: 45000,
    teamLeaderBonus: 28000,
    totalEarnings: 135000
  },
  {
    week: "Week 7",
    directReferral: 59000,
    matchBonus: 43000,
    teamLeaderBonus: 26000,
    totalEarnings: 128000
  },
  {
    week: "Week 8",
    directReferral: 65000,
    matchBonus: 48000,
    teamLeaderBonus: 30000,
    totalEarnings: 143000
  }];


  const moneyTransfers: MoneyTransfer[] = [
  {
    id: "TXN001",
    senderId: "USR001",
    senderName: "Alemayehu Tadesse",
    senderAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_109601be2-1764694747159.png",
    receiverId: "USR002",
    receiverName: "Tigist Bekele",
    receiverAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_109601be2-1764694747159.png",
    amount: 5000.00,
    purpose: "Commission payment for Amharic course completion",
    status: "pending",
    requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "TXN002",
    senderId: "USR003",
    senderName: "Dawit Haile",
    senderAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c324d932-1765031357673.png",
    receiverId: "USR004",
    receiverName: "Meron Getachew",
    receiverAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c324d932-1765031357673.png",
    amount: 3500.00,
    purpose: "Team leader bonus distribution",
    status: "pending",
    requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: "TXN003",
    senderId: "USR005",
    senderName: "Yohannes Mehari",
    senderAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17766a019-1766145574308.png",
    receiverId: "USR006",
    receiverName: "Hanan Ahmed",
    receiverAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17766a019-1766145574308.png",
    amount: 7500.00,
    purpose: "MLM match bonus for 4-leg completion",
    status: "approved",
    requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reviewDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
    reviewedBy: "Admin"
  }];


  const mlmLegs: MLMLeg[] = [
  {
    id: "LEG_A",
    name: "A",
    totalVolume: 125000,
    activeMembers: 45,
    weeklyGrowth: 12.5,
    matchBonus: 15000,
    color: "#FF6B35"
  },
  {
    id: "LEG_B",
    name: "B",
    totalVolume: 98000,
    activeMembers: 38,
    weeklyGrowth: 8.3,
    matchBonus: 12000,
    color: "#FF8C42"
  },
  {
    id: "LEG_C",
    name: "C",
    totalVolume: 110000,
    activeMembers: 42,
    weeklyGrowth: 15.2,
    matchBonus: 13500,
    color: "#2C3E50"
  },
  {
    id: "LEG_D",
    name: "D",
    totalVolume: 87000,
    activeMembers: 35,
    weeklyGrowth: 6.8,
    matchBonus: 10500,
    color: "#38A169"
  }];


  const commissionStructure: CommissionStructure[] = [
  {
    level: "Basic Level",
    percentage: 13,
    description: "Standard commission rate",
    requirements: "Active membership"
  },
  {
    level: "Team Leader",
    percentage: 18,
    description: "Leadership bonus included",
    requirements: "5+ direct referrals"
  },
  {
    level: "Supervisor",
    percentage: 22,
    description: "Leg movement privileges",
    requirements: "3 active legs"
  },
  {
    level: "Journeyman",
    percentage: 25,
    description: "Product selling rights",
    requirements: "4 active legs + volume"
  },
  {
    level: "Ambassador",
    percentage: 30,
    description: "Store ownership privileges",
    requirements: "Elite level + store approval"
  }];


  const [barcodeWallets, setBarcodeWallets] = useState<BarcodeWallet[]>([
  {
    id: "WALLET001",
    userId: "USR001",
    userName: "Alemayehu Tadesse",
    walletAddress: "ETB_WALLET_ALE_001_2024",
    qrCode: "",
    balance: 15750.00,
    isActive: true,
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: "WALLET002",
    userId: "USR002",
    userName: "Tigist Bekele",
    walletAddress: "ETB_WALLET_TIG_002_2024",
    qrCode: "",
    balance: 8920.00,
    isActive: true,
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: "WALLET003",
    userId: "USR003",
    userName: "Dawit Haile",
    walletAddress: "ETB_WALLET_DAW_003_2024",
    qrCode: "",
    balance: 12340.00,
    isActive: false,
    createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  }]
  );

  const handleApproveTransfer = (transferId: string, reason?: string) => {
    console.log(`Approving transfer ${transferId}`, reason);
    // In real app, make API call to approve transfer
  };

  const handleRejectTransfer = (transferId: string, reason: string) => {
    console.log(`Rejecting transfer ${transferId}:`, reason);
    // In real app, make API call to reject transfer
  };

  const handleGenerateWallet = (userId: string, userName: string) => {
    const newWallet: BarcodeWallet = {
      id: `WALLET${Date.now()}`,
      userId,
      userName,
      walletAddress: `ETB_WALLET_${userName.substring(0, 3).toUpperCase()}_${userId}_${new Date().getFullYear()}`,
      qrCode: "",
      balance: 0,
      isActive: true,
      createdDate: new Date()
    };
    setBarcodeWallets((prev) => [...prev, newWallet]);
  };

  const handleToggleWallet = (walletId: string) => {
    setBarcodeWallets((prev) =>
    prev.map((wallet) =>
    wallet.id === walletId ?
    { ...wallet, isActive: !wallet.isActive } :
    wallet
    )
    );
  };

  const handleExportReport = () => {
    console.log('Exporting financial report with filters:', filters);
    // In real app, generate and download report
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Add this block - breadcrumb items
  const breadcrumbItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Financial', href: '/admin/financial' }];


  // Add this block - mock user data
  const currentUser = {
    name: 'Admin User',
    email: 'admin@liqlearns.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  };

  // Add this block - notification handlers
  const handleNotificationClick = (notificationId: string) => {
    console.log('Notification clicked:', notificationId);
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log('Mark as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
  };

  const handleLogout = () => {
    console.log('User logging out');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  return (
    <>
      <Helmet>
        <title>Financial Dashboard - LiqLearns Admin</title>
        <meta name="description" content="Comprehensive MLM compensation tracking, earnings management, and payment approvals for Ethiopian language learning platform" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <NavigationSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar} />


        <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`
        }>
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
                  userAvatar={currentUser.avatar}
                  onLogout={handleLogout}
                  onProfileClick={handleProfileClick} />

              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                Financial Dashboard
              </h1>
              <p className="font-body text-muted-foreground">
                Comprehensive MLM compensation tracking, earnings management, and payment approvals
              </p>
            </div>

            {/* Financial Summary Cards */}
            <FinancialSummaryCards summary={financialSummary} />

            {/* Filter Controls */}
            <FilterControls
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExportReport} />


            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <WeeklyPaymentChart data={weeklyPayments} />
              <MLMCompensationView
                legs={mlmLegs}
                commissionStructure={commissionStructure} />

            </div>

            {/* Transfer Approvals */}
            <TransferApprovalTable
              transfers={moneyTransfers}
              onApprove={handleApproveTransfer}
              onReject={handleRejectTransfer} />


            {/* Barcode Wallet Generator */}
            <BarcodeWalletGenerator
              wallets={barcodeWallets}
              onGenerateWallet={handleGenerateWallet}
              onToggleWallet={handleToggleWallet} />

          </main>
        </div>
      </div>
    </>);

};

export default FinancialDashboard;