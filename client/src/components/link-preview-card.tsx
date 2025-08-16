import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import { Link } from "react-router-dom";

interface LinkPreviewCardProps {
  url: string;
  className?: string;
}

export default function LinkPreviewCard({ url, className }: LinkPreviewCardProps) {
  const [jobId, setJobId] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // Extract job ID from URL - support multiple patterns
  useEffect(() => {
    try {
      const urlObj = new URL(url);
      // Support various job URL patterns: /jobs/123, /job/123, /position/123, /vacancy/123
      const pathMatch = urlObj.pathname.match(/\/(?:jobs?|position|vacancy)\/(\d+)/);
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
    <Card className={`w-full border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm ${className}`}>
      <CardContent className="p-0">
        <Link to={`/jobs/${job.id}`}>
          <div className="overflow-hidden">
            {/* Header banner with company branding */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-border/30">
              <div className="flex items-center space-x-3">
                {job.organization?.logo ? (
                  <img
                    src={job.organization.logo}
                    alt={job.organization.display_name || job.organization.name}
                    className="w-12 h-12 rounded-lg object-cover border border-border/30 bg-background cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (job.organization?.id) {
                        navigate(`/company/${job.organization.id}`);
                      }
                    }}
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-border/30 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (job.organization?.id) {
                        navigate(`/company/${job.organization.id}`);
                      }
                    }}
                  >
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base text-foreground leading-tight line-clamp-2 mb-1">
                    {job.title}
                  </h4>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Building className="w-4 h-4 flex-shrink-0" />
                    <span 
                      className="truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (job.organization?.id) {
                          navigate(`/company/${job.organization.id}`);
                        }
                      }}
                    >
                      {job.organization?.display_name || job.organization?.name || "Unknown Company"}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground/60 flex-shrink-0" />
              </div>
            </div>

            {/* Job details content */}
            <div className="p-4 space-y-3">
              {/* Location and timing */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {job.location?.name || "Unknown"}, {job.location?.country || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{job.created_at ? getTimeAgo(job.created_at) : "Recently"}</span>
                </div>
              </div>

              {/* Salary highlight */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-base font-semibold text-primary">
                    {formatSalary(job)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatJobType(job.job_type)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatWorkplaceType(job.workplace_type)}
                  </Badge>
                </div>
              </div>

              {/* Skills preview */}
              {job.skills && job.skills.length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((skill: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                        {typeof skill === 'string' ? skill : skill.name}
                      </Badge>
                    ))}
                    {job.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                        +{job.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}