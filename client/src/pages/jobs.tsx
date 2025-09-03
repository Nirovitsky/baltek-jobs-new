import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ApiClient } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useScrollPreserve } from "@/hooks/use-scroll-preserve";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import type { Job, JobFilters } from "@shared/schema";

import JobFiltersComponent from "@/components/job-filters";
import JobList from "@/components/job-list";
import JobDetails from "@/components/job-details";
import JobDetailsSkeleton from "@/components/job-details-skeleton";

import ChatWidget from "@/components/chat-widget";
import LoginPromptModal from "@/components/login-prompt-modal";
import { Card, CardContent } from "@/components/ui/card";

interface JobsProps {}

export default function Jobs({}: JobsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { markJobSelection } = useScrollPreserve('job-list-container');
  const { isAuthenticated } = useAuth();
  
  // Handle routing
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Get URL parameters using React Router's location.search
  const urlParams = new URLSearchParams(location.search);
  const organizationParam = urlParams.get("organization");
  const authError = urlParams.get("auth_error");
  
  // Show auth error toast if present
  useEffect(() => {
    if (authError) {
      toast({
        title: t('jobs.authentication_failed'),
        description: t('jobs.auth_error_description'),
        variant: "destructive",
      });
      // Clean up URL using React Router navigation
      const newParams = new URLSearchParams(location.search);
      newParams.delete('auth_error');
      const newSearch = newParams.toString();
      navigate(location.pathname + (newSearch ? `?${newSearch}` : ''), { replace: true });
    }
  }, [authError, toast, location.search, navigate]);

  // Get selected job ID from URL parameter for initial load only
  const selectedJobIdFromUrl = params.id ? parseInt(params.id) : null;
  const [selectedJobId, setSelectedJobId] = useState<number | null>(selectedJobIdFromUrl);
  const [initialUrlJobId] = useState<number | null>(selectedJobIdFromUrl);
  const [filters, setFilters] = useState<JobFilters>(
    organizationParam ? { organization: parseInt(organizationParam) } : {},
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Only sync with URL on browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      // Browser navigation detected
      const newJobId = window.location.pathname.includes('/jobs/') 
        ? parseInt(window.location.pathname.split('/jobs/')[1]) || null
        : null;
      setSelectedJobId(newJobId);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
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
      
      // For unauthenticated users, limit to 20 jobs (2 pages)
      if (!isAuthenticated && currentOffset >= 20) {
        return undefined;
      }
      
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
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false, // Disable auto-refetch on window focus
    // Enable immediate refetch when queryKey changes (filters change)
    refetchOnMount: true,
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
    // Mark this as a job selection to preserve scroll position
    markJobSelection();
    // Update URL without navigation to preserve scroll position
    const searchParams = new URLSearchParams(location.search);
    const newUrl = `/jobs/${job.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    // Use history.replaceState instead of navigate to avoid scroll reset
    window.history.replaceState(null, '', newUrl);
  }, [location.search, markJobSelection]);

  const handleFiltersChange = useCallback((newFilters: JobFilters) => {
    
    // Reset infinite query data when filters change to prevent stale pagination
    queryClient.removeQueries({ queryKey: ["jobs"] });
    
    setFilters(newFilters);
    // Clear selection when filters change to ensure proper job selection after filtering
    setSelectedJobId(null);
    // Navigate back to jobs list without specific job ID, maintaining other URL params if any
    const searchParams = new URLSearchParams(location.search);
    // Don't navigate to prevent URL-triggered re-renders that reset filters
    // navigate(`/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }, [filters, queryClient, location.search, navigate]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Reset infinite query data when search changes to prevent stale pagination
    queryClient.removeQueries({ queryKey: ["jobs"] });
    
    // Immediately update the search query to keep input responsive
    setSearchQuery(newValue);
    // Clear job selection when search changes
    setSelectedJobId(null);
    // Don't navigate to prevent URL-triggered re-renders that reset search
    // const searchParams = new URLSearchParams(location.search);
    // navigate(`/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  }, [queryClient]);

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
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 h-full">
          <div className="lg:col-span-1 h-auto lg:h-full flex-shrink-0 order-1">
            <div className="h-[50vh] lg:h-full">
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
                isAuthenticated={isAuthenticated}
                onLoginPrompt={() => setShowLoginModal(true)}
              />
            </div>
          </div>

          <div className="lg:col-span-2 h-auto lg:h-full max-h-[50vh] lg:max-h-[calc(100vh-175px)] flex-shrink-0 min-w-0 order-2">
            <div className="h-full lg:max-h-[calc(100vh-175px)] w-full overflow-hidden">
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
      
      <LoginPromptModal 
        isOpen={showLoginModal} 
        onOpenChange={setShowLoginModal} 
      />
    </div>
  );
}
