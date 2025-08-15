import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  assetUrl?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ assetUrl }) => {
  if (!assetUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = assetUrl;
    link.download = '';
    link.click();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={handleDownload}
      title="Download file"
    >
      <Download className="w-4 h-4" />
    </Button>
  );
};

interface FileSizeIndicatorProps {
  fileSize?: number;
}

export const FileSizeIndicator: React.FC<FileSizeIndicatorProps> = ({ fileSize }) => {
  if (!fileSize) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="text-xs text-muted-foreground">
      {formatFileSize(fileSize)}
    </div>
  );
};