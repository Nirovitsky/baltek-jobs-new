// Cache to track which jobs have been viewed
// This will persist during the session but reset on hot reload
class ViewedJobsCache {
  private viewedJobs = new Set<number>();

  markAsViewed(jobId: number) {
    this.viewedJobs.add(jobId);
  }

  isViewed(jobId: number): boolean {
    return this.viewedJobs.has(jobId);
  }

  clear() {
    this.viewedJobs.clear();
  }

  getViewedJobs() {
    return Array.from(this.viewedJobs);
  }
}

export const viewedJobsCache = new ViewedJobsCache();