import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  jobs: any[]; // Array of jobs to track scroll position
  rootMargin?: string;
  threshold?: number;
  prefetchThreshold?: number; // Number of jobs before end to start prefetching
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  jobs,
  rootMargin = "100px",
  threshold = 0.1,
  prefetchThreshold = 3, // Start prefetching when 3 jobs remain
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const prefetchTriggeredRef = useRef<boolean>(false);

  // Create prefetch observer for smart prefetching
  const createPrefetchObserver = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || prefetchTriggeredRef.current) return null;

    const jobElements = document.querySelectorAll('.job-card');
    const totalJobs = jobElements.length;
    
    if (totalJobs < prefetchThreshold) return null;

    const triggerIndex = totalJobs - prefetchThreshold;
    const triggerElement = jobElements[triggerIndex];
    
    if (!triggerElement) return null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !prefetchTriggeredRef.current) {
            prefetchTriggeredRef.current = true;
            fetchNextPage();
          }
        });
      },
      {
        rootMargin: "200px", // Larger margin for prefetching
        threshold: 0.1,
      }
    );

    observer.observe(triggerElement);
    return observer;
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, jobs.length, prefetchThreshold]);

  // Regular intersection observer for the bottom loader
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Reset prefetch trigger when jobs change (new page loaded)
  useEffect(() => {
    prefetchTriggeredRef.current = false;
  }, [jobs.length]);

  // Set up prefetch observer
  useEffect(() => {
    let prefetchObserver: IntersectionObserver | null = null;
    
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      prefetchObserver = createPrefetchObserver();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (prefetchObserver) {
        prefetchObserver.disconnect();
      }
    };
  }, [createPrefetchObserver]);

  // Set up bottom loader observer
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, rootMargin, threshold]);

  return loadMoreRef;
}
