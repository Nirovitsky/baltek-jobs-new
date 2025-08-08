import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job, JobFilters } from "@shared/schema";

import JobFiltersComponent from "@/components/job-filters";
import JobList from "@/components/job-list";
import JobDetails from "@/components/job-details";

import ChatWidget from "@/components/chat-widget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface JobsProps {}

export default function Jobs({}: JobsProps) {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const organizationParam = urlParams.get('organization');
  
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [filters, setFilters] = useState<JobFilters>(
    organizationParam ? { organization: parseInt(organizationParam) } : {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    getNextPageParam: (lastPage: any) => {
      // Check if there's a next page URL, extract offset from it
      if (lastPage?.next) {
        const url = new URL(lastPage.next);
        const nextOffset = url.searchParams.get('offset');
        return nextOffset ? parseInt(nextOffset) : undefined;
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
      filteredTotalCount = Math.round((totalCount || 0) * (jobs.length / originalJobsCount));
    }
  }
  
  // Ensure selected job is valid after filtering, or select first available job
  const isSelectedJobInResults = selectedJobId && jobs.some((job: Job) => job.id === selectedJobId);
  const currentSelectedJobId = isSelectedJobInResults ? selectedJobId : (jobs.length > 0 ? jobs[0].id : null);

  const handleJobSelect = (job: Job) => {
    setSelectedJobId(job.id);
  };



  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    // Clear selection when filters change to ensure proper job selection after filtering
    setSelectedJobId(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedJobId(null); // Clear selection when search changes
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled in real-time via onChange
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Failed to load jobs"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-67px)] flex flex-col overflow-hidden">
      <JobFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="flex gap-6 h-full">
          <div className="w-[400px] h-full flex-shrink-0">
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
            />
          </div>
          
          <div className="w-[calc(100%-424px)] h-full flex-shrink-0 min-w-0">
            <div className="h-full w-full">
              {currentSelectedJobId ? (
                <JobDetails jobId={currentSelectedJobId} />
              ) : jobs.length === 0 && isLoading ? (
                <Card className="h-full w-full">
                  <div className="p-6 border-b">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-64"></div>
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : jobs.length > 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a job to view details</h3>
                    <p className="text-gray-600">Choose a job from the list to see more information</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
