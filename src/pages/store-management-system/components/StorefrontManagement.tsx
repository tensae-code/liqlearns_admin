import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Store, UserLevel } from '../types';

interface StorefrontManagementProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
  onToggleStoreStatus: (storeId: string) => void;
  onUpgradePrivilege: (storeId: string, newLevel: UserLevel) => void;
  onDowngradePrivilege: (storeId: string, newLevel: UserLevel) => void;
}

const StorefrontManagement = ({
  stores,
  onStoreClick,
  onToggleStoreStatus,
  onUpgradePrivilege,
  onDowngradePrivilege
}: StorefrontManagementProps) => {
  const [filterLevel, setFilterLevel] = useState<UserLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'sales' | 'rating' | 'activity'>('revenue');

  const privilegeLevels: UserLevel[] = [
    'Student', 'Trainee Seller', 'Salesman', 'Team Leader', 
    'Supervisor', 'Journeyman', 'Brand Ambassador', 'Ambassador'
  ];

  const canOwnStore = (level: UserLevel): boolean => {
    return level === 'Ambassador';
  };

  const canSellProducts = (level: UserLevel): boolean => {
    return ['Journeyman', 'Brand Ambassador', 'Ambassador'].includes(level);
  };

  const filteredStores = stores.filter(store => 
    filterLevel === 'all' || store.ownerLevel === filterLevel
  );

  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.monthlyRevenue - a.monthlyRevenue;
      case 'sales':
        return b.totalSales - a.totalSales;
      case 'rating':
        return b.performanceRating - a.performanceRating;
      case 'activity':
        return b.lastActivity.getTime() - a.lastActivity.getTime();
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getPrivilegeColor = (level: UserLevel) => {
    if (level === 'Ambassador') return 'bg-primary/10 text-primary';
    if (['Brand Ambassador', 'Journeyman'].includes(level)) return 'bg-accent/10 text-accent';
    return 'bg-muted text-muted-foreground';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={14}
        className={i < Math.floor(rating) ? 'text-warning fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header with Filters */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Storefront Management
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {stores.length} active stores across privilege levels
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as UserLevel | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-input text-foreground font-body text-sm"
            >
              <option value="all">All Levels</option>
              {privilegeLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-border rounded-lg bg-input text-foreground font-body text-sm"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="sales">Sort by Sales</option>
              <option value="rating">Sort by Rating</option>
              <option value="activity">Sort by Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedStores.map((store) => (
            <div key={store.id} className="border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow duration-200">
              {/* Store Header */}
              <div className="relative">
                <div className="h-32 bg-muted overflow-hidden">
                  <Image
                    src={store.storeImage}
                    alt={store.storeImageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  store.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Store Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onStoreClick(store)}
                      className="font-heading font-semibold text-base text-foreground hover:text-primary transition-colors duration-200 text-left"
                    >
                      {store.storeName}
                    </button>
                    <p className="font-body text-sm text-muted-foreground">
                      by {store.ownerName}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPrivilegeColor(store.ownerLevel)}`}>
                    {store.ownerLevel}
                  </div>
                </div>

                {/* Store Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="font-heading font-semibold text-sm text-foreground">
                      {store.totalProducts}
                    </div>
                    <div className="font-body text-xs text-muted-foreground">
                      Products
                    </div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="font-heading font-semibold text-sm text-foreground">
                      {store.totalSales}
                    </div>
                    <div className="font-body text-xs text-muted-foreground">
                      Sales
                    </div>
                  </div>
                </div>

                {/* Revenue and Rating */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-muted-foreground">Monthly Revenue</span>
                    <span className="font-heading font-semibold text-sm text-foreground">
                      {formatPrice(store.monthlyRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-muted-foreground">Commission Rate</span>
                    <span className="font-body text-sm text-foreground">
                      {store.commissionRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      {getRatingStars(store.performanceRating)}
                      <span className="font-body text-sm text-foreground ml-1">
                        {store.performanceRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                  <Icon name="Clock" size={12} />
                  <span>Last active {store.lastActivity.toLocaleDateString('en-GB')}</span>
                </div>

                {/* Action Buttons - FIXED: Stack buttons vertically */}
                <div className="w-full space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye"
                    onClick={() => onStoreClick(store)}
                    fullWidth
                  >
                    View Store
                  </Button>
                  <Button
                    variant={store.isActive ? 'destructive' : 'success'}
                    size="sm"
                    iconName={store.isActive ? 'Pause' : 'Play'}
                    onClick={() => onToggleStoreStatus(store.id)}
                    fullWidth
                  >
                    {store.isActive ? 'Pause Store' : 'Activate Store'}
                  </Button>
                </div>

                {/* Privilege Management */}
                {(canSellProducts(store.ownerLevel) || canOwnStore(store.ownerLevel)) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Store Privileges:</span>
                      <div className="flex items-center gap-1">
                        {canSellProducts(store.ownerLevel) && (
                          <span className="px-1.5 py-0.5 bg-success/10 text-success rounded">
                            Sell
                          </span>
                        )}
                        {canOwnStore(store.ownerLevel) && (
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                            Own
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedStores.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Store" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No stores found
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              No stores match the current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontManagement;