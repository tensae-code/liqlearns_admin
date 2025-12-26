import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { UserFilters } from '../types';

interface UserFiltersPanelProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onResetFilters: () => void;
  className?: string;
}

const UserFiltersPanel = ({ 
  filters, 
  onFiltersChange, 
  onResetFilters, 
  className = '' 
}: UserFiltersPanelProps) => {
  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'Student', label: 'Student' },
    { value: 'Trainee Seller', label: 'Trainee Seller' },
    { value: 'Salesman', label: 'Salesman' },
    { value: 'Team Leader', label: 'Team Leader' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Journeyman', label: 'Journeyman' },
    { value: 'Brand Ambassador', label: 'Brand Ambassador' },
    { value: 'Ambassador', label: 'Ambassador' }
  ];

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'amharic', label: 'Amharic' },
    { value: 'tigrinya', label: 'Tigrinya' },
    { value: 'oromifa', label: 'Oromifa' },
    { value: 'english', label: 'English' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'banned', label: 'Banned' },
    { value: 'temporary_ban', label: 'Temporary Ban' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Filter Users
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          iconName="RotateCcw"
          iconPosition="left"
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select
          label="User Level"
          options={levelOptions}
          value={filters.level}
          onChange={(value) => handleFilterChange('level', value)}
          placeholder="Select level"
        />

        <Select
          label="Language"
          options={languageOptions}
          value={filters.language}
          onChange={(value) => handleFilterChange('language', value)}
          placeholder="Select language"
        />

        <Select
          label="Account Status"
          options={statusOptions}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Select status"
        />

        <Input
          label="Search Users"
          type="search"
          placeholder="Username, email, or name..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Join Date From"
          type="date"
          value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
          onChange={(e) => handleFilterChange('dateRange', {
            ...filters.dateRange,
            start: e.target.value ? new Date(e.target.value) : null
          })}
        />

        <Input
          label="Join Date To"
          type="date"
          value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
          onChange={(e) => handleFilterChange('dateRange', {
            ...filters.dateRange,
            end: e.target.value ? new Date(e.target.value) : null
          })}
        />
      </div>
    </div>
  );
};

export default UserFiltersPanel;