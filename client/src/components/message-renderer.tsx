import React from "react";
import LinkPreviewCard from "./link-preview-card";

interface MessageRendererProps {
  text: string;
  className?: string;
}

export default function MessageRenderer({ text, className }: MessageRendererProps) {
  // More comprehensive regex to match various job URL patterns
  const jobUrlRegex = /(https?:\/\/[^\s]+(?:\/jobs?\/\d+|\/job\/\d+|\/position\/\d+|\/vacancy\/\d+)[^\s]*)/gi;
  
  // Check if the message contains any job URLs
  const jobUrls = text.match(jobUrlRegex);
  
  if (!jobUrls || jobUrls.length === 0) {
    // No job URLs found, render text normally with regular link detection
    return (
      <div className={`text-sm ${className}`}>
        {renderTextWithLinks(text)}
      </div>
    );
  }

  // Split text by job URLs and render each part
  const parts = text.split(jobUrlRegex);
  
  return (
    <div className={`space-y-3 ${className}`}>
      {parts.map((part, index) => {
        // Reset regex for testing each part
        const testRegex = new RegExp(jobUrlRegex.source, jobUrlRegex.flags);
        
        // Check if this part is a job URL
        if (testRegex.test(part)) {
          return (
            <div key={index} className="my-3 -mx-3">
              <LinkPreviewCard
                url={part.trim()}
                className="w-full max-w-none shadow-sm"
              />
            </div>
          );
        } else if (part.trim()) {
          // Render regular text with other links
          return (
            <div key={index} className="break-words text-sm">
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