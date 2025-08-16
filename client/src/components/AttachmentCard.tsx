import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useImageCache } from "@/contexts/ImageCacheContext";
import {
  X,
  Download,
  Eye,
  FileText,
  FileVideo,
  ImageIcon,
  Music,
  Archive,
  File,
  Loader2,
} from "lucide-react";

// Types
interface AttachmentFile {
  id?: string | number;
  name?: string;
  file_name?: string;
  size?: number;
  file_url?: string;
  path?: string; // Backend uses this field for actual file URLs
  content_type?: string;
}

interface UploadProgress {
  name: string;
  progress: number;
}

interface AttachmentCardProps {
  file: AttachmentFile;
  variant?: 'composer' | 'message';
  isOwner?: boolean;
  uploadProgress?: UploadProgress;
  onRemove?: () => void;
  onCancelUpload?: () => void;
  className?: string;
}

// Helper functions
const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

const getFileTypeInfo = (fileName: string, contentType?: string) => {
  const extension = getFileExtension(fileName);
  
  // Image files - including HEIC/HEIF support
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic', 'heif'].includes(extension) || 
      contentType?.startsWith('image/') ||
      contentType === 'image/heic' || contentType === 'image/heif') {
    return {
      type: 'image',
      icon: ImageIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    };
  }
  
  // PDF files
  if (extension === 'pdf' || contentType === 'application/pdf') {
    return {
      type: 'pdf',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    };
  }
  
  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension) || 
      contentType?.startsWith('video/')) {
    return {
      type: 'video',
      icon: FileVideo,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    };
  }
  
  // Audio files
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension) || 
      contentType?.startsWith('audio/')) {
    return {
      type: 'audio',
      icon: Music,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    };
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return {
      type: 'archive',
      icon: Archive,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    };
  }
  
  // Document files
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return {
      type: 'document',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    };
  }
  
  // Default for unknown file types
  return {
    type: 'unknown',
    icon: File,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20'
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function AttachmentCard({ 
  file, 
  variant = 'composer', 
  isOwner = false, 
  uploadProgress, 
  onRemove, 
  onCancelUpload,
  className = ""
}: AttachmentCardProps) {
  const fileName = file.file_name || file.name || 'Unknown file';
  const fileTypeInfo = getFileTypeInfo(fileName, file.content_type);
  const IconComponent = fileTypeInfo.icon;
  // Use path field from backend, fallback to file_url, then construct if needed
  const fileUrl = file.path || file.file_url || (file.id ? `https://api.baltek.net/media/file/${file.id}` : '');
  const isImage = fileTypeInfo.type === 'image';
  const isUploading = uploadProgress && uploadProgress.name === fileName;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const { getCachedImage, loadAndCacheImage, isLoading } = useImageCache();

  // Load and cache image when component mounts
  useEffect(() => {
    if (isImage && fileUrl) {
      const cached = getCachedImage(fileUrl);
      if (cached) {
        console.log('✅ Using cached image:', fileUrl);
        setCachedImageUrl(cached);
      } else {
        console.log('📥 Loading and caching image:', fileUrl);
        // Cache in background, but don't wait for it to display the image
        loadAndCacheImage(fileUrl)
          .then((cachedUrl) => {
            console.log('✅ Image cached successfully:', fileUrl);
            setCachedImageUrl(cachedUrl);
          })
          .catch((error) => {
            console.error('❌ Failed to cache image:', error);
          });
      }
    }
  }, [isImage, fileUrl]); // Remove function dependencies to prevent re-runs

  // Debug log for images
  console.log('AttachmentCard Debug:', {
    fileName,
    extension: getFileExtension(fileName),
    contentType: file.content_type,
    fileTypeInfo: fileTypeInfo.type,
    isImage,
    fileUrl,
    pathFromBackend: file.path,
    actualFileUrl: file.file_url,
    hasUrl: !!fileUrl,
    isHEIC: getFileExtension(fileName) === 'heic' || file.content_type === 'image/heic'
  });

  // Simple styling - no backgrounds, just minimal layout
  const getCardClasses = () => {
    return "relative";
  };

  const handleDownload = () => {
    // Use path field from backend first, then fallback
    const downloadUrl = file.path || file.file_url || fileUrl;
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.click();
    }
  };

  const handleView = () => {
    if (isImage) {
      // For images, open modal instead of new window
      setIsImageModalOpen(true);
    } else {
      // For non-images, open in new window
      const viewUrl = file.path || file.file_url || fileUrl;
      if (viewUrl) {
        window.open(viewUrl, '_blank');
      }
    }
  };

  return (
    <div className={`${getCardClasses()} ${className}`}>
      {/* Upload Progress Overlay */}
      {isUploading && uploadProgress && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
          <div className="text-center text-white">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <div className="text-sm font-medium">{Math.round(uploadProgress.progress)}%</div>
          </div>
        </div>
      )}

      {/* Remove Button (Composer only) */}
      {variant === 'composer' && (onRemove || onCancelUpload) && (
        <div className="absolute -top-2 -right-2 z-20">
          <Button
            variant="destructive"
            size="sm"
            className="h-6 w-6 p-0 rounded-full shadow-lg"
            onClick={isUploading ? onCancelUpload : onRemove}
            title={isUploading ? "Cancel upload" : "Remove file"}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Simplified Content Layout */}
      {isImage && fileUrl ? (
        /* Image Layout - Simple preview with click to view */
        <div className="flex items-center space-x-3">
          <div className="cursor-pointer" onClick={handleView}>
            <img
              src={cachedImageUrl || fileUrl}
              alt={fileName}
              className="w-12 h-12 object-cover rounded"
              loading="eager"
              onError={(e) => {
                console.log('Image failed to load:', fileUrl);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', fileUrl);
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate" title={fileName}>
              {fileName}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        /* File Layout - Icon, filename, and download button */
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${fileTypeInfo.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate" title={fileName}>
              {fileName}
            </div>
          </div>
          
          {fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Image Modal */}
      {isImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none overflow-hidden">
            <img
              src={cachedImageUrl || fileUrl}
              alt={fileName}
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AttachmentCard;