import React from 'react';
import { FileText, File, Image, Music, Video, Archive, Code } from 'lucide-react';

interface FileIconProps {
  className?: string;
  mimeType?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ className, mimeType }) => {
  const getIconByMimeType = (mimeType?: string) => {
    if (!mimeType) return File;
    
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('xml')) return Code;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return Archive;
    if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
    
    return File;
  };

  const IconComponent = getIconByMimeType(mimeType);
  
  return <IconComponent className={className} />;
};