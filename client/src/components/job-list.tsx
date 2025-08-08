import type { Job } from "@shared/schema";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job-card";

import { Search } from "lucide-react";

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
    return <div></div>;
  }

  if (jobs.length === 0) {
    return <div></div>;
  }

  return (
    <div className="h-full flex flex-col w-full">
      <div className="p-6 border-b bg-gray-50 rounded-t-lg flex-shrink-0 space-y-4">
        {/* Job Count with Icon */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">
              {totalCount !== undefined
                ? totalCount.toLocaleString()
                : jobs.length.toLocaleString()}{" "}
              Job
              {(totalCount !== undefined ? totalCount : jobs.length) !== 1
                ? "s"
                : ""}{" "}
              Found
            </h2>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <form onSubmit={onSearchSubmit} className="relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={onSearchChange}
              className="pl-12 pr-4 py-3 bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  onSearchChange({
                    target: { value: "" },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            )}
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
