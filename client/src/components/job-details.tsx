import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import type { Job } from "@shared/schema";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ApplicationModal from "@/components/application-modal";
import JobDetailsSkeleton from "@/components/job-details-skeleton";
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Copy,
  Send,
  Building,
  Calendar,
  Users,
  Globe,
  CheckCircle,
  ExternalLink,
  UserPlus,
  LogIn,
  Link,
} from "lucide-react";
import baltekIcon from "@/assets/baltek-icon.svg";

interface JobDetailsProps {
  jobId: number;
}

export default function JobDetails({ jobId }: JobDetailsProps) {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isQuickApplyModalOpen, setIsQuickApplyModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Fetch detailed job data
  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => ApiClient.getJob(jobId),
    enabled: !!jobId,
  }) as { data: Job | undefined; isLoading: boolean; error: any };

  // Check if user has already applied using the my_application_id field from job data
  const hasApplied =
    job?.my_application_id !== null && job?.my_application_id !== undefined;

  console.log("Job application check:", {
    jobId: jobId,
    my_application_id: job?.my_application_id,
    hasApplied: hasApplied,
  });

  const bookmarkMutation = useMutation({
    mutationFn: ({
      jobId,
      isBookmarked,
    }: {
      jobId: number;
      isBookmarked: boolean;
    }) => ApiClient.bookmarkJob(jobId, isBookmarked),
    onMutate: async ({ jobId, isBookmarked }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["job", jobId] });
      await queryClient.cancelQueries({ queryKey: ["jobs"] });
      await queryClient.cancelQueries({ queryKey: ["bookmarked-jobs"] });

      // Snapshot the previous value
      const previousJob = queryClient.getQueryData(["job", jobId]);
      const previousJobs = queryClient.getQueryData(["jobs"]);
      const previousBookmarkedJobs = queryClient.getQueryData([
        "bookmarked-jobs",
      ]);

      // Optimistically update the job details
      queryClient.setQueryData(["job", jobId], (old: Job | undefined) => {
        if (!old) return old;
        return { ...old, is_bookmarked: !isBookmarked };
      });

      // Optimistically update the jobs list
      queryClient.setQueryData(["jobs"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages?.map((page: any) => ({
            ...page,
            data: page.data?.map((job: Job) =>
              job.id === jobId ? { ...job, is_bookmarked: !isBookmarked } : job,
            ),
          })),
        };
      });

      // Return a context object with the snapshotted values
      return { previousJob, previousJobs, previousBookmarkedJobs };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJob) {
        queryClient.setQueryData(["job", variables.jobId], context.previousJob);
      }
      if (context?.previousJobs) {
        queryClient.setQueryData(["jobs"], context.previousJobs);
      }
      if (context?.previousBookmarkedJobs) {
        queryClient.setQueryData(
          ["bookmarked-jobs"],
          context.previousBookmarkedJobs,
        );
      }

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update bookmark",
        variant: "destructive",
      });
    },
    onSuccess: (_, { isBookmarked }) => {
      toast({
        title: isBookmarked ? "Bookmark removed" : "Job bookmarked",
        description: isBookmarked
          ? "Job removed from your bookmarks"
          : "Job added to your bookmarks",
      });
    },
    onSettled: (_, __, { jobId }) => {
      // Always refetch after error or success to ensure we have up-to-date data
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-jobs"] });
    },
  });

  const handleBookmark = () => {
    if (!job) return;
    bookmarkMutation.mutate({
      jobId: job.id,
      isBookmarked: job.is_bookmarked || false,
    });
  };

  const handleShare = async () => {
    if (!job) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  // Conditional rendering after all hooks
  if (isLoading) {
    return <JobDetailsSkeleton />;
  }

  if (error) {
    return (
      <Card className="h-full w-full">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load job details
          </h3>
          <p className="text-muted-foreground">
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

    const currencySymbol =
      currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : currency === "USD"
            ? "$"
            : currency === "TMT"
              ? "TMT"
              : currency;

    if (min && max)
      return `${currencySymbol}${min.toLocaleString('de-DE')} - ${currencySymbol}${max.toLocaleString('de-DE')}`;
    if (min) return `From ${currencySymbol}${min.toLocaleString('de-DE')}`;
    if (max) return `Up to ${currencySymbol}${max.toLocaleString('de-DE')}`;
    return "Salary not specified";
  };

  const formatJobType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatWorkplaceType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
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
    <Card className="h-full max-h-[calc(100vh-220px)] flex flex-col w-full overflow-hidden">
      {/* Fixed Header */}
      <div className="p-6 border-b bg-background flex-shrink-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <RouterLink
              to={`/company/${job.organization?.id}`}
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
            >
              {job.organization?.logo ? (
                <img
                  src={job.organization.logo}
                  alt={
                    job.organization.display_name ||
                    job.organization.official_name ||
                    "Company"
                  }
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <Building className="w-8 h-8 text-muted-foreground/60" />
              )}
            </RouterLink>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {job.title || "Job Title"}
              </h1>
              <div className="flex items-center gap-2">
                <RouterLink
                  to={`/company/${job.organization?.id}`}
                  className="text-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {job.organization?.display_name ||
                    job.organization?.official_name ||
                    "Unknown Company"}
                </RouterLink>
                <RouterLink
                  to={`/company/${job.organization?.id}`}
                  className="text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </RouterLink>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location?.name || "Unknown"}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Posted{" "}
                  {job.created_at ? getTimeAgo(job.created_at) : "Recently"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className={
                  job.is_bookmarked
                    ? "text-primary border-primary/20 hover:text-primary bg-primary/5"
                    : ""
                }
                data-testid="button-bookmark"
              >
                <Bookmark
                  className={`w-4 h-4 ${job.is_bookmarked ? "fill-primary" : ""}`}
                />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share">
              <Link className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Salary Range</h3>
            <p className="text-xl font-bold text-primary">
              {formatSalary(job)}
            </p>
            <p className="text-sm text-muted-foreground">per year</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Job Type</h3>
            <p className="text-lg">{formatJobType(job.job_type)}</p>
            <p className="text-sm text-muted-foreground">
              {formatWorkplaceType(job.workplace_type)}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto job-description-scroll">
        <CardContent className="p-6">


          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">
              Job Description
            </h3>
            <div className="prose max-w-none text-foreground">
              <div className="whitespace-pre-wrap">
                {job.description || "No description available"}
              </div>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Requirements</h3>
              <div className="prose max-w-none text-foreground">
                <div className="whitespace-pre-wrap">{job.requirements}</div>
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Benefits</h3>
              <div className="prose max-w-none text-foreground">
                <div className="whitespace-pre-wrap">{job.benefits}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => AuthService.startOAuthLogin()}
                  className="flex-1"
                  size="lg"
                  variant="outline"
                  data-testid="button-sign-in"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Apply
                </Button>
                <Button
                  onClick={() => AuthService.startOAuthLogin()}
                  className="flex-1"
                  size="lg"
                  variant="default"
                  data-testid="button-sign-up"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up to Apply
                </Button>
              </>
            ) : hasApplied ? (
              <Button
                className="flex-1"
                size="lg"
                variant="outline"
                disabled={true}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Applied
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="flex-1 bg-background text-foreground border border-input hover:bg-muted/50"
                  size="lg"
                  data-testid="button-apply-now"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
                <Button
                  onClick={() => setIsQuickApplyModalOpen(true)}
                  className="flex-1"
                  size="lg"
                  variant="default"
                  data-testid="button-quick-apply"
                >
                  <img src={baltekIcon} alt="" className="w-4 h-4 mr-2" />
                  Quick Apply
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </div>

      <ApplicationModal
        job={job}
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
      
      <ApplicationModal
        job={job}
        isOpen={isQuickApplyModalOpen}
        onClose={() => setIsQuickApplyModalOpen(false)}
        isQuickApply={true}
      />
    </Card>
  );
}
