import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { FilterOptions, ContentType, ApprovalStatus, LanguageOption } from '../types';

interface ContentFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  className?: string;
}

const ContentFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}: ContentFiltersProps) => {
  const languageOptions: LanguageOption[] = [
    { code: 'all', name: 'All Languages', nativeName: 'All Languages' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
    { code: 'or', name: 'Oromifa', nativeName: 'Afaan Oromoo' },
    { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
    { code: 'aa', name: 'Afar', nativeName: 'Qafar af' },
    { code: 'gez', name: 'Geez', nativeName: 'ግዕዝ' },
    { code: 'sid', name: 'Sidamo', nativeName: 'Sidaamu afii' },
    { code: 'wal', name: 'Wolaytta', nativeName: 'Wolaytta' }
  ];

  const contentTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'books', label: 'Books' },
    { value: 'courses', label: 'Courses' },
    { value: 'notes', label: 'Notes' },
    { value: 'exercises', label: 'Exercises' },
    { value: 'stories', label: 'Stories' },
    { value: 'music', label: 'Music' },
    { value: 'videos', label: 'Videos' },
    { value: 'games', label: 'Games' },
    { value: 'movies', label: 'Movies' },
    { value: 'audiobooks', label: 'Audiobooks' },
    { value: 'translations', label: 'Translations' },
    { value: 'live-videos', label: 'Live Videos' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'under-review', label: 'Under Review' }
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = 
    filters.language !== 'all' ||
    filters.contentType !== 'all' ||
    filters.approvalStatus !== 'all' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-lg text-foreground">
          Filter Content
        </h2>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            type="search"
            placeholder="Search content by title, description, or tags..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Language Filter */}
        <Select
          label="Language"
          options={languageOptions.map(lang => ({
            value: lang.code,
            label: `${lang.name} ${lang.code !== 'all' ? `(${lang.nativeName})` : ''}`
          }))}
          value={filters.language}
          onChange={(value) => handleFilterChange('language', value as string)}
          searchable
        />

        {/* Content Type Filter */}
        <Select
          label="Content Type"
          options={contentTypeOptions}
          value={filters.contentType}
          onChange={(value) => handleFilterChange('contentType', value as ContentType | 'all')}
        />

        {/* Status Filter */}
        <Select
          label="Approval Status"
          options={statusOptions}
          value={filters.approvalStatus}
          onChange={(value) => handleFilterChange('approvalStatus', value as ApprovalStatus | 'all')}
        />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-body text-sm text-muted-foreground">
              Active filters:
            </span>
            
            {filters.searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                Search: "{filters.searchQuery}"
              </span>
            )}
            
            {filters.language !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                Language: {languageOptions.find(l => l.code === filters.language)?.name}
              </span>
            )}
            
            {filters.contentType !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary">
                Type: {contentTypeOptions.find(t => t.value === filters.contentType)?.label}
              </span>
            )}
            
            {filters.approvalStatus !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">
                Status: {statusOptions.find(s => s.value === filters.approvalStatus)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentFilters;