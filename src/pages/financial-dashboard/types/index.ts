export interface TransactionStatus {
  id: string;
  label: string;
  color: string;
}

export interface MoneyTransfer {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  reviewDate?: Date;
  reviewedBy?: string;
  reason?: string;
}

export interface MLMLeg {
  id: string;
  name: 'A' | 'B' | 'C' | 'D';
  totalVolume: number;
  activeMembers: number;
  weeklyGrowth: number;
  matchBonus: number;
  color: string;
}

export interface CommissionStructure {
  level: string;
  percentage: number;
  description: string;
  requirements: string;
}

export interface WeeklyPayment {
  week: string;
  directReferral: number;
  matchBonus: number;
  teamLeaderBonus: number;
  totalEarnings: number;
}

export interface FinancialSummary {
  totalPlatformEarnings: number;
  pendingTransfers: number;
  approvedTransfers: number;
  rejectedTransfers: number;
  monthlyCommissions: number;
  weeklyGrowth: number;
}

export interface BarcodeWallet {
  id: string;
  userId: string;
  userName: string;
  walletAddress: string;
  qrCode: string;
  balance: number;
  isActive: boolean;
  createdDate: Date;
}

export interface FilterOptions {
  dateRange: {
    start: Date;
    end: Date;
  };
  userLevel: string[];
  transactionType: string[];
  status: string[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}