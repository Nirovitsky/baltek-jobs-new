import React from "react";
import LinkPreviewCard from "./link-preview-card";

interface MessageRendererProps {
  text: string;
  className?: string;
}

export default function MessageRenderer({ text, className }: MessageRendererProps) {
  // Regular expression to match job URLs
  const jobUrlRegex = /(https?:\/\/[^\s]+\/jobs\/\d+[^\s]*)/g;
  
  // Check if the message contains any job URLs
  const jobUrls = text.match(jobUrlRegex);
  
  if (!jobUrls || jobUrls.length === 0) {
    // No job URLs found, render text normally with regular link detection
    return (
      <div className={className}>
        {renderTextWithLinks(text)}
      </div>
    );
  }

  // Split text by job URLs and render each part
  const parts = text.split(jobUrlRegex);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {parts.map((part, index) => {
        // Check if this part is a job URL
        if (jobUrlRegex.test(part)) {
          return (
            <LinkPreviewCard
              key={index}
              url={part}
              className="not-prose"
            />
          );
        } else if (part.trim()) {
          // Render regular text with other links
          return (
            <div key={index}>
              {renderTextWithLinks(part)}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// Helper function to render text with regular links (non-job URLs)
function renderTextWithLinks(text: string) {
  // Regular expression to match URLs (excluding job URLs which are handled separately)
  const urlRegex = /(https?:\/\/[^\s]+(?![^\s]*\/jobs\/\d+))/g;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {part}
        </a>
      );
    } else {
      // Preserve line breaks and format text
      return (
        <span key={index} className="whitespace-pre-wrap break-words">
          {part}
        </span>
      );
    }
  });
}