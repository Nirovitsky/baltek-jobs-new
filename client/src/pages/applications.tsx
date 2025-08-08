import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import JobDetails from "@/components/job-details";
import JobCard from "@/components/job-card";
import JobListSkeleton from "@/components/job-list-skeleton";
import JobDetailsSkeleton from "@/components/job-details-skeleton";

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
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Left Column - Applications List */}
          <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-900">My Applications</h1>
              <p className="text-sm text-gray-600 mt-1">Track your job applications</p>
            </div>
            <div className="p-6">
              <JobListSkeleton />
            </div>
          </div>

          {/* Right Column - Job Details */}
          <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-6">
              <JobDetailsSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-900">My Applications</h1>
              <p className="text-sm text-gray-600 mt-1">Track your job applications</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Applications</h2>
                <p className="text-gray-600 mb-4">There was an error loading your job applications.</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm"></div>
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

  if (appliedJobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-900">My Applications</h1>
              <p className="text-sm text-gray-600 mt-1">Track your job applications</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h2>
                <p className="text-gray-600 mb-6">You haven't applied to any jobs yet. Start browsing and apply to jobs that match your interests!</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex gap-6 h-[calc(100vh-120px)]">
        {/* Left Column - Applications List */}
        <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col">
          <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Applications</h1>
                <p className="text-sm text-gray-600 mt-1">Track your job applications</p>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {appliedJobs.length} total
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {appliedJobs.map((job: any) => (
                <div 
                  key={job.id} 
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedJobId === job.id 
                      ? 'ring-2 ring-blue-500 ring-opacity-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Applied
                      </div>
                    </div>

                    {/* Job Title */}
                    <div className="pr-16 mb-3">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {job.title}
                      </h3>
                    </div>

                    {/* Company Section with Gradient */}
                    <div className="bg-gradient-to-r from-gray-50/50 to-gray-50/30 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {job.organization?.logo ? (
                              <img
                                src={job.organization.logo}
                                alt={job.organization.display_name || job.organization.name || 'Company'}
                                className="w-6 h-6 object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                                <Briefcase className="w-3 h-3 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {job.organization?.display_name || job.organization?.name || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {job.location?.name || 'Remote'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Job Details */}
        <div className="w-1/2 border border-gray-200 rounded-lg bg-white shadow-sm">
          {selectedJobId ? (
            <div className="h-full overflow-y-auto">
              <JobDetails jobId={selectedJobId} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
                <p className="text-gray-500">Choose an application from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}