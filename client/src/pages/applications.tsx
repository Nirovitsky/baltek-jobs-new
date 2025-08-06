import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, Calendar, MapPin, Building2, FileText, Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react";

export default function ApplicationsPage() {
  const { user } = useAuth();

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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2">Track your job applications and their status</p>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to Load Applications</h2>
          <p className="text-gray-600 mb-4">There was an error loading your job applications.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2">Track your job applications and their status</p>
          </div>
          
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Applications Yet</h2>
            <p className="text-gray-600 mb-6">You haven't applied to any jobs yet. Start browsing and apply to jobs that match your interests!</p>
            <Button onClick={() => window.location.href = "/jobs"}>Browse Jobs</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
              <p className="text-lg text-gray-600">Track your job application progress</p>
            </div>
            
            <div className="text-right">
              <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-blue-200">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Applications</p>
                <p className="text-3xl font-bold text-primary mt-1">{appliedJobs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Application Cards */}
        <div className="grid gap-6">
          {appliedJobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {job.title}
                        </h3>
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 px-3 py-1 rounded-full font-medium">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Application Submitted
                          </span>
                        </Badge>
                      </div>
                    
                      {/* Company and Location Info */}
                      <div className="flex items-center gap-6 text-gray-600 mb-4">
                        {job.organization && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{job.organization.display_name || job.organization.name}</span>
                          </div>
                        )}
                        
                        {job.location && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span>{job.location.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span>Applied Recently</span>
                        </div>
                      </div>

                      {/* Salary Information */}
                      {(job.payment_from || job.payment_to) && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Salary Range</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {job.payment_from && job.payment_to 
                              ? `${job.currency || '$'}${job.payment_from.toLocaleString()} - ${job.currency || '$'}${job.payment_to.toLocaleString()}`
                              : job.payment_from 
                                ? `${job.currency || '$'}${job.payment_from.toLocaleString()}+`
                                : 'Not specified'
                            }
                            {job.payment_frequency && (
                              <span className="text-sm text-gray-500 font-normal ml-2">
                                per {job.payment_frequency.toLowerCase()}
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Application Status */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl mb-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-green-800">Application Under Review</p>
                            <p className="text-sm text-green-600">Status updated recently</p>
                          </div>
                        </div>
                        <p className="text-green-700 ml-13">
                          Your application has been successfully submitted and is being reviewed by the hiring team. You'll be notified of any updates.
                        </p>
                      </div>

                      {/* Skills Tags */}
                      {job.skills && job.skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 5).map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 5 && (
                              <Badge variant="secondary" className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200 font-medium">
                                +{job.skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {applicationsData?.next && (
          <div className="text-center pt-6">
            <Button variant="outline">Load More Applications</Button>
          </div>
        )}
      </div>
    </div>
  );
}