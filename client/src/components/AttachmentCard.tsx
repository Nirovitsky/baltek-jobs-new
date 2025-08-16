import React from "react";
import { Button } from "@/components/ui/button";
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
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension) || 
      contentType?.startsWith('image/')) {
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
  const fileUrl = file.file_url || (file.id ? `https://api.baltek.net/api/files/${file.id}/` : '');
  const isImage = fileTypeInfo.type === 'image' && fileUrl;
  const isUploading = uploadProgress && uploadProgress.name === fileName;

  // Dynamic styling based on variant and owner status
  const getCardClasses = () => {
    const baseClasses = "relative group rounded-xl shadow-sm hover:shadow-lg transition-all duration-300";
    
    if (variant === 'composer') {
      return `${baseClasses} bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-3 hover:scale-[1.02]`;
    } else {
      // Message variant
      if (isOwner) {
        return `${baseClasses} bg-white/10 border-white/20 hover:bg-white/15 border p-3`;
      } else {
        return `${baseClasses} bg-card border-border hover:border-input border p-3`;
      }
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.click();
    }
  };

  const handleView = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
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

      {/* Image Thumbnail */}
      {isImage ? (
        <div className="relative mb-3">
          <img
            src={fileUrl}
            alt={fileName}
            className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors duration-200" />
          
          {/* Image Action Buttons (Message variant) */}
          {variant === 'message' && (
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border-0 shadow-lg backdrop-blur-sm"
                onClick={handleView}
                title="View full size"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 border-0 shadow-lg backdrop-blur-sm"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* File Icon */
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${fileTypeInfo.bgColor}`}>
          <IconComponent className={`w-6 h-6 ${fileTypeInfo.color}`} />
        </div>
      )}

      {/* File Info */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground truncate" title={fileName}>
          {fileName}
        </div>
        
        {file.size && (
          <div className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </div>
        )}

        {/* Action Buttons for Non-Images */}
        {!isImage && variant === 'message' && fileUrl && (
          <div className="flex space-x-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs flex-1"
              onClick={handleDownload}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            {fileTypeInfo.type === 'pdf' && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleView}
                title="View"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AttachmentCard;