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
  rootMargin = "300px", // Increased for better UX
  threshold = 0.1,
  prefetchThreshold = 3, // Start prefetching when 3 jobs remain
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Simplified intersection observer handler
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        console.log("Loading more jobs...");
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Set up intersection observer for the bottom trigger element
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    observer.observe(element);
    console.log("Infinite scroll observer set up with rootMargin:", rootMargin);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, rootMargin, threshold]);

  return loadMoreRef;
}
