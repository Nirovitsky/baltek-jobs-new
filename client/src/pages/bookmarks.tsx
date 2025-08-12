import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job, JobsListResponse } from "@shared/schema";

import JobDetails from "@/components/job-details";
import JobCard from "@/components/job-card";
import JobListSkeleton from "@/components/job-list-skeleton";
import JobDetailsSkeleton from "@/components/job-details-skeleton";
import JobCardSkeleton from "@/components/job-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bookmark } from "lucide-react";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";

interface BookmarksProps {}

export default function Bookmarks({}: BookmarksProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const {
    data: bookmarkedJobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookmarked-jobs"],
    queryFn: async () => {
      return ApiClient.getBookmarkedJobs() as Promise<JobsListResponse>;
    },
  });

  const handleJobSelect = (job: Job) => {
    setSelectedJobId(job.id);
  };

  const jobs = bookmarkedJobs?.results || [];
  const totalCount = bookmarkedJobs?.count || 0;

  // Auto-select first job when bookmarks load
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  if (error) {
    return (
      <div className="h-full p-6">
        <BreadcrumbNavigation />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load bookmarked jobs. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4 flex-1 overflow-hidden">
        <div className="flex gap-6 h-full">
          <div className="w-[30%] h-full flex-shrink-0">
            {isLoading ? (
              <div className="h-full flex flex-col w-full">
                <div className="px-3 py-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="h-full flex flex-col w-full">
                <div className="px-3 py-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Bookmark className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">0 Bookmarks</h2>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <div className="text-center">
                    <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarked jobs</h3>
                    <p className="text-gray-600">Jobs you bookmark will appear here for easy access.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col w-full">
                <div className="px-3 py-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bookmark className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-primary">
                        {totalCount.toLocaleString()} Bookmark{totalCount !== 1 ? "s" : ""}
                      </h2>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3">
                  {jobs.map((job: Job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJobId === job.id}
                      onSelect={handleJobSelect}
                      showBookmark={false}
                      disableViewedOpacity={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="w-[70%] h-full flex-shrink-0 min-w-0 pl-8">
            <div className="h-full w-full">
              {isLoading ? (
                <JobDetailsSkeleton />
              ) : selectedJobId ? (
                <JobDetails jobId={selectedJobId} />
              ) : jobs.length > 0 ? (
                <div className="w-[70%] h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a job to view details
                    </h3>
                    <p className="text-gray-600">
                      Choose a job from the list to see more information
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}