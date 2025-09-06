import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AttachmentCard from "@/components/AttachmentCard";
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

const formatFileSize = (bytes: number, t: any): string => {
  if (bytes === 0) return '0 ' + t('file_attachment.bytes');
  const k = 1024;
  const sizes = t('file_attachment.file_sizes', { returnObjects: true }) as string[];
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
  const { t } = useTranslation();
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 shrink-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadingFiles}
        title={t('file_attachment.attach_files')}
      >
        {uploadingFiles ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
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
  onCancelUpload: (index: number) => void;
  uploadingFiles: boolean;
}

export function ComposerAttachments({ 
  attachedFiles, 
  uploadProgress, 
  onRemoveFile, 
  onCancelUpload,
  uploadingFiles 
}: ComposerAttachmentsProps) {
  const { t } = useTranslation();
  if (attachedFiles.length === 0 && uploadProgress.length === 0) {
    return null;
  }

  return (
    <div className="p-3 border-t border-border space-y-3">
      {/* Combined Files Display */}
      {(uploadProgress.length > 0 || attachedFiles.length > 0) && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Paperclip className="w-3 h-3" />
              {uploadProgress.length > 0 && attachedFiles.length > 0
                ? `${attachedFiles.length} ready, ${uploadProgress.length} uploading`
                : uploadProgress.length > 0
                ? `Uploading ${uploadProgress.length} file${uploadProgress.length > 1 ? 's' : ''}...`
                : `Ready to send (${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''})`
              }
            </div>
            {uploadProgress.length > 0 && (
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
            )}
          </div>

          {/* Combined Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* Uploaded Files */}
            {attachedFiles.map((file) => {
              const fileTypeInfo = getFileTypeInfo(file.name, file.content_type);
              const IconComponent = fileTypeInfo.icon;
              const isImage = fileTypeInfo.type === 'image' && file.file_url;

              return (
                <div
                  key={file.id}
                  className="relative group animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                >
                  {/* Image Thumbnail */}
                  {isImage ? (
                    <div className="relative">
                      <img
                        src={file.file_url}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors duration-200" />
                    </div>
                  ) : (
                    /* File Icon */
                    <div className="flex items-center justify-center h-20">
                      <div className={`p-3 rounded-xl ${fileTypeInfo.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className={`w-8 h-8 ${fileTypeInfo.color}`} />
                      </div>
                    </div>
                  )}
                  
                  {/* File Info */}
                  <div className="mt-3 text-center space-y-1">
                    <div className="text-xs font-semibold text-foreground truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size, t)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                    onClick={() => onRemoveFile(file.id)}
                    title={t('file_attachment.remove_file')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}

            {/* Uploading Files */}
            {uploadProgress.map((file, index) => {
              const fileTypeInfo = getFileTypeInfo(file.name);
              const IconComponent = fileTypeInfo.icon;

              return (
                <div key={`upload-${index}`} className="relative group animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-300">
                    {/* Upload Progress Circle */}
                    <div className="flex items-center justify-center h-20 relative">
                      <div className={`p-3 rounded-xl ${fileTypeInfo.bgColor} opacity-50`}>
                        <IconComponent className={`w-8 h-8 ${fileTypeInfo.color}`} />
                      </div>
                      
                      {/* Progress Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-blue-200 dark:text-blue-800"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="transparent"
                              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                            />
                            <path
                              className={file.progress === -1 ? "text-red-500" : "text-blue-600 dark:text-blue-400"}
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="transparent"
                              strokeDasharray={`${file.progress === -1 ? 0 : file.progress}, 100`}
                              strokeLinecap="round"
                              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                              style={{
                                transition: 'stroke-dasharray 0.3s ease-in-out'
                              }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                              {file.progress === -1 ? "!" : `${file.progress}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* File Info */}
                    <div className="mt-3 text-center space-y-1">
                      <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {file.progress === -1 ? t('file_attachment.upload_failed') : t('file_attachment.uploading')}
                      </div>
                    </div>
                  </div>

                  {/* Cancel/Error Button */}
                  <div className="absolute -top-2 -right-2">
                    {file.progress === -1 ? (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full bg-gray-500 hover:bg-red-500 text-white border-0 shadow-lg transition-colors duration-200"
                        onClick={() => onCancelUpload(index)}
                        title={t('file_attachment.cancel_upload')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
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
      {attachments.map((attachment, index) => (
        <AttachmentCard
          key={attachment.id || index}
          file={attachment}
          variant="message"
          isOwner={isOwner}
          className="w-full max-w-sm"
        />
      ))}
    </div>
  );
}