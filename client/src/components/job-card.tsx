import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { viewedJobsCache } from "@/lib/viewed-jobs-cache";
import { useAuth } from "@/hooks/use-auth";
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
  CheckCircle
} from "lucide-react";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  onSelect: (job: Job) => void;
  showBookmark?: boolean;
  disableViewedOpacity?: boolean;
  hideAppliedBadge?: boolean;
}

export default function JobCard({ job, isSelected = false, onSelect, showBookmark = true, disableViewedOpacity = false, hideAppliedBadge = false }: JobCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const isViewed = viewedJobsCache.isViewed(job.id, user?.id || null);
  
  const handleJobSelect = (job: Job) => {
    viewedJobsCache.markAsViewed(job.id, user?.id || null);
    onSelect(job);
  };

  const bookmarkMutation = useMutation({
    mutationFn: ({ jobId, isBookmarked }: { jobId: number; isBookmarked: boolean }) => 
      ApiClient.bookmarkJob(jobId, isBookmarked),
    onMutate: async ({ jobId, isBookmarked }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["jobs"] });
      await queryClient.cancelQueries({ queryKey: ["bookmarked-jobs"] });

      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(["jobs"]);
      const previousBookmarkedJobs = queryClient.getQueryData(["bookmarked-jobs"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["jobs"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages?.map((page: any) => ({
            ...page,
            data: page.data?.map((job: Job) => 
              job.id === jobId 
                ? { ...job, is_bookmarked: !isBookmarked }
                : job
            )
          }))
        };
      });

      // Return a context object with the snapshotted value
      return { previousJobs, previousBookmarkedJobs };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJobs) {
        queryClient.setQueryData(["jobs"], context.previousJobs);
      }
      if (context?.previousBookmarkedJobs) {
        queryClient.setQueryData(["bookmarked-jobs"], context.previousBookmarkedJobs);
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bookmark",
        variant: "destructive",
      });
    },
    onSuccess: (_, { isBookmarked }) => {
      toast({
        title: isBookmarked ? "Job unbookmarked" : "Job bookmarked",
        description: isBookmarked ? "Job removed from your bookmarks" : "Job added to your bookmarks",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have up-to-date data
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-jobs"] });
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
    
    if (min && max) return `${currencySymbol}${min.toLocaleString('de-DE')} - ${currencySymbol}${max.toLocaleString('de-DE')}`;
    if (min) return `From ${currencySymbol}${min.toLocaleString('de-DE')}`;
    if (max) return `Up to ${currencySymbol}${max.toLocaleString('de-DE')}`;
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
      data-testid={`card-job-${job.id}`}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? "ring-2 ring-primary bg-primary/5" 
          : (isViewed && !disableViewedOpacity) 
          ? "opacity-60 hover:bg-muted/80" 
          : "hover:bg-muted/80"
      }`}
      onClick={() => handleJobSelect(job)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Top Row: Job Title and Salary */}
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-tight flex-1 pr-4">
              {job.title || 'Job Title'}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {job.my_application_id && !hideAppliedBadge && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span>Applied</span>
                </div>
              )}
              <span className="text-sm font-semibold text-primary whitespace-nowrap">
                {formatSalary(job)}
              </span>
            </div>
          </div>
          
          {/* Tags Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded flex-shrink-0">
              {formatJobType(job.job_type)}
            </span>
            <span className="px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded flex-shrink-0">
              {formatWorkplaceType(job.workplace_type)}
            </span>
            {(job as any).minimum_education_level && (
              <span className="px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded flex-shrink-0">
                {(job as any).minimum_education_level}
              </span>
            )}
          </div>
          
          {/* Company Row */}
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-gray-50/30 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 flex items-center justify-center">
                {job.organization?.logo ? (
                  <img
                    src={job.organization.logo}
                    alt={job.organization.display_name || job.organization.name || 'Company'}
                    className="w-6 h-6 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center border border-border">
                    <Building className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="font-medium text-foreground text-sm truncate">
                {job.organization?.display_name || job.organization?.name || 'Unknown'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {job.location?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}