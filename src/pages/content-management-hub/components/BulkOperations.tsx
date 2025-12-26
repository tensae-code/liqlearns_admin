import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { BulkOperation } from '../types';

interface BulkOperationsProps {
  selectedCount: number;
  onBulkOperation: (operation: BulkOperation) => void;
  onClearSelection: () => void;
  className?: string;
}

const BulkOperations = ({
  selectedCount,
  onBulkOperation,
  onClearSelection,
  className = ''
}: BulkOperationsProps) => {
  const [operationType, setOperationType] = useState<string>('');
  const [operationValue, setOperationValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const operationOptions = [
    { value: '', label: 'Select bulk action...' },
    { value: 'approve', label: 'Approve Selected' },
    { value: 'reject', label: 'Reject Selected' },
    { value: 'delete', label: 'Delete Selected' },
    { value: 'update-points', label: 'Update Points' },
    { value: 'change-category', label: 'Change Category' }
  ];

  const statusOptions = [
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'pending', label: 'Pending' },
    { value: 'under-review', label: 'Under Review' }
  ];

  const categoryOptions = [
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

  const handleExecute = async () => {
    if (!operationType || selectedCount === 0) return;

    setIsProcessing(true);
    
    try {
      const operation: BulkOperation = {
        type: operationType as BulkOperation['type'],
        selectedIds: [], // This would be populated by the parent component
        value: operationValue || undefined
      };

      await onBulkOperation(operation);
      
      // Reset form
      setOperationType('');
      setOperationValue('');
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const needsValue = operationType === 'update-points' || operationType === 'change-category';
  const isDestructive = operationType === 'delete' || operationType === 'reject';

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Selection Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-body font-medium text-sm text-foreground">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
            iconSize={14}
          >
            Clear
          </Button>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Operation Type */}
          <Select
            options={operationOptions}
            value={operationType}
            onChange={setOperationType}
            placeholder="Select action..."
            className="w-full sm:w-48"
          />

          {/* Operation Value */}
          {needsValue && (
            <div className="w-full sm:w-40">
              {operationType === 'update-points' ? (
                <Input
                  type="number"
                  placeholder="Points"
                  value={operationValue}
                  onChange={(e) => setOperationValue(e.target.value)}
                  min="0"
                />
              ) : operationType === 'change-category' ? (
                <Select
                  options={categoryOptions}
                  value={operationValue}
                  onChange={setOperationValue}
                  placeholder="Select category..."
                />
              ) : null}
            </div>
          )}

          {/* Execute Button */}
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleExecute}
            loading={isProcessing}
            disabled={!operationType || (needsValue && !operationValue)}
            iconName={isDestructive ? 'AlertTriangle' : 'Play'}
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            {isProcessing ? 'Processing...' : 'Execute'}
          </Button>
        </div>
      </div>

      {/* Warning for destructive actions */}
      {isDestructive && operationType && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div>
              <p className="font-body text-sm text-warning font-medium">
                Warning: This action cannot be undone
              </p>
              <p className="font-caption text-xs text-warning/80 mt-1">
                {operationType === 'delete' 
                  ? `You are about to permanently delete ${selectedCount} item${selectedCount !== 1 ? 's' : ''}.`
                  : `You are about to reject ${selectedCount} item${selectedCount !== 1 ? 's' : ''}.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;