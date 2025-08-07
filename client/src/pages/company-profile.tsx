import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Building, MapPin, Globe, Users, Calendar, Briefcase, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Organization, Job } from "@shared/schema";

function CompanyProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
        </div>
        
        {/* Company info skeleton */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Jobs skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CompanyProfile() {
  const [match, params] = useRoute("/company/:id");
  const companyId = params?.id;

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: ["/api/organizations", companyId],
    enabled: !!companyId,
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", { organization: companyId }],
    enabled: !!companyId,
  });

  if (companyLoading) {
    return <CompanyProfileSkeleton />;
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Company Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/jobs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const organizationData = company as Organization;
  const companyJobs = (Array.isArray(jobsData) ? jobsData : (jobsData as any)?.results || []) as Job[];

  // Get company initials for avatar fallback
  const getCompanyInitials = (name?: string) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>

        {/* Company Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={organizationData.logo} 
                  alt={`${organizationData.name} logo`}
                />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {getCompanyInitials(organizationData?.name || organizationData?.official_name || organizationData?.display_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {organizationData?.official_name || organizationData?.display_name || organizationData?.name || 'Company Name'}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {organizationData.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{typeof organizationData.location === 'string' ? organizationData.location : 'Location'}</span>
                    </div>
                  )}
                  
                  {organizationData.industry && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{organizationData.industry}</span>
                    </div>
                  )}
                  
                  {organizationData.size && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{organizationData.size}</span>
                    </div>
                  )}
                  
                  {organizationData.founded && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Founded {organizationData.founded}</span>
                    </div>
                  )}
                </div>

                {organizationData.website && (
                  <div className="mb-4">
                    <a
                      href={organizationData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Visit Website</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {organizationData.description && (
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <h3 className="text-lg font-semibold mb-3">About {organizationData?.official_name || organizationData?.display_name || organizationData?.name || 'Company'}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {organizationData.description}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Company Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Company Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {companyJobs.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Open Positions
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {typeof organizationData?.industry === 'string' ? organizationData.industry : "N/A"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Industry
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {typeof organizationData?.size === 'string' ? organizationData.size : "N/A"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Company Size
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {typeof organizationData?.founded === 'number' ? organizationData.founded : "N/A"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Founded
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Open Positions ({companyJobs.length})</span>
              {companyJobs.length > 0 && (
                <Link href={`/jobs?organization=${companyId}`}>
                  <Button variant="outline" size="sm">
                    View All Jobs
                  </Button>
                </Link>
              )}
            </CardTitle>
            <CardDescription>
              Current job openings at {organizationData?.official_name || organizationData?.display_name || organizationData?.name || 'this company'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : companyJobs.length > 0 ? (
              <div className="space-y-4">
                {companyJobs.slice(0, 5).map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {job.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{job.location.name}</span>
                              </div>
                            )}
                            
                            <Badge variant="outline" className="text-xs">
                              {job.job_type}
                            </Badge>
                            
                            <Badge variant="outline" className="text-xs">
                              {job.workplace_type}
                            </Badge>
                          </div>
                          
                          {(job.payment_from || job.payment_to) && (
                            <div className="text-sm font-medium text-primary">
                              {job.payment_from && job.payment_to
                                ? `${job.currency || '$'} ${job.payment_from.toLocaleString()} - ${job.payment_to.toLocaleString()}`
                                : job.payment_from
                                ? `${job.currency || '$'} ${job.payment_from.toLocaleString()}+`
                                : job.payment_to
                                ? `Up to ${job.currency || '$'} ${job.payment_to.toLocaleString()}`
                                : null}
                              {job.payment_frequency && ` ${job.payment_frequency}`}
                            </div>
                          )}
                        </div>
                        
                        {job.my_application_id && (
                          <Badge variant="secondary" className="ml-2">
                            Applied
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                
                {companyJobs.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href={`/jobs?organization=${companyId}`}>
                      <Button variant="outline">
                        View {companyJobs.length - 5} More Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Open Positions
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {organizationData?.official_name || organizationData?.display_name || organizationData?.name || 'This company'} doesn't have any open positions at the moment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}