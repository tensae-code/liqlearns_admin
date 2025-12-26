import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { ContentItem, ApprovalStatus } from '../types';

interface ContentLibraryTableProps {
  content: ContentItem[];
  selectedItems: string[];
  onItemSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onStatusChange: (id: string, status: ApprovalStatus) => void;
  onPointsChange: (id: string, points: number) => void;
  onPreview: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const ContentLibraryTable = ({
  content,
  selectedItems,
  onItemSelect,
  onSelectAll,
  onStatusChange,
  onPointsChange,
  onPreview,
  onDelete,
  className = ''
}: ContentLibraryTableProps) => {
  const [editingPoints, setEditingPoints] = useState<string | null>(null);
  const [pointsValue, setPointsValue] = useState<string>('');

  const allSelected = content.length > 0 && selectedItems.length === content.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < content.length;

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  const handlePointsEdit = (id: string, currentPoints: number) => {
    setEditingPoints(id);
    setPointsValue(currentPoints.toString());
  };

  const handlePointsSave = (id: string) => {
    const points = parseInt(pointsValue);
    if (!isNaN(points) && points >= 0) {
      onPointsChange(id, points);
    }
    setEditingPoints(null);
    setPointsValue('');
  };

  const handlePointsCancel = () => {
    setEditingPoints(null);
    setPointsValue('');
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning', label: 'Pending' },
      approved: { color: 'bg-success/10 text-success', label: 'Approved' },
      rejected: { color: 'bg-error/10 text-error', label: 'Rejected' },
      'under-review': { color: 'bg-accent/10 text-accent', label: 'Under Review' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getContentTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      books: 'Book',
      courses: 'GraduationCap',
      notes: 'FileText',
      exercises: 'PenTool',
      stories: 'BookOpen',
      music: 'Music',
      videos: 'Video',
      games: 'Gamepad2',
      movies: 'Film',
      audiobooks: 'Headphones',
      translations: 'Languages',
      'live-videos': 'Radio'
    };
    return iconMap[type] || 'File';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'under-review', label: 'Under Review' }
  ];

  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden ${className}`}>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
              </th>
              <th className="text-left p-4 font-heading font-semibold text-sm text-foreground">
                Content
              </th>
              <th className="text-left p-4 font-heading font-semibold text-sm text-foreground">
                Language
              </th>
              <th className="text-left p-4 font-heading font-semibold text-sm text-foreground">
                Type
              </th>
              <th className="text-left p-4 font-heading font-semibold text-sm text-foreground">
                Upload Date
              </th>
              <th className="text-left p-4 font-heading font-semibold text-sm text-foreground">
                Points
              </th>
              <th className="text-left p-4 font-heading font-semibold text-sm text-foreground">
                Status
              </th>
              <th className="text-left p-4 font-heading font-semibold text-sm text-foreground">
                Stats
              </th>
              <th className="text-right p-4 font-heading font-semibold text-sm text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {content.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onItemSelect(item.id)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={`Thumbnail for ${item.title} - ${item.contentType} content`}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <Icon name={getContentTypeIcon(item.contentType)} size={16} className="text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-body font-medium text-sm text-foreground">
                        {item.title}
                      </p>
                      <p className="font-caption text-xs text-muted-foreground">
                        {item.format} • {item.fileSize}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-body text-sm text-foreground">
                    {item.language}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name={getContentTypeIcon(item.contentType)} size={16} className="text-muted-foreground" />
                    <span className="font-body text-sm text-foreground capitalize">
                      {item.contentType.replace('-', ' ')}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-body text-sm text-foreground">
                    {formatDate(item.uploadDate)}
                  </span>
                </td>
                <td className="p-4">
                  {editingPoints === item.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(e.target.value)}
                        className="w-20"
                        min="0"
                      />
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handlePointsSave(item.id)}
                        iconName="Check"
                        iconSize={14}
                      />
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={handlePointsCancel}
                        iconName="X"
                        iconSize={14}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePointsEdit(item.id, item.pointRequirement)}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span className="font-body text-sm text-foreground">
                        {item.pointRequirement}
                      </span>
                      <Icon name="Edit2" size={12} className="text-muted-foreground" />
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <Select
                    options={statusOptions}
                    value={item.approvalStatus}
                    onChange={(value) => onStatusChange(item.id, value as ApprovalStatus)}
                    className="w-32"
                  />
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Icon name="Eye" size={12} className="text-muted-foreground" />
                      <span className="font-caption text-xs text-muted-foreground">
                        {item.viewCount}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Download" size={12} className="text-muted-foreground" />
                      <span className="font-caption text-xs text-muted-foreground">
                        {item.downloadCount}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onPreview(item)}
                      iconName="Eye"
                      iconSize={14}
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onDelete(item.id)}
                      iconName="Trash2"
                      iconSize={14}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {content.map((item) => (
          <div key={item.id} className="bg-background rounded-lg border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => onItemSelect(item.id)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={`Thumbnail for ${item.title} - ${item.contentType} content`}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    <Icon name={getContentTypeIcon(item.contentType)} size={20} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              {getStatusBadge(item.approvalStatus)}
            </div>
            
            <h3 className="font-body font-medium text-sm text-foreground mb-2">
              {item.title}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3">
              <div>
                <span className="font-medium">Language:</span> {item.language}
              </div>
              <div>
                <span className="font-medium">Type:</span> {item.contentType.replace('-', ' ')}
              </div>
              <div>
                <span className="font-medium">Points:</span> {item.pointRequirement}
              </div>
              <div>
                <span className="font-medium">Date:</span> {formatDate(item.uploadDate)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Eye" size={12} />
                  <span>{item.viewCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Download" size={12} />
                  <span>{item.downloadCount}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onPreview(item)}
                  iconName="Eye"
                  iconSize={14}
                />
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onDelete(item.id)}
                  iconName="Trash2"
                  iconSize={14}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentLibraryTable;