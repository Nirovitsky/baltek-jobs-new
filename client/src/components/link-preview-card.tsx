import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building,
  DollarSign,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

interface LinkPreviewCardProps {
  url: string;
  className?: string;
}

export default function LinkPreviewCard({ url, className }: LinkPreviewCardProps) {
  const [jobId, setJobId] = useState<number | null>(null);
  
  // Extract job ID from URL
  useEffect(() => {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/jobs\/(\d+)/);
      if (pathMatch) {
        setJobId(parseInt(pathMatch[1]));
      }
    } catch (error) {
      console.error("Failed to parse URL:", error);
    }
  }, [url]);

  // Fetch job data if we have a job ID
  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => ApiClient.getJob(jobId!),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  }) as { data: Job | undefined; isLoading: boolean; error: any };

  // Don't render anything if no job ID found
  if (!jobId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline break-all"
      >
        {url}
      </a>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={`w-full max-w-md animate-pulse ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state or no job found
  if (error || !job) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline break-all"
      >
        {url}
      </a>
    );
  }

  const formatSalary = (job: Job) => {
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
            : currency;

    if (min && max) {
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    } else if (min) {
      return `From ${currencySymbol}${min.toLocaleString()}`;
    } else if (max) {
      return `Up to ${currencySymbol}${max.toLocaleString()}`;
    }
  };

  const formatJobType = (jobType: string) => {
    const typeMap: { [key: string]: string } = {
      full_time: "Full-time",
      part_time: "Part-time",
      contract: "Contract",
      temporary: "Temporary",
      internship: "Internship",
      volunteer: "Volunteer",
    };
    return typeMap[jobType] || jobType;
  };

  const formatWorkplaceType = (workplaceType: string) => {
    const typeMap: { [key: string]: string } = {
      on_site: "On-site",
      remote: "Remote",
      hybrid: "Hybrid",
    };
    return typeMap[workplaceType] || workplaceType;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  return (
    <Card className={`w-full max-w-md border-l-4 border-l-primary hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}>
      <CardContent className="p-4">
        <Link href={`/jobs/${job.id}`}>
          <div className="space-y-3">
            {/* Header with company info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {job.organization?.logo && (
                  <img
                    src={job.organization.logo}
                    alt={job.organization.display_name || job.organization.name}
                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1">
                    <Building className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {job.organization?.display_name || job.organization?.name || "Unknown Company"}
                    </span>
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>

            {/* Job title */}
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
              {job.title}
            </h3>

            {/* Location and timing */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {job.location?.name || "Unknown"}, {job.location?.country || "Unknown"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{job.created_at ? getTimeAgo(job.created_at) : "Recently"}</span>
              </div>
            </div>

            {/* Salary and job type */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {formatSalary(job)}
                </span>
              </div>
              <div className="flex space-x-1">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {formatJobType(job.job_type)}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {formatWorkplaceType(job.workplace_type)}
                </Badge>
              </div>
            </div>

            {/* Skills preview */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 3).map((skill: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                    {typeof skill === 'string' ? skill : skill.name}
                  </Badge>
                ))}
                {job.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{job.skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}