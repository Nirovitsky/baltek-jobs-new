import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Image as ImageIcon,
  FileVideo,
  Music,
  Archive,
  File,
  Eye,
} from "lucide-react";

interface FileAttachmentProps {
  attachment: {
    id?: string | number;
    file_name?: string;
    name?: string;
    file_url?: string;
    size?: number;
    content_type?: string;
  };
  isOwner: boolean;
  index: number;
}

// Helper function to get file extension
const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

// Helper function to determine file type and get appropriate icon
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

// Helper function to format file size
const formatFileSize = (bytes: number, t: any): string => {
  if (bytes === 0) return '0 ' + t('file_attachment.bytes');
  const k = 1024;
  const sizes = t('file_attachment.file_sizes', { returnObjects: true }) as string[];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileAttachment({ attachment, isOwner, index }: FileAttachmentProps) {
  const { t } = useTranslation();
  const fileName = attachment.file_name || attachment.name || `Attachment ${index + 1}`;
  const fileTypeInfo = getFileTypeInfo(fileName, attachment.content_type);
  const IconComponent = fileTypeInfo.icon;
  
  // Construct file URL if not provided
  const fileUrl = attachment.file_url || `https://api.baltek.net/api/files/${attachment.id}/`;
  
  // Check if it's an image and should show preview
  const isImage = fileTypeInfo.type === 'image' && fileUrl;
  
  return (
    <div 
      className={`rounded-lg border transition-all hover:shadow-sm ${
        isOwner
          ? "bg-white/10 border-white/20 hover:bg-white/15"
          : "bg-card border-border hover:border-input"
      }`}
    >
      {/* Image Preview */}
      {isImage && (
        <div className="relative mb-3">
          <img
            src={fileUrl}
            alt={fileName}
            className="w-full h-auto max-h-64 object-cover rounded-t-lg"
            loading="lazy"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={() => window.open(fileUrl, '_blank')}
              title={t('file_attachment.view_full_size')}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                link.click();
              }}
              title={t('file_attachment.download')}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* File Info */}
      <div className={`flex items-center justify-between p-3 ${isImage ? 'pt-0' : ''}`}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {!isImage && (
            <div className={`p-2 rounded-lg ${fileTypeInfo.bgColor}`}>
              <IconComponent className={`w-5 h-5 ${fileTypeInfo.color}`} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${
              isOwner ? "text-primary-foreground" : "text-foreground"
            }`}>
              {fileName}
            </div>
            {attachment.size && (
              <div className={`text-xs ${
                isOwner ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}>
                {formatFileSize(attachment.size, t)}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons for non-images */}
        {!isImage && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${
                isOwner 
                  ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => window.open(fileUrl, '_blank')}
              title={t('file_attachment.view_file')}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${
                isOwner 
                  ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                link.click();
              }}
              title={t('file_attachment.download')}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}