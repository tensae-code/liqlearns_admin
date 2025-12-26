import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { FilterOptions, UserLevel } from '../types';

interface FilterControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  productCategories: string[];
}

const FilterControls = ({
  filters,
  onFiltersChange,
  onResetFilters,
  productCategories
}: FilterControlsProps) => {
  const userLevels: UserLevel[] = [
    'Student', 'Trainee Seller', 'Salesman', 'Team Leader',
    'Supervisor', 'Journeyman', 'Brand Ambassador', 'Ambassador'
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'under_review', label: 'Under Review' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...productCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    ...userLevels.map(level => ({ value: level, label: level }))
  ];

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value
    });
  };

  const handleLevelChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sellerLevel: value as UserLevel | 'all'
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as FilterOptions['status']
    });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [field]: parseFloat(value) || 0
      }
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value ? new Date(value) : null
      }
    });
  };

  const hasActiveFilters = 
    filters.category !== 'all' ||
    filters.sellerLevel !== 'all' ||
    filters.status !== 'all' ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Filter Products
          </h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            iconName="X"
            onClick={onResetFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Category Filter */}
        <Select
          label="Category"
          options={categoryOptions}
          value={filters.category}
          onChange={handleCategoryChange}
          placeholder="Select category"
        />

        {/* Seller Level Filter */}
        <Select
          label="Seller Level"
          options={levelOptions}
          value={filters.sellerLevel}
          onChange={handleLevelChange}
          placeholder="Select level"
        />

        {/* Status Filter */}
        <Select
          label="Status"
          options={statusOptions}
          value={filters.status}
          onChange={handleStatusChange}
          placeholder="Select status"
        />

        {/* Price Range */}
        <div className="space-y-2">
          <label className="block font-body text-sm font-medium text-foreground">
            Price Range (ETB)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min || ''}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max || ''}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="block font-body text-sm font-medium text-foreground">
            Submission Date
          </label>
          <div className="space-y-2">
            <Input
              type="date"
              value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="text-sm"
            />
            <Input
              type="date"
              value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-sm text-muted-foreground">Active filters:</span>
            
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Category: {filters.category}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}

            {filters.sellerLevel !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                Level: {filters.sellerLevel}
                <button
                  onClick={() => handleLevelChange('all')}
                  className="hover:bg-accent/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}

            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded-full text-xs">
                Status: {filters.status}
                <button
                  onClick={() => handleStatusChange('all')}
                  className="hover:bg-warning/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}

            {(filters.priceRange.min > 0 || filters.priceRange.max > 0) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs">
                Price: {filters.priceRange.min || 0} - {filters.priceRange.max || '∞'} ETB
                <button
                  onClick={() => onFiltersChange({
                    ...filters,
                    priceRange: { min: 0, max: 0 }
                  })}
                  className="hover:bg-success/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;