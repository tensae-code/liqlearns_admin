import React from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { FilterOptions } from '../types';

interface FilterControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: () => void;
  className?: string;
}

const FilterControls = ({ 
  filters, 
  onFiltersChange, 
  onExport, 
  className = '' 
}: FilterControlsProps) => {
  const userLevelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'student', label: 'Student' },
    { value: 'trainee-seller', label: 'Trainee Seller' },
    { value: 'salesman', label: 'Salesman' },
    { value: 'team-leader', label: 'Team Leader' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'journeyman', label: 'Journeyman' },
    { value: 'brand-ambassador', label: 'Brand Ambassador' },
    { value: 'ambassador', label: 'Ambassador' }
  ];

  const transactionTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'direct-referral', label: 'Direct Referral' },
    { value: 'match-bonus', label: 'Match Bonus' },
    { value: 'team-leader-bonus', label: 'Team Leader Bonus' },
    { value: 'user-transfer', label: 'User Transfer' },
    { value: 'commission', label: 'Commission' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newDate = new Date(value);
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: newDate
      }
    });
  };

  const handleMultiSelectChange = (field: keyof FilterOptions, value: string) => {
    const currentValues = filters[field] as string[];
    let newValues: string[];

    if (value === 'all') {
      newValues = ['all'];
    } else {
      newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value && v !== 'all')
        : [...currentValues.filter(v => v !== 'all'), value];
      
      if (newValues.length === 0) {
        newValues = ['all'];
      }
    }

    onFiltersChange({
      ...filters,
      [field]: newValues
    });
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Filter & Export
        </h3>
        <Button
          variant="outline"
          iconName="Download"
          iconPosition="left"
          onClick={onExport}
        >
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Input
            label="Start Date"
            type="date"
            value={formatDateForInput(filters.dateRange.start)}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Input
            label="End Date"
            type="date"
            value={formatDateForInput(filters.dateRange.end)}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
          />
        </div>

        {/* User Level Filter */}
        <div className="space-y-2">
          <Select
            label="User Level"
            options={userLevelOptions}
            value={filters.userLevel[0] || 'all'}
            onChange={(value) => handleMultiSelectChange('userLevel', value as string)}
          />
        </div>

        {/* Transaction Type Filter */}
        <div className="space-y-2">
          <Select
            label="Transaction Type"
            options={transactionTypeOptions}
            value={filters.transactionType[0] || 'all'}
            onChange={(value) => handleMultiSelectChange('transactionType', value as string)}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status[0] || 'all'}
            onChange={(value) => handleMultiSelectChange('status', value as string)}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.userLevel.filter(level => level !== 'all').map(level => (
          <span key={level} className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <span>Level: {level}</span>
            <button onClick={() => handleMultiSelectChange('userLevel', level)}>
              ×
            </button>
          </span>
        ))}
        {filters.transactionType.filter(type => type !== 'all').map(type => (
          <span key={type} className="inline-flex items-center space-x-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
            <span>Type: {type}</span>
            <button onClick={() => handleMultiSelectChange('transactionType', type)}>
              ×
            </button>
          </span>
        ))}
        {filters.status.filter(status => status !== 'all').map(status => (
          <span key={status} className="inline-flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
            <span>Status: {status}</span>
            <button onClick={() => handleMultiSelectChange('status', status)}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default FilterControls;