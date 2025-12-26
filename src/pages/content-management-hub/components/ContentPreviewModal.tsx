import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { ContentItem } from '../types';

interface ContentPreviewModalProps {
  content: ContentItem | null;
  isVisible: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

const ContentPreviewModal = ({
  content,
  isVisible,
  onClose,
  onApprove,
  onReject,
  className = ''
}: ContentPreviewModalProps) => {
  if (!isVisible || !content) return null;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-success';
      case 'rejected': return 'text-error';
      case 'pending': return 'text-warning';
      case 'under-review': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderContentPreview = () => {
    switch (content.contentType) {
      case 'videos': case'movies': case'live-videos':
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="Play" size={48} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-body text-sm text-muted-foreground">
                Video preview not available
              </p>
            </div>
          </div>
        );
      
      case 'music': case'audiobooks':
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="Volume2" size={48} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-body text-sm text-muted-foreground">
                Audio preview not available
              </p>
            </div>
          </div>
        );
      
      case 'books': case'notes': case'stories':
        return (
          <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-body text-sm text-muted-foreground">
                Document preview not available
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Icon name={getContentTypeIcon(content.contentType)} size={48} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-body text-sm text-muted-foreground">
                Preview not available for this content type
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className={`bg-card rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={getContentTypeIcon(content.contentType)} size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-foreground">
                {content.title}
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                {content.language} • {content.contentType.replace('-', ' ')}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview Area */}
            <div className="lg:col-span-2">
              {content.thumbnailUrl ? (
                <Image
                  src={content.thumbnailUrl}
                  alt={`Preview of ${content.title} - ${content.contentType} content`}
                  className="w-full rounded-lg object-cover"
                />
              ) : (
                renderContentPreview()
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground mb-2">
                  Status
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(content.approvalStatus)}`}>
                  <Icon name="Circle" size={8} className="mr-2" />
                  {content.approvalStatus.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <span className="font-body text-sm text-muted-foreground">Format:</span>
                  <p className="font-body text-sm text-foreground">{content.format}</p>
                </div>
                
                <div>
                  <span className="font-body text-sm text-muted-foreground">File Size:</span>
                  <p className="font-body text-sm text-foreground">{content.fileSize}</p>
                </div>
                
                <div>
                  <span className="font-body text-sm text-muted-foreground">Points Required:</span>
                  <p className="font-body text-sm text-foreground">{content.pointRequirement}</p>
                </div>
                
                <div>
                  <span className="font-body text-sm text-muted-foreground">Uploaded:</span>
                  <p className="font-body text-sm text-foreground">{formatDate(content.uploadDate)}</p>
                </div>
                
                <div>
                  <span className="font-body text-sm text-muted-foreground">Uploaded by:</span>
                  <p className="font-body text-sm text-foreground">{content.uploadedBy}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  Statistics
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Eye" size={16} className="text-muted-foreground" />
                    <span className="font-body text-sm text-muted-foreground">Views</span>
                  </div>
                  <span className="font-body text-sm text-foreground">{content.viewCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Download" size={16} className="text-muted-foreground" />
                    <span className="font-body text-sm text-muted-foreground">Downloads</span>
                  </div>
                  <span className="font-body text-sm text-foreground">{content.downloadCount}</span>
                </div>
              </div>

              {/* Tags */}
              {content.tags.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground mb-2">
                  Description
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {content.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {content.approvalStatus === 'pending' && (onApprove || onReject) && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            {onReject && (
              <Button
                variant="outline"
                onClick={() => onReject(content.id)}
                iconName="X"
                iconPosition="left"
              >
                Reject
              </Button>
            )}
            {onApprove && (
              <Button
                variant="default"
                onClick={() => onApprove(content.id)}
                iconName="Check"
                iconPosition="left"
              >
                Approve
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPreviewModal;