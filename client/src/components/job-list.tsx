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
  totalCount?: number;
}

export default function JobList({
  jobs,
  selectedJobId,
  onJobSelect,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  totalCount,
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
          {totalCount !== undefined ? `${totalCount} Job${totalCount !== 1 ? "s" : ""} Found` : `${jobs.length} Job${jobs.length !== 1 ? "s" : ""} Found`}
        </h2>
      </div>
      
      <div className="infinite-scroll flex-1 overflow-y-auto">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`job-card px-6 py-5 border-b hover:bg-blue-50/30 cursor-pointer transition-all duration-200 border-l-4 ${
              selectedJobId === job.id 
                ? "bg-blue-50 border-l-blue-500 shadow-sm" 
                : "border-l-transparent hover:border-l-blue-300"
            }`}
            onClick={() => onJobSelect(job)}
          >
            <div className="space-y-4">
              {/* Header: Job Title and Bookmark */}
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">
                    {job.title || 'Job Title'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {job.organization?.display_name || job.organization?.name || 'Unknown Company'}
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleBookmark(e, job.id, job.is_bookmarked || false)}
                  className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Bookmark 
                    className={`w-5 h-5 transition-colors ${
                      job.is_bookmarked 
                        ? "fill-blue-500 text-blue-500" 
                        : "text-gray-400 hover:text-blue-500"
                    }`} 
                  />
                </button>
              </div>

              {/* Salary Badge */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {formatSalary(job)}
                </div>
                
                {job.my_application_id && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Applied
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {formatJobType(job.job_type)}
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {formatWorkplaceType(job.workplace_type)}
                </Badge>
                {job.skills && job.skills.slice(0, 2).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs px-2 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Footer: Location and Time */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{job.location?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{job.created_at ? getTimeAgo(job.created_at) : 'Recently'}</span>
                </div>
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
