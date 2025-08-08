// Cache to track which jobs have been viewed per user
// Persists in localStorage across reloads and hot reloads
class ViewedJobsCache {
  private getStorageKey(userId: number): string {
    return `viewed_jobs_user_${userId}`;
  }

  private loadViewedJobs(userId: number): Set<number> {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId));
      if (stored) {
        const jobIds = JSON.parse(stored);
        return new Set(jobIds);
      }
    } catch (error) {
      console.warn('Failed to load viewed jobs from localStorage:', error);
    }
    return new Set();
  }

  private saveViewedJobs(userId: number, viewedJobs: Set<number>) {
    try {
      const jobIds = Array.from(viewedJobs);
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(jobIds));
    } catch (error) {
      console.warn('Failed to save viewed jobs to localStorage:', error);
    }
  }

  markAsViewed(jobId: number, userId: number | null) {
    if (!userId) return;
    
    const viewedJobs = this.loadViewedJobs(userId);
    viewedJobs.add(jobId);
    this.saveViewedJobs(userId, viewedJobs);
  }

  isViewed(jobId: number, userId: number | null): boolean {
    if (!userId) return false;
    
    const viewedJobs = this.loadViewedJobs(userId);
    return viewedJobs.has(jobId);
  }

  clear(userId: number | null) {
    if (!userId) return;
    
    try {
      localStorage.removeItem(this.getStorageKey(userId));
    } catch (error) {
      console.warn('Failed to clear viewed jobs from localStorage:', error);
    }
  }

  getViewedJobs(userId: number | null): number[] {
    if (!userId) return [];
    
    const viewedJobs = this.loadViewedJobs(userId);
    return Array.from(viewedJobs);
  }
}

export const viewedJobsCache = new ViewedJobsCache();