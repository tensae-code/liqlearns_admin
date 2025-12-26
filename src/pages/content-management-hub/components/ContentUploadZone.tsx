import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { UploadZoneConfig, UploadProgress } from '../types';

interface ContentUploadZoneProps {
  config: UploadZoneConfig;
  onFileUpload: (files: FileList, type: string) => void;
  uploadProgress?: UploadProgress[];
  className?: string;
}

const ContentUploadZone = ({ 
  config, 
  onFileUpload, 
  uploadProgress = [], 
  className = '' 
}: ContentUploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files, config.type);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files, config.type);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const activeUploads = uploadProgress.filter(upload => 
    upload.status === 'uploading' || upload.status === 'processing'
  );

  return (
    <div className={`bg-card rounded-lg border-2 border-dashed transition-all duration-200 ${
      isDragOver 
        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
    } ${className}`}>
      <div
        className="p-6 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${config.color}`}>
          <Icon name={config.icon} size={24} color="white" />
        </div>
        
        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
          {config.title}
        </h3>
        
        <p className="font-body text-sm text-muted-foreground mb-4">
          {config.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <p className="font-caption text-xs text-muted-foreground">
            <strong>Accepted formats:</strong> {config.acceptedFormats.join(', ')}
          </p>
          <p className="font-caption text-xs text-muted-foreground">
            <strong>Max file size:</strong> {config.maxFileSize}
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-primary">
          <Icon name="Upload" size={16} />
          <span className="font-body text-sm font-medium">
            Click to upload or drag and drop
          </span>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={config.acceptedFormats.map(format => `.${format}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      {/* Upload Progress */}
      {activeUploads.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          {activeUploads.map((upload) => (
            <div key={upload.fileId} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-foreground truncate">
                  {upload.fileName}
                </span>
                <span className="font-caption text-xs text-muted-foreground">
                  {upload.progress}%
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              
              {upload.status === 'processing' && (
                <p className="font-caption text-xs text-muted-foreground">
                  Processing file...
                </p>
              )}
              
              {upload.error && (
                <p className="font-caption text-xs text-error">
                  {upload.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentUploadZone;