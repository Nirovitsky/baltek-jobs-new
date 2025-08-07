import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job, JobsListResponse } from "@shared/schema";

import JobDetails from "@/components/job-details";
import JobCard from "@/components/job-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bookmark } from "lucide-react";

interface BookmarksProps {}

export default function Bookmarks({}: BookmarksProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const {
    data: bookmarkedJobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookmarked-jobs"],
    queryFn: async () => {
      return ApiClient.getBookmarkedJobs() as Promise<JobsListResponse>;
    },
  });

  const handleJobSelect = (job: Job) => {
    setSelectedJobId(job.id);
  };

  const jobs = bookmarkedJobs?.results || [];
  const totalCount = bookmarkedJobs?.count || 0;

  if (error) {
    return (
      <div className="h-full p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load bookmarked jobs. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="flex gap-6 h-full">
          <div className="w-[400px] h-full flex-shrink-0">
            {isLoading ? (
              <Card className="h-full flex flex-col w-[400px]">
                <div className="p-4 border-b flex-shrink-0 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3">
                  {Array.from({ length: 6 }).map((_, i) => (
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
              </Card>
            ) : jobs.length === 0 ? (
              <div className="h-full flex flex-col w-[400px]">
                <div className="p-4 border-b bg-white flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    Bookmarked Jobs ({totalCount})
                  </h2>
                </div>
                
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <div className="text-center">
                    <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarked jobs</h3>
                    <p className="text-gray-600">Jobs you bookmark will appear here for easy access.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col w-[400px]">
                <div className="p-4 border-b bg-white flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    Bookmarked Jobs ({totalCount})
                  </h2>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3">
                  {jobs.map((job: Job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJobId === job.id}
                      onSelect={handleJobSelect}
                      showBookmark={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="w-[calc(100%-424px)] h-full flex-shrink-0 min-w-0">
            <div className="h-full w-full">
              {selectedJobId ? (
                <JobDetails jobId={selectedJobId} />
              ) : jobs.length === 0 && isLoading ? (
                <Card className="h-full w-full">
                  <div className="p-6 border-b">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-64"></div>
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : jobs.length > 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a job to view details</h3>
                    <p className="text-gray-600">Choose a bookmarked job from the list to see more information</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}