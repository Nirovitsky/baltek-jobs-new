import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Job } from "@shared/schema";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job-card";
import JobListSkeleton from "@/components/job-list-skeleton";
import JobCardSkeleton from "@/components/job-card-skeleton";

import { Search, Loader2 } from "lucide-react";

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
  isSearching?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  hideAppliedBadge?: boolean;
  disableViewedOpacity?: boolean;
  isAuthenticated?: boolean;
  onLoginPrompt?: () => void;
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
  isSearching = false,
  inputRef,
  hideAppliedBadge = false,
  disableViewedOpacity = false,
  isAuthenticated = false,
  onLoginPrompt,
}: JobListProps) {
  const { t } = useTranslation();
  // Use a ref to track the actual input value independently
  const localInputRef = useRef<HTMLInputElement>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Update input value when searchQuery changes from outside (like clearing)
  useEffect(() => {
    if (localInputRef.current && searchQuery !== localInputRef.current.value) {
      localInputRef.current.value = searchQuery;
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Update local state for display purposes only
    setLocalSearchQuery(newValue);
    // Call parent handler immediately to trigger debounce
    onSearchChange(e);
  };

  const handleClearSearch = () => {
    if (localInputRef.current) {
      localInputRef.current.value = "";
    }
    setLocalSearchQuery("");
    const clearEvent = {
      target: { value: "" },
      currentTarget: { value: "" },
      preventDefault: () => {},
      stopPropagation: () => {}
    } as React.ChangeEvent<HTMLInputElement>;
    onSearchChange(clearEvent);
  };

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    jobs,
    prefetchThreshold: 4, // Start prefetching when user has scrolled through 6 of 10 jobs
    isAuthenticated,
    onLoginPrompt,
  });

  // Always render the search bar, even during loading
  const renderSearchBar = () => (
    <div className="px-3 py-4 border-b bg-background rounded-t-lg flex-shrink-0 space-y-4">
      {/* Job Count with Icon */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Search className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary">
            {isLoading ? t('common.loading') : 
             t('jobs.job', { count: totalCount !== undefined ? totalCount : jobs.length })}{" "}
            {!isLoading && t('jobs.found')}
          </h2>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <form onSubmit={onSearchSubmit} className="relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            )}
          </div>
          <Input
            ref={localInputRef || inputRef}
            type="text"
            placeholder={t('jobs.search_placeholder')}
            defaultValue={searchQuery}
            onChange={handleLocalSearchChange}
            className="pl-12 pr-4 py-3 bg-background border-border rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck="false"
          />
          {(localInputRef.current?.value || localSearchQuery) && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col w-full max-w-[400px]">
        {renderSearchBar()}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 p-3">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="h-full flex flex-col w-full max-w-[400px]">
        {renderSearchBar()}
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">{t('jobs.no_jobs_found')}</h3>
            <p className="text-muted-foreground">{t('jobs.try_adjusting_filters')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full max-w-[400px]">
      {renderSearchBar()}

      <div id="job-list-container" className="infinite-scroll flex-1 overflow-y-auto min-h-0 space-y-3 p-3" style={{ scrollBehavior: 'auto' }}>
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSelected={selectedJobId === job.id}
            onSelect={onJobSelect}
            showBookmark={true}
            hideAppliedBadge={hideAppliedBadge}
            disableViewedOpacity={disableViewedOpacity}
          />
        ))}

        {/* Loading more jobs skeleton */}
        {isFetchingNextPage && (
          <JobCardSkeleton />
        )}

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {!isAuthenticated && jobs.length >= 20 ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">{t('common.guest_viewed_jobs')}</p>
              <p className="text-xs text-muted-foreground">{t('common.scroll_sign_in')}</p>
            </div>
          ) : hasNextPage && !isFetchingNextPage ? (
            <p className="text-sm text-muted-foreground">{t('common.scroll_more_jobs')}</p>
          ) : !hasNextPage && jobs.length > 0 ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('common.no_more_jobs')}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
