import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Paperclip,
  X,
  FileText,
  Download,
  Image as ImageIcon,
  FileVideo,
  Music,
  Archive,
  File,
  Eye,
  Loader2,
} from "lucide-react";

// Types
interface AttachedFile {
  id: number;
  name: string;
  size: number;
  file_url?: string;
  content_type?: string;
}

interface UploadProgress {
  name: string;
  progress: number;
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
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Component 1: ComposerAddAttachment - Button to add attachments
interface ComposerAddAttachmentProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingFiles: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ComposerAddAttachment({ 
  onFileSelect, 
  uploadingFiles, 
  fileInputRef 
}: ComposerAddAttachmentProps) {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 shrink-0"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadingFiles}
        title="Attach files"
      >
        {uploadingFiles ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Paperclip className="w-4 h-4" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFileSelect}
        accept="image/*,application/pdf,.doc,.docx,.txt,.rtf"
      />
    </>
  );
}

// Component 2: ComposerAttachments - Show thumbnails/previews before sending
interface ComposerAttachmentsProps {
  attachedFiles: AttachedFile[];
  uploadProgress: UploadProgress[];
  onRemoveFile: (fileId: number) => void;
  uploadingFiles: boolean;
}

export function ComposerAttachments({ 
  attachedFiles, 
  uploadProgress, 
  onRemoveFile, 
  uploadingFiles 
}: ComposerAttachmentsProps) {
  if (attachedFiles.length === 0 && uploadProgress.length === 0) {
    return null;
  }

  return (
    <div className="p-3 border-t border-border space-y-2">
      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadProgress.map((file, index) => (
            <div key={index} className="flex items-center space-x-2 bg-card border border-border rounded-lg p-2 min-w-0 max-w-48">
              <div className="relative w-8 h-8 flex-shrink-0">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  />
                  <path
                    className={file.progress === -1 ? "text-red-500" : "text-primary"}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${file.progress === -1 ? 0 : file.progress}, 100`}
                    strokeLinecap="round"
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {file.progress === -1 ? "!" : `${file.progress}%`}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {file.progress === -1 ? "Failed" : "Uploading..."}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Attached Files ({attachedFiles.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file) => {
              const fileTypeInfo = getFileTypeInfo(file.name, file.content_type);
              const IconComponent = fileTypeInfo.icon;
              const isImage = fileTypeInfo.type === 'image' && file.file_url;

              return (
                <div
                  key={file.id}
                  className="relative group max-w-32"
                >
                  <div className="bg-card border border-border rounded-lg p-2 shadow-sm hover:shadow-md transition-all">
                    {/* Image Thumbnail */}
                    {isImage ? (
                      <div className="relative">
                        <img
                          src={file.file_url}
                          alt={file.name}
                          className="w-24 h-16 object-cover rounded border"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      /* File Icon */
                      <div className="flex items-center justify-center">
                        <div className={`p-2 rounded-lg ${fileTypeInfo.bgColor}`}>
                          <IconComponent className={`w-8 h-8 ${fileTypeInfo.color}`} />
                        </div>
                      </div>
                    )}
                    
                    {/* File Info */}
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveFile(file.id)}
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Component 3: UserMessageAttachments - Display attachments in chat bubbles
interface UserMessageAttachmentsProps {
  attachments: Array<{
    id?: string | number;
    file_name?: string;
    name?: string;
    file_url?: string;
    size?: number;
    content_type?: string;
  }>;
  isOwner: boolean;
}

export function UserMessageAttachments({ attachments, isOwner }: UserMessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const fileName = attachment.file_name || attachment.name || `Attachment ${index + 1}`;
        const fileTypeInfo = getFileTypeInfo(fileName, attachment.content_type);
        const IconComponent = fileTypeInfo.icon;
        
        // Construct file URL if not provided
        const fileUrl = attachment.file_url || `https://api.baltek.net/api/files/${attachment.id}/`;
        
        // Check if it's an image and should show preview
        const isImage = fileTypeInfo.type === 'image' && fileUrl;
        
        return (
          <div 
            key={attachment.id || index}
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
                    title="View full size"
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
                    title="Download"
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
                      {formatFileSize(attachment.size)}
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
                    title="View file"
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
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}