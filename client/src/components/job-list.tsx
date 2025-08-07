import type { Job } from "@shared/schema";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job-card";

import { 
  Search
} from "lucide-react";

interface JobListProps {
  jobs: Job[];
  selectedJobId: number | null;
  onJobSelect: (job: Job) => void;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  totalCount?: number;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
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
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: JobListProps) {

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    jobs,
    prefetchThreshold: 4, // Start prefetching when user has scrolled through 6 of 10 jobs
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col w-[400px]">
        <div className="p-4 border-b bg-white flex-shrink-0 space-y-3">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
          
          {/* Search Bar skeleton */}
          <div className="relative">
            <div className="h-10 bg-gray-100 rounded border animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3">
          {/* Job cards skeleton */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-16"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded animate-pulse w-16"></div>
                  <div className="h-6 bg-gray-100 rounded animate-pulse w-12"></div>
                  <div className="h-6 bg-gray-100 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="h-full flex flex-col w-[400px]">
        <div className="p-4 border-b bg-white flex-shrink-0 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">0 Jobs Found</h2>
          
          {/* Search Bar */}
          <form onSubmit={onSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={onSearchChange}
                className="pl-10 pr-3 py-2"
              />
            </div>
          </form>
        </div>
        
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-[400px]">
      <div className="p-4 border-b bg-white flex-shrink-0 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {totalCount !== undefined ? `${totalCount} Job${totalCount !== 1 ? "s" : ""} Found` : `${jobs.length} Job${jobs.length !== 1 ? "s" : ""} Found`}
        </h2>
        
        {/* Search Bar */}
        <form onSubmit={onSearchSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={onSearchChange}
              className="pl-10 pr-3 py-2"
            />
          </div>
        </form>
      </div>
      
      <div className="infinite-scroll flex-1 overflow-y-auto min-h-0 space-y-3 p-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSelected={selectedJobId === job.id}
            onSelect={onJobSelect}
            showBookmark={true}
          />
        ))}
        
        {/* Loading more jobs skeleton */}
        {isFetchingNextPage && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-16"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded animate-pulse w-16"></div>
                <div className="h-6 bg-gray-100 rounded animate-pulse w-12"></div>
                <div className="h-6 bg-gray-100 rounded animate-pulse w-20"></div>
              </div>
            </div>
          </Card>
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
    </div>
  );
}
