import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job, JobFilters } from "@shared/schema";
import Navbar from "@/components/navbar";
import JobFiltersComponent from "@/components/job-filters";
import JobList from "@/components/job-list";
import JobDetails from "@/components/job-details";
import ChatWidget from "@/components/chat-widget";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Jobs() {
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
        limit: 20,
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

  const jobs = data?.pages.flatMap((page: any) => page?.results || []) || [];
  const selectedJob = jobs.find(job => job.id === selectedJobId) || jobs[0];

  const handleJobSelect = (job: Job) => {
    setSelectedJobId(job.id);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedJobId(null);
  };

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    setSelectedJobId(null);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={handleSearch} searchQuery={searchQuery} />
      
      <JobFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <div className="w-1/2">
            <JobList
              jobs={jobs}
              selectedJobId={selectedJobId}
              onJobSelect={handleJobSelect}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          </div>
          
          <div className="w-1/2">
            {selectedJob && (
              <JobDetails job={selectedJob} />
            )}
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
