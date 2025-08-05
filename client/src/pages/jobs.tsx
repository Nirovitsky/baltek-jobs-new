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
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        search: searchQuery || undefined,
        ...filters,
      };
      return ApiClient.getJobs(params);
    },
    getNextPageParam: (lastPage: any) => {
      return lastPage?.next ? (lastPage.page || 1) + 1 : undefined;
    },
    initialPageParam: 1,
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
      
      {/* API Status Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Demo Mode: The external Baltek API is currently unavailable. You're viewing sample job listings to explore the interface.
          </AlertDescription>
        </Alert>
      </div>

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
