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
    <Card className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-white">
        <h2 className="text-xl font-bold text-gray-900">
          {totalCount !== undefined ? `${totalCount} Job${totalCount !== 1 ? "s" : ""} Found` : `${jobs.length} Job${jobs.length !== 1 ? "s" : ""} Found`}
        </h2>
      </div>
      
      <div className="infinite-scroll flex-1 overflow-y-auto py-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`job-card relative w-full max-w-full mx-4 my-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer focus:outline-none focus:ring-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              selectedJobId === job.id ? "selected ring-2 ring-blue-500 ring-opacity-50 shadow-lg border-blue-300 bg-blue-50/30" : "shadow-sm"
            }`}
            onClick={() => onJobSelect(job)}
          >
            <div className="relative w-full">
              <div className="flex justify-between items-start w-full mb-4">
                <div className="flex-1 pr-6 min-w-0">
                  {/* Job Title */}
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 leading-tight">
                    {job.title || 'Job Title'}
                  </h3>
                  
                  {/* Tags in Middle */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border">
                      {formatJobType(job.job_type)}
                    </span>
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border">
                      {formatWorkplaceType(job.workplace_type)}
                    </span>
                    {(job as any).minimum_education_level && (
                      <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-200">
                        {(job as any).minimum_education_level}
                      </span>
                    )}
                  </div>
                  
                  {/* Company at Bottom Left */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                      {job.organization?.logo ? (
                        <img
                          src={job.organization.logo}
                          alt={job.organization.display_name || job.organization.name || 'Company'}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <Building className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {job.organization?.display_name || job.organization?.name || 'Unknown'}
                      </p>
                      <div className="flex items-center text-xs text-gray-600 mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                        <span className="truncate">{job.location?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Salary on Top Right */}
                <div className="text-right flex-shrink-0">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-sm font-bold whitespace-nowrap">
                      {formatSalary(job)}
                    </span>
                  </div>
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
