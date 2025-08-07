import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  Building,
  Calendar,
  Loader2,
  ExternalLink
} from "lucide-react";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onSelect: (job: Job) => void;
  showBookmark?: boolean;
}

export default function JobCard({ job, isSelected = false, onSelect, showBookmark = true }: JobCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: ({ jobId, isBookmarked }: { jobId: number; isBookmarked: boolean }) => 
      ApiClient.bookmarkJob(jobId, isBookmarked),
    onSuccess: (_, { isBookmarked }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-jobs"] });
      toast({
        title: isBookmarked ? "Job unbookmarked" : "Job bookmarked",
        description: isBookmarked ? "Job removed from your bookmarks" : "Job added to your bookmarks",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const handleBookmark = (e: React.MouseEvent, jobId: number, isBookmarked: boolean) => {
    e.stopPropagation();
    bookmarkMutation.mutate({ jobId, isBookmarked });
  };

  const formatSalary = (job: Job) => {
    const min = job.payment_from || job.salary_min;
    const max = job.payment_to || job.salary_max;
    const currency = job.currency || "TMT";
    
    if (!min && !max) return "Salary not specified";
    
    const currencySymbol = currency === "EUR" ? "€" : 
                           currency === "GBP" ? "£" : 
                           currency === "USD" ? "$" : 
                           currency === "TMT" ? "TMT" : 
                           currency;
    
    if (min && max) return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    if (min) return `From ${currencySymbol}${min.toLocaleString()}`;
    if (max) return `Up to ${currencySymbol}${max.toLocaleString()}`;
    return "Salary not specified";
  };

  const formatJobType = (type: string) => {
    return type.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatWorkplaceType = (type: string) => {
    return type.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-gray-50/80"
      }`}
      onClick={() => onSelect(job)}
    >
      <CardContent className="p-4">
        <div className="relative w-full">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1 pr-6 min-w-0">
              {/* Job Title */}
              <h3 className="font-semibold text-base text-gray-900 line-clamp-2 mb-3 leading-tight">
                {job.title || 'Job Title'}
              </h3>
              
              {/* Tags in Middle */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {formatJobType(job.job_type)}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {formatWorkplaceType(job.workplace_type)}
                </span>
                <div className="text-xs text-gray-600 flex items-center bg-gray-50 px-2 py-1 rounded-md">
                  <MapPin className="w-3 h-3 mr-1.5 text-gray-500" />
                  <span className="whitespace-nowrap font-medium">{job.location?.name || 'Unknown'}</span>
                </div>
                {(job as any).minimum_education_level && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {(job as any).minimum_education_level}
                  </span>
                )}
              </div>
              
              {/* Company at Bottom Left */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  {job.organization?.logo ? (
                    <img
                      src={job.organization.logo}
                      alt={job.organization.display_name || job.organization.name || 'Company'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Building className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Link
                    href={`/company/${job.organization?.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-gray-900 text-sm truncate hover:text-primary transition-colors cursor-pointer"
                  >
                    {job.organization?.display_name || job.organization?.name || 'Unknown'}
                  </Link>
                  <Link
                    href={`/company/${job.organization?.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right side content */}
            <div className="text-right flex-shrink-0">
              {/* Salary on Top Right */}
              <span className="text-sm font-semibold text-primary whitespace-nowrap">
                {formatSalary(job)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}