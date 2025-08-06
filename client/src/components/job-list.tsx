import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job } from "@shared/schema";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
    prefetchThreshold: 3, // Start prefetching when user has scrolled through 12 of 15 jobs
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
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        </CardContent>
      </Card>
    );
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
    <Card>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {jobs.length} Job{jobs.length !== 1 ? "s" : ""} Found
        </h2>
      </div>
      
      <div className="infinite-scroll">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`job-card p-4 border-b hover:bg-gray-50 cursor-pointer focus:outline-none active:bg-gray-50 ${
              selectedJobId === job.id ? "selected" : ""
            }`}
            onClick={() => onJobSelect(job)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                {/* Job Title */}
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 mb-3">
                  {job.title || 'Job Title'}
                </h3>
                
                {/* Job Type */}
                <div className="mb-3">
                  <span className="text-sm text-gray-500">
                    {formatJobType(job.job_type)}
                  </span>
                </div>
                
                {/* Skills Tags */}
                <div className="flex items-center space-x-2 mb-4">
                  {job.skills && job.skills.length > 0 ? (
                    <>
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 4} more
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      No skills listed
                    </Badge>
                  )}
                </div>
                
                {/* Company Details at Bottom */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    {job.organization?.logo ? (
                      <img
                        src={job.organization.logo}
                        alt={job.organization.display_name || job.organization.name || 'Company'}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Building className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {job.organization?.display_name || job.organization?.name || 'Unknown Company'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location?.name || 'Unknown'}, {job.location?.country || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Salary on Top Right */}
              <div className="text-right">
                <span className="text-lg font-medium text-primary">
                  {formatSalary(job)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="p-4 text-center">
          {isFetchingNextPage && (
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more jobs...</span>
            </div>
          )}
          {!hasNextPage && jobs.length > 0 && (
            <p className="text-sm text-gray-500">No more jobs to load</p>
          )}
        </div>
      </div>
    </Card>
  );
}
