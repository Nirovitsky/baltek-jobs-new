import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ApiClient } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import type { Job, JobFilters } from "@shared/schema";

import JobFiltersComponent from "@/components/job-filters";
import JobList from "@/components/job-list";
import JobDetails from "@/components/job-details";
import JobDetailsSkeleton from "@/components/job-details-skeleton";

import ChatWidget from "@/components/chat-widget";
import { Card, CardContent } from "@/components/ui/card";

interface JobsProps {}

export default function Jobs({}: JobsProps) {
  const { toast } = useToast();
  
  // Handle routing
  const [, setLocation] = useLocation();
  const [matchJobId, paramsJobId] = useRoute("/jobs/:id");
  const [matchJobs] = useRoute("/jobs");
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const organizationParam = urlParams.get("organization");
  const authError = urlParams.get("auth_error");
  
  // Show auth error toast if present
  useEffect(() => {
    if (authError) {
      toast({
        title: "Authentication Failed",
        description: "There was an error during login. Please try again.",
        variant: "destructive",
      });
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth_error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [authError, toast]);

  // Get selected job ID from URL parameter
  const selectedJobIdFromUrl = matchJobId && paramsJobId?.id ? parseInt(paramsJobId.id) : null;
  const [selectedJobId, setSelectedJobId] = useState<number | null>(selectedJobIdFromUrl);
  const [filters, setFilters] = useState<JobFilters>(
    organizationParam ? { organization: parseInt(organizationParam) } : {},
  );
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Sync selectedJobId with URL parameter changes
  useEffect(() => {
    if (selectedJobIdFromUrl !== selectedJobId) {
      setSelectedJobId(selectedJobIdFromUrl);
    }
  }, [selectedJobIdFromUrl]);
  
  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Track if we're currently searching (debounced query different from current query)
  const isSearching = searchQuery !== debouncedSearchQuery;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["jobs", filters, debouncedSearchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const params = {
        offset: pageParam,
        limit: 10, // Load 10 jobs initially for optimal UX
        search: debouncedSearchQuery || undefined,
        ...filters,
      };
      return ApiClient.getJobs(params);
    },
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      // If there are no results in this page, stop pagination
      if (!lastPage?.results || lastPage.results.length === 0) {
        return undefined;
      }
      
      // Calculate the current offset based on pages loaded
      const currentOffset = allPages.length * 10; // Each page has 10 items
      
      // Check if the current page has fewer items than the limit (indicating end)
      if (lastPage.results.length < 10) {
        return undefined;
      }
      
      // Check if we have reached the total count
      if (lastPage?.count && currentOffset >= lastPage.count) {
        return undefined;
      }
      
      // If we have a next URL, extract offset from it
      if (lastPage?.next) {
        try {
          const url = new URL(lastPage.next);
          const nextOffset = url.searchParams.get("offset");
          const parsedOffset = nextOffset ? parseInt(nextOffset) : currentOffset;

          return parsedOffset;
        } catch (error) {
          console.error("Error parsing next URL:", error);
          // Fallback to calculated offset
          return currentOffset;
        }
      }
      
      // If no next URL but we still have a full page of results, continue
      if (lastPage.results.length === 10) {

        return currentOffset;
      }
      

      return undefined;
    },
    initialPageParam: 0,
  });

  // Flatten and deduplicate jobs to prevent duplicate keys
  let jobs = data?.pages.flatMap((page: any) => page?.results || []) || [];
  const totalCount = (data?.pages?.[0] as any)?.count; // Get count from the first page response

  // Deduplicate jobs by ID to prevent React key conflicts
  const seenIds = new Set<number>();
  jobs = jobs.filter((job: Job) => {
    if (seenIds.has(job.id)) {
      return false;
    }
    seenIds.add(job.id);
    return true;
  });

  // Apply client-side currency filtering and update total count
  let filteredTotalCount = totalCount;
  if (filters.currency && filters.currency !== "all") {
    const originalJobsCount = jobs.length;
    jobs = jobs.filter((job: Job) => job.currency === filters.currency);
    // Estimate total count based on filtering ratio
    if (originalJobsCount > 0) {
      filteredTotalCount = Math.round(
        (totalCount || 0) * (jobs.length / originalJobsCount),
      );
    }
  }

  // Ensure selected job is valid after filtering, or select first available job
  const isSelectedJobInResults =
    selectedJobId && jobs.some((job: Job) => job.id === selectedJobId);
  const currentSelectedJobId = isSelectedJobInResults
    ? selectedJobId
    : jobs.length > 0
      ? jobs[0].id
      : null;

  const handleJobSelect = useCallback((job: Job) => {
    setSelectedJobId(job.id);
    // Update URL to reflect selected job without triggering a full navigation
    // Use replaceState to avoid adding to history stack and prevent scroll reset
    window.history.replaceState(null, '', `/jobs/${job.id}`);
  }, []);

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    // Clear selection when filters change to ensure proper job selection after filtering
    setSelectedJobId(null);
    // Navigate back to jobs list without specific job ID
    setLocation('/jobs');
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Immediately update the search query to keep input responsive
    setSearchQuery(newValue);
    // Clear job selection when search changes
    setSelectedJobId(null);
    // Navigate back to jobs list without specific job ID
    setLocation('/jobs');
  }, [setLocation]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled in real-time via onChange
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load jobs"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <JobFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <div className="layout-container-body py-4 flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-1 h-full flex-shrink-0">
            <JobList
              jobs={jobs}
              selectedJobId={currentSelectedJobId}
              onJobSelect={handleJobSelect}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              totalCount={filteredTotalCount}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              isSearching={isSearching}
              inputRef={inputRef}
            />
          </div>

          <div className="lg:col-span-2 h-full flex-shrink-0 min-w-0">
            <div className="h-full w-full">
              {isLoading ? (
                <JobDetailsSkeleton />
              ) : currentSelectedJobId ? (
                <JobDetails jobId={currentSelectedJobId} />
              ) : jobs.length > 0 ? (
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
