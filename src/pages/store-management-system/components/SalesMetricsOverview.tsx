import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { SalesMetrics } from '../types';

interface SalesMetricsOverviewProps {
  metrics: SalesMetrics;
}

const SalesMetricsOverview = ({ metrics }: SalesMetricsOverviewProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-ET').format(num);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={12}
        className={i < Math.floor(rating) ? 'text-warning fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingCart" size={20} className="text-primary" />
            </div>
            <div>
              <div className="font-heading font-semibold text-lg text-foreground">
                {formatNumber(metrics.totalSales)}
              </div>
              <div className="font-body text-sm text-muted-foreground">
                Total Sales
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={20} className="text-success" />
            </div>
            <div>
              <div className="font-heading font-semibold text-lg text-foreground">
                {formatPrice(metrics.totalRevenue)}
              </div>
              <div className="font-body text-sm text-muted-foreground">
                Total Revenue
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Percent" size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-heading font-semibold text-lg text-foreground">
                {formatPrice(metrics.totalCommissions)}
              </div>
              <div className="font-body text-sm text-muted-foreground">
                Commissions
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Store" size={20} className="text-warning" />
            </div>
            <div>
              <div className="font-heading font-semibold text-lg text-foreground">
                {formatNumber(metrics.activeStores)}
              </div>
              <div className="font-body text-sm text-muted-foreground">
                Active Stores
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-error" />
            </div>
            <div>
              <div className="font-heading font-semibold text-lg text-foreground">
                {formatNumber(metrics.pendingApprovals)}
              </div>
              <div className="font-body text-sm text-muted-foreground">
                Pending Approvals
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Top Selling Products
            </h3>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Best performing products this month
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {metrics.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-semibold text-sm text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-body font-medium text-sm text-foreground truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-body text-xs text-muted-foreground">
                        {formatNumber(product.sales)} sales
                      </span>
                      <span className="font-body text-xs text-success">
                        {formatPrice(product.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Stores */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="font-heading font-semibold text-lg text-foreground">
              Top Performing Stores
            </h3>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Highest revenue generating stores
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {metrics.topPerformingStores.map((store, index) => (
                <div key={store.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-semibold text-sm text-success">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-body font-medium text-sm text-foreground">
                      {store.name}
                    </h4>
                    <p className="font-body text-xs text-muted-foreground">
                      by {store.owner}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-body text-xs text-muted-foreground">
                        {formatNumber(store.sales)} sales
                      </span>
                      <span className="font-body text-xs text-success">
                        {formatPrice(store.revenue)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getRatingStars(store.rating)}
                        <span className="font-body text-xs text-muted-foreground ml-1">
                          {store.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesMetricsOverview;