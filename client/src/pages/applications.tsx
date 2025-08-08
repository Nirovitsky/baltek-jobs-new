import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Building } from "lucide-react";
import JobDetails from "@/components/job-details";
import JobCard from "@/components/job-card";
import JobCardSkeleton from "@/components/job-card-skeleton";
import JobDetailsSkeleton from "@/components/job-details-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["user", "applications"],
    queryFn: () => ApiClient.getMyApplications(),
    enabled: !!user?.id,
  });

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return "bg-green-100 text-green-800";
      case 'rejected':
      case 'declined':
        return "bg-red-100 text-red-800";
      case 'pending':
      case 'under_review':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-67px)] flex flex-col overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
          <div className="flex gap-6 h-full">
            <div className="w-[30%] h-full flex-shrink-0">
              <div className="h-full flex flex-col w-full">
                <div className="px-3 pt-6 pb-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-[70%] h-full flex-shrink-0 min-w-0 pl-8">
              <div className="h-full w-full">
                <JobDetailsSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Failed to load applications"}
          </p>
        </div>
      </div>
    );
  }

  const applicationsData = applications as any;
  const applicationsList = applicationsData?.results || [];
  
  // Filter jobs that have my_application_id (meaning user has applied)
  const appliedJobs = applicationsList.filter((job: any) => 
    job.my_application_id !== null && job.my_application_id !== undefined
  );

  // Auto-select first job when applications load
  useEffect(() => {
    if (appliedJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(appliedJobs[0].id);
    }
  }, [appliedJobs, selectedJobId]);

  if (appliedJobs.length === 0) {
    return (
      <div className="h-[calc(100vh-67px)] flex flex-col overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
          <div className="flex gap-6 h-full">
            <div className="w-[30%] h-full flex-shrink-0">
              <div className="h-full flex flex-col w-full">
                <div className="px-3 pt-6 pb-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">0 Applications</h2>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600">Jobs you apply to will appear here for tracking.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-[70%] h-full flex-shrink-0 min-w-0 pl-8">
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an application to view details
                  </h3>
                  <p className="text-gray-600">
                    Choose an application from the list to see more information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-67px)] flex flex-col overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="flex gap-6 h-full">
          <div className="w-[30%] h-full flex-shrink-0">
            <div className="h-full flex flex-col w-full">
              <div className="px-3 pt-6 pb-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary">
                      {appliedJobs.length} Application{appliedJobs.length !== 1 ? "s" : ""}
                    </h2>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3">
                {appliedJobs.map((job: any) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJobId === job.id}
                    onSelect={() => setSelectedJobId(job.id)}
                    showBookmark={false}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="w-[70%] h-full flex-shrink-0 min-w-0 pl-8">
            <div className="h-full w-full">
              {selectedJobId ? (
                <JobDetails jobId={selectedJobId} />
              ) : appliedJobs.length > 0 ? (
                <div className="w-[70%] h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select an application to view details
                    </h3>
                    <p className="text-gray-600">
                      Choose an application from the list to see more information
                    </p>
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