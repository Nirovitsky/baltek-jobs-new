import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job, JobFilters } from "@shared/schema";

import JobFiltersComponent from "@/components/job-filters";
import JobList from "@/components/job-list";
import JobDetails from "@/components/job-details";
import JobDetailsSkeleton from "@/components/job-details-skeleton";
import ChatWidget from "@/components/chat-widget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface JobsProps {}

export default function Jobs({}: JobsProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [filters, setFilters] = useState<JobFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["jobs", filters, searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const params = {
        offset: pageParam,
        limit: 10, // Load 10 jobs initially for optimal UX
        search: searchQuery || undefined,
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

  let jobs = data?.pages.flatMap((page: any) => page?.results || []) || [];
  const totalCount = (data?.pages?.[0] as any)?.count; // Get count from the first page response
  
  // Client-side currency filtering as API currency filter appears to be non-functional
  if (filters.currency) {
    jobs = jobs.filter((job: Job) => job.currency === filters.currency);
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
    <div className="h-full flex flex-col overflow-hidden">
      <JobFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="flex gap-6 h-full">
          <div className="w-[30%] h-full">
            <JobList
              jobs={jobs}
              selectedJobId={currentSelectedJobId}
              onJobSelect={handleJobSelect}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              totalCount={totalCount}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
          
          <div className="w-[70%] h-full">
            {currentSelectedJobId ? (
              <JobDetails jobId={currentSelectedJobId} />
            ) : isLoading ? (
              <JobDetailsSkeleton />
            ) : null}
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
