import React from 'react';
import { FileIcon } from '../ReactFileUtilities';

import { DownloadButton, FileSizeIndicator } from './components';

export interface Attachment {
  id?: number;
  title?: string;
  file_name?: string;
  name?: string;
  asset_url?: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
  size?: number;
}

export type FileAttachmentProps = {
  attachment: Attachment;
};

const UnMemoizedFileAttachment = ({ attachment }: FileAttachmentProps) => {
  const fileName = attachment.title || attachment.file_name || attachment.name || 'Attachment';
  const fileUrl = attachment.asset_url || attachment.file_url;
  const fileSize = attachment.file_size || attachment.size;

  return (
    <div className="str-chat__message-attachment-file--item flex items-center space-x-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors" data-testid="attachment-file">
      <FileIcon className="str-chat__file-icon w-5 h-5 text-primary" mimeType={attachment.mime_type} />
      <div className="str-chat__message-attachment-file--item-text flex-1 min-w-0">
        <div className="str-chat__message-attachment-file--item-first-row flex items-center justify-between">
          <div
            className="str-chat__message-attachment-file--item-name text-sm font-medium truncate"
            data-testid="file-title"
            title={fileName}
          >
            {fileName}
          </div>
          <DownloadButton assetUrl={fileUrl} />
        </div>
        <FileSizeIndicator fileSize={fileSize} />
      </div>
    </div>
  );
};

export const FileAttachment = React.memo(
  UnMemoizedFileAttachment,
) as typeof UnMemoizedFileAttachment;