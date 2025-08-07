import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job } from "@shared/schema";

import JobDetails from "@/components/job-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bookmark, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      return ApiClient.getBookmarkedJobs();
    },
  });

  const handleJobSelect = (jobId: number) => {
    setSelectedJobId(jobId);
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
    <div className="h-full flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="flex gap-6 h-full">
          <div className="w-[400px] h-full flex-shrink-0">
            {isLoading ? (
              <Card className="h-full flex flex-col w-[400px]">
                <div className="p-4 border-b flex-shrink-0 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-6 py-5 border-b border-gray-100">
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
                    </div>
                  ))}
                </div>
              </Card>
            ) : jobs.length === 0 ? (
              <Card className="h-full flex flex-col w-[400px]">
                <div className="p-4 border-b flex-shrink-0">
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
              </Card>
            ) : (
              <Card className="h-full flex flex-col w-[400px]">
                <CardHeader className="p-4 border-b flex-shrink-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    Bookmarked Jobs ({totalCount})
                  </CardTitle>
                </CardHeader>
                
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`px-6 py-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedJobId === job.id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => handleJobSelect(job.id)}
                    >
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {job.organization?.name || "Unknown Company"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{job.salary_min && job.salary_max ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : "Salary not specified"}</span>
                        </div>
                        <div className="flex gap-2">
                          {job.job_type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {job.job_type}
                            </span>
                          )}
                          {job.workplace_type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {job.workplace_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
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