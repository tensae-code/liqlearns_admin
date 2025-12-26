import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl }) => {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract video ID from YouTube URL - Fixed to handle more URL formats
  const getYouTubeEmbedUrl = (url: string): string => {
    try {
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\/\s]{11})/,
        /youtube\.com\/v\/([^&?\/\s]{11})/,
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
        }
      }
      
      // If already an embed URL, use it directly
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
      
      // Fallback: return the URL as is
      return url;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return url;
    }
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      {/* Backdrop - click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Content - Enhanced visibility */}
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in border-2 border-orange-500/20">
        {/* Close Button - More visible */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-orange-600/80 hover:bg-orange-600 rounded-full backdrop-blur-sm transition-all duration-300 group shadow-lg"
          aria-label="Close video"
        >
          <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Video Container - Fixed aspect ratio */}
        <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
          {embedUrl ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <p className="text-xl mb-2">Video not available</p>
                <p className="text-sm text-gray-400">Please check the video URL</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Enhanced visibility */}
        <div className="p-4 bg-gradient-to-r from-orange-600/20 to-orange-500/20 border-t border-orange-500/30">
          <p className="text-center text-sm text-gray-300 font-medium">
            Press <kbd className="px-2 py-1 bg-gray-800 rounded text-orange-400 border border-orange-600/30">ESC</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;