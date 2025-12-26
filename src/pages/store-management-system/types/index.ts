export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  proposedPrice: number;
  images: string[];
  imageAlts: string[];
  sellerId: string;
  sellerName: string;
  sellerLevel: UserLevel;
  submissionDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  rejectionReason?: string;
  qualityScore: number;
  complianceChecks: ComplianceCheck[];
}

export interface ComplianceCheck {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  description: string;
}

export interface Store {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerLevel: UserLevel;
  storeName: string;
  storeImage: string;
  storeImageAlt: string;
  isActive: boolean;
  totalProducts: number;
  totalSales: number;
  monthlyRevenue: number;
  commissionRate: number;
  createdDate: Date;
  lastActivity: Date;
  performanceRating: number;
}

export interface PriceModification {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  newPrice: number;
  reason: string;
  modifiedBy: string;
  modifiedDate: Date;
  sellerNotified: boolean;
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  totalCommissions: number;
  activeStores: number;
  pendingApprovals: number;
  topSellingProducts: TopProduct[];
  topPerformingStores: TopStore[];
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  sales: number;
  revenue: number;
}

export interface TopStore {
  id: string;
  name: string;
  owner: string;
  sales: number;
  revenue: number;
  rating: number;
}

export interface FilterOptions {
  category: string;
  sellerLevel: UserLevel | 'all';
  priceRange: {
    min: number;
    max: number;
  };
  status: Product['status'] | 'all';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export type UserLevel = 
  | 'Student' |'Trainee Seller' |'Salesman' |'Team Leader' |'Supervisor' |'Journeyman' |'Brand Ambassador' |'Ambassador';

export interface BulkAction {
  type: 'approve' | 'reject' | 'review';
  productIds: string[];
  reason?: string;
}

export interface StorePrivilege {
  level: UserLevel;
  canOwnStore: boolean;
  canSellProducts: boolean;
  maxProducts: number;
  commissionRate: number;
}