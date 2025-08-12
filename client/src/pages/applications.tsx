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
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["user", "applications"],
    queryFn: () => ApiClient.getMyApplications(),
    enabled: !!user?.id,
  });

  // Calculate derived state (must be before useEffect)
  const applicationsData = applications as any;
  const applicationsList = applicationsData?.results || applicationsData || [];
  
  // Debug logging
  console.log("Applications API response:", applicationsData);
  console.log("Applications list:", applicationsList);
  console.log("Applications list length:", applicationsList.length);
  if (applicationsList.length > 0) {
    console.log("First application:", applicationsList[0]);
    console.log("Application structure:", Object.keys(applicationsList[0]));
  }
  
  // Transform applications to job format expected by JobCard component
  const appliedJobs = applicationsList.map((application: any) => {
    // If this is already a job object with my_application_id, use it as is
    if (application.my_application_id !== undefined) {
      return application;
    }
    
    // If this is an application object with a job field
    if (application.job && typeof application.job === 'object') {
      return {
        ...application.job,
        my_application_id: application.id,
        application_status: application.status,
        application_date: application.created_at || application.date_created,
        application_cover_letter: application.cover_letter,
      };
    }
    
    // If this is an application object with job_id instead of job object
    if (application.job_id || application.job) {
      return {
        id: application.job_id || application.job,
        title: application.job_title || application.title || 'Job Application',
        company: application.company || { name: 'Company' },
        my_application_id: application.id,
        application_status: application.status,
        application_date: application.created_at || application.date_created,
        application_cover_letter: application.cover_letter,
        // Add placeholder data so JobCard can render
        min_salary: 0,
        max_salary: 0,
        currency: 'USD',
        payment_frequency: 'monthly',
        location: 'Remote',
        skills: [],
        description: '',
        requirements: '',
      };
    }
    
    // Fallback: treat the application itself as a job-like object
    return {
      ...application,
      my_application_id: application.id,
      application_status: application.status,
      application_date: application.created_at || application.date_created,
    };
  });
  
  console.log("Transformed applied jobs:", appliedJobs);
  console.log("Applied jobs length:", appliedJobs.length);

  // Auto-select first job when applications load (hook must be called consistently)
  useEffect(() => {
    if (appliedJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(appliedJobs[0].id);
    }
  }, [appliedJobs, selectedJobId]);

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'rejected':
      case 'declined':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case 'rejected':
      case 'declined':
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
      case 'pending':
      case 'under_review':
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-muted text-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-67px)] flex flex-col overflow-hidden">
        <BreadcrumbNavigation />
        <div className="layout-container-body py-4 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 h-full flex-shrink-0">
              <div className="h-full flex flex-col w-full">
                <div className="px-3 py-4 border-b bg-muted rounded-t-lg flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-muted-foreground/60" />
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

            <div className="lg:col-span-2 h-full flex-shrink-0 min-w-0">
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
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load applications"}
          </p>
        </div>
      </div>
    );
  }


  if (appliedJobs.length === 0) {
    return (
      <div className="h-[calc(100vh-67px)] flex flex-col overflow-hidden">
        <BreadcrumbNavigation />
        <div className="layout-container-body py-4 overflow-hidden">
          <div className="flex gap-6 h-full">
            <div className="w-[30%] h-full flex-shrink-0">
              <div className="h-full flex flex-col w-full">
                <div className="px-3 py-4 border-b bg-muted rounded-t-lg flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">0 Applications</h2>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No applications yet</h3>
                    <p className="text-muted-foreground">Jobs you apply to will appear here for tracking.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-[70%] h-full flex-shrink-0 min-w-0 pl-8">
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Select an application to view details
                  </h3>
                  <p className="text-muted-foreground">
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
    <div className="h-full overflow-hidden flex flex-col">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4 flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-1 h-full flex-shrink-0">
            <div className="h-full flex flex-col w-full">
              <div className="px-3 py-4 border-b bg-muted rounded-t-lg flex-shrink-0">
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
                    disableViewedOpacity={true}
                    hideAppliedBadge={true}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 h-full flex-shrink-0 min-w-0">
            <div className="h-full w-full">
              {selectedJobId ? (
                <JobDetails jobId={selectedJobId} />
              ) : appliedJobs.length > 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select an application to view details
                    </h3>
                    <p className="text-muted-foreground">
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