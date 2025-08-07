import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job } from "@shared/schema";
import { Link } from "wouter";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ApplicationModal from "@/components/application-modal";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  Share, 
  Send,
  Building,
  Calendar,
  Users,
  Globe,
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface JobDetailsProps {
  jobId: number;
}

export default function JobDetails({ jobId }: JobDetailsProps) {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch detailed job data
  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => ApiClient.getJob(jobId),
    enabled: !!jobId,
  }) as { data: Job | undefined; isLoading: boolean; error: any };

  // Check if user has already applied using the my_application_id field from job data
  const hasApplied = job?.my_application_id !== null && job?.my_application_id !== undefined;

  console.log("Job application check:", {
    jobId: jobId,
    my_application_id: job?.my_application_id,
    hasApplied: hasApplied
  });

  const bookmarkMutation = useMutation({
    mutationFn: ({ jobId, isBookmarked }: { jobId: number; isBookmarked: boolean }) => 
      ApiClient.bookmarkJob(jobId, isBookmarked),
    onSuccess: (_, { isBookmarked }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Job bookmarked",
        description: isBookmarked ? "Job removed from your bookmarks" : "Job added to your bookmarks",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const handleBookmark = () => {
    if (!job) return;
    bookmarkMutation.mutate({ jobId: job.id, isBookmarked: job.is_bookmarked || false });
  };

  const handleShare = () => {
    if (!job) return;
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job at ${job.organization?.name || 'this company'}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard",
      });
    }
  };

  // Conditional rendering after all hooks
  if (isLoading) {
    return (
      <Card className="h-full w-full">
        <div className="p-6 border-b">
          {/* Header skeleton */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-64 mb-2"></div>
                <div className="h-6 bg-gray-100 rounded animate-pulse w-48 mb-2"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-12 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-16 mx-auto"></div>
              </div>
            ))}
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-3">
            <div className="h-12 flex-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 w-12 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-12 w-12 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
        
        <CardContent className="flex-1 p-6 overflow-y-auto">
          {/* Content skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5"></div>
              </div>
            </div>
            
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
            
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-36 mb-3"></div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 bg-gray-100 rounded animate-pulse w-20"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full w-full">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load job details</h3>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return null;
  }

  const formatSalary = (job: Job) => {
    // Support both new API structure (payment_from/payment_to) and legacy (salary_min/salary_max)
    const min = job.payment_from || job.salary_min;
    const max = job.payment_to || job.salary_max;
    const currency = job.currency || "TMT";
    
    if (!min && !max) return "Salary not specified";
    
    const currencySymbol = currency === "EUR" ? "€" : 
                           currency === "GBP" ? "£" : 
                           currency === "USD" ? "$" : 
                           currency === "TMT" ? "TMT" : 
                           currency;
    
    if (min && max) return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    if (min) return `From ${currencySymbol}${min.toLocaleString()}`;
    if (max) return `Up to ${currencySymbol}${max.toLocaleString()}`;
    return "Salary not specified";
  };

  const formatJobType = (type: string) => {
    return type.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatWorkplaceType = (type: string) => {
    return type.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card className="h-full flex flex-col w-full overflow-hidden">
          {/* Fixed Header */}
          <div className="p-6 border-b bg-white">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/company/${job.organization?.id}`}
                  className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  {job.organization?.logo ? (
                    <img
                      src={job.organization.logo}
                      alt={job.organization.display_name || job.organization.name || 'Company'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-gray-400" />
                  )}
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title || 'Job Title'}</h1>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/company/${job.organization?.id}`}
                      className="text-lg text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {job.organization?.display_name || job.organization?.name || 'Unknown Company'}
                    </Link>
                    <Link
                      href={`/company/${job.organization?.id}`}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location?.name || 'Unknown'}, {job.location?.country || 'Unknown'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted {job.created_at ? getTimeAgo(job.created_at) : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending}
                  className={job.is_bookmarked ? "text-primary border-primary/20 hover:text-primary bg-primary/5" : ""}
                >
                  <Bookmark className={`w-4 h-4 ${job.is_bookmarked ? "fill-primary" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Salary Range</h3>
                <p className="text-xl font-bold text-primary">
                  {formatSalary(job)}
                </p>
                <p className="text-sm text-gray-500">per year</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Job Type</h3>
                <p className="text-lg">{formatJobType(job.job_type)}</p>
                <p className="text-sm text-gray-500">{formatWorkplaceType(job.workplace_type)}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto job-description-scroll">
            <CardContent className="p-6 pb-4">


          {/* Skills */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No specific skills listed</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="prose max-w-none text-gray-700">
              <div className="whitespace-pre-wrap">{job.description || 'No description available'}</div>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <div className="prose max-w-none text-gray-700">
                <div className="whitespace-pre-wrap">{job.requirements}</div>
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
              <div className="prose max-w-none text-gray-700">
                <div className="whitespace-pre-wrap">{job.benefits}</div>
              </div>
            </div>
          )}

          {/* Company Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">About {job.organization?.display_name || job.organization?.name || 'this company'}</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => job.organization?.id && window.open(`/company/${job.organization.id}`, '_blank')}
                  className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                  disabled={!job.organization?.id}
                >
                  {job.organization?.logo ? (
                    <img
                      src={job.organization.logo}
                      alt={job.organization.display_name || job.organization.name || 'Company'}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Building className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <button
                    onClick={() => job.organization?.id && window.open(`/company/${job.organization.id}`, '_blank')}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left cursor-pointer"
                    disabled={!job.organization?.id}
                  >
                    {job.organization?.display_name || job.organization?.name || 'Unknown Company'}
                  </button>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{job.category?.name || 'Uncategorized'}</span>
                  </div>
                </div>
              </div>
              {job.organization?.description && (
                <p className="text-sm text-gray-700">{job.organization.description}</p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-0">
            <Button
              onClick={hasApplied ? undefined : () => setIsApplicationModalOpen(true)}
              className="flex-1"
              size="lg"
              variant={hasApplied ? "outline" : "default"}
              disabled={hasApplied}
            >
              {hasApplied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Applied
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Apply Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>

      <ApplicationModal
        job={job}
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </Card>
  );
}
