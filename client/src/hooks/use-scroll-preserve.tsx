import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollPreserve(containerId: string = 'job-list-container') {
  const scrollPosition = useRef<number>(0);
  const location = useLocation();
  const isJobSelectionRef = useRef(false);

  // Store scroll position before navigation
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const handleScroll = () => {
      scrollPosition.current = container.scrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerId]);

  // Restore scroll position after job selection navigation
  useEffect(() => {
    if (isJobSelectionRef.current && location.pathname.includes('/jobs/')) {
      const container = document.getElementById(containerId);
      if (container) {
        // Use requestAnimationFrame to ensure DOM updates are complete
        requestAnimationFrame(() => {
          container.scrollTop = scrollPosition.current;
        });
      }
      isJobSelectionRef.current = false;
    }
  }, [location.pathname, containerId]);

  // Mark that next navigation is a job selection
  const markJobSelection = () => {
    isJobSelectionRef.current = true;
  };

  return { markJobSelection };
}