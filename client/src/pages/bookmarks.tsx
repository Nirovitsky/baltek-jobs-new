import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job, JobsListResponse } from "@shared/schema";

import JobDetails from "@/components/job-details";
import JobList from "@/components/job-list";
import JobDetailsSkeleton from "@/components/job-details-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";

interface BookmarksProps {}

export default function Bookmarks({}: BookmarksProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleJobSelect = useCallback((job: Job) => {
    setSelectedJobId(job.id);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled in real-time via onChange
  }, []);

  const jobs = bookmarkedJobs?.results || [];
  const totalCount = bookmarkedJobs?.count || 0;

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job: Job) => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.organization?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select first job when bookmarks load
  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedJobId]);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-1 h-full flex-shrink-0">
            <JobList
              jobs={filteredJobs}
              selectedJobId={selectedJobId}
              onJobSelect={handleJobSelect}
              isLoading={isLoading}
              hasNextPage={false}
              isFetchingNextPage={false}
              fetchNextPage={() => {}}
              totalCount={totalCount}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              isSearching={false}
              inputRef={inputRef}
              disableViewedOpacity={true}
            />
          </div>
          
          <div className="lg:col-span-2 h-full flex-shrink-0 min-w-0">
            <div className="h-full w-full">
              {isLoading ? (
                <JobDetailsSkeleton />
              ) : selectedJobId ? (
                <JobDetails jobId={selectedJobId} />
              ) : filteredJobs.length > 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a job to view details
                    </h3>
                    <p className="text-muted-foreground">
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