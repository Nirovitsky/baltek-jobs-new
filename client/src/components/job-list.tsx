import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job } from "@shared/schema";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import JobSkeleton from "@/components/job-skeleton";
import JobLoadingSkeleton from "@/components/job-loading-skeleton";

import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  Building,
  Calendar,
  Loader2
} from "lucide-react";
import { useState } from "react";

interface JobListProps {
  jobs: Job[];
  selectedJobId: number | null;
  onJobSelect: (job: Job) => void;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export default function JobList({
  jobs,
  selectedJobId,
  onJobSelect,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: JobListProps) {

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    jobs,
    prefetchThreshold: 4, // Start prefetching when user has scrolled through 6 of 10 jobs
  });

  const bookmarkMutation = useMutation({
    mutationFn: ({ jobId, isBookmarked }: { jobId: number; isBookmarked: boolean }) => 
      ApiClient.bookmarkJob(jobId, isBookmarked),
    onSuccess: (_, { isBookmarked }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
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
    // Support both new API structure (payment_from/payment_to) and legacy (salary_min/salary_max)
    const min = job.payment_from || job.salary_min;
    const max = job.payment_to || job.salary_max;
    const currency = job.currency || "TMT";
    
    if (!min && !max) return "Salary not specified";
    
    const currencySymbol = currency === "EUR" ? "€" : 
                           currency === "GBP" ? "£" : 
                           currency === "USD" ? "$" : 
                           currency === "TMT" ? "M" : 
                           currency;
    
    if (min && max) return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    if (min) return `From ${currencySymbol}${min.toLocaleString()}`;
    if (max) return `Up to ${currencySymbol}${max.toLocaleString()}`;
    return "Salary not specified";
  };

  const formatJobType = (type: string) => {
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

  if (isLoading) {
    return <JobSkeleton count={10} />;
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">
          {jobs.length} Job{jobs.length !== 1 ? "s" : ""} Found
        </h2>
      </div>
      
      <div className="infinite-scroll flex-1 overflow-y-auto">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`job-card p-3 border-b hover:bg-gray-50 cursor-pointer focus:outline-none active:bg-gray-50 ${
              selectedJobId === job.id ? "selected" : ""
            }`}
            onClick={() => onJobSelect(job)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-3">
                {/* Job Title */}
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
                  {job.title || 'Job Title'}
                </h3>
                
                {/* Company Details */}
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    {job.organization?.logo ? (
                      <img
                        src={job.organization.logo}
                        alt={job.organization.display_name || job.organization.name || 'Company'}
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <Building className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-xs truncate">
                      {job.organization?.display_name || job.organization?.name || 'Unknown Company'}
                    </p>
                  </div>
                </div>
                
                {/* Location and Job Type */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {job.location?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatJobType(job.job_type)}
                  </p>
                </div>
              </div>
              
              {/* Salary on Top Right */}
              <div className="text-right">
                <span className="text-sm font-medium text-primary">
                  {formatSalary(job)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading more jobs skeleton */}
        {isFetchingNextPage && (
          <JobLoadingSkeleton count={3} />
        )}
        
        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-1">
          {!hasNextPage && jobs.length > 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No more jobs to load</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
