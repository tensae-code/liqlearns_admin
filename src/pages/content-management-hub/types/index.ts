export interface ContentItem {
  id: string;
  title: string;
  language: string;
  contentType: ContentType;
  format: string;
  uploadDate: Date;
  pointRequirement: number;
  approvalStatus: ApprovalStatus;
  fileSize: string;
  uploadedBy: string;
  description: string;
  thumbnailUrl?: string;
  fileUrl: string;
  viewCount: number;
  downloadCount: number;
  tags: string[];
}

export type ContentType = 
  | 'books' |'courses' |'notes' |'exercises' |'stories' |'music' |'videos' |'games' |'movies' |'audiobooks' |'translations' |'live-videos';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'under-review';

export interface UploadZoneConfig {
  type: ContentType;
  title: string;
  icon: string;
  acceptedFormats: string[];
  maxFileSize: string;
  description: string;
  color: string;
}

export interface FilterOptions {
  language: string;
  contentType: ContentType | 'all';
  approvalStatus: ApprovalStatus | 'all';
  searchQuery: string;
}

export interface BulkOperation {
  type: 'approve' | 'reject' | 'delete' | 'update-points' | 'change-category';
  selectedIds: string[];
  value?: string | number;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ContentPreview {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  isVisible: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export interface ContentStats {
  totalContent: number;
  pendingApproval: number;
  approvedContent: number;
  rejectedContent: number;
  totalDownloads: number;
  totalViews: number;
}