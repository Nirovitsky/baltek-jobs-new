import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { Job } from "@shared/schema";
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
  Heart, 
  Share, 
  Send,
  Building,
  Calendar,
  Users,
  Globe
} from "lucide-react";

interface JobDetailsProps {
  job: Job;
}

export default function JobDetails({ job }: JobDetailsProps) {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: () => ApiClient.bookmarkJob(job.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: job.is_bookmarked ? "Bookmark removed" : "Job bookmarked",
        description: job.is_bookmarked ? "Job removed from bookmarks" : "Job added to your bookmarks",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to bookmark job",
        variant: "destructive",
      });
    },
  });

  const handleBookmark = () => {
    bookmarkMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job at ${job.organization.name}`,
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

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
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
    <>
      <Card className="sticky top-24">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {job.organization.logo ? (
                  <img
                    src={job.organization.logo}
                    alt={job.organization.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <Building className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-gray-600">{job.organization.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location.name}, {job.location.country}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted {getTimeAgo(job.created_at)}
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
                className={job.is_bookmarked ? "text-red-500 border-red-200" : ""}
              >
                <Heart className={`w-4 h-4 ${job.is_bookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Salary Range</h3>
              <p className="text-xl font-bold text-primary">
                {formatSalary(job.salary_min, job.salary_max, job.currency)}
              </p>
              <p className="text-sm text-gray-500">per year</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Job Type</h3>
              <p className="text-lg">{formatJobType(job.job_type)}</p>
              <p className="text-sm text-gray-500">{formatWorkplaceType(job.workplace_type)}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="prose max-w-none text-gray-700">
              <div className="whitespace-pre-wrap">{job.description}</div>
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
            <h3 className="font-semibold text-gray-900 mb-3">About {job.organization.name}</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  {job.organization.logo ? (
                    <img
                      src={job.organization.logo}
                      alt={job.organization.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Building className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{job.organization.name}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{job.category.name}</span>
                  </div>
                </div>
              </div>
              {job.organization.description && (
                <p className="text-sm text-gray-700">{job.organization.description}</p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsApplicationModalOpen(true)}
              className="flex-1"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2" />
              Apply Now
            </Button>
            <Button variant="outline" size="lg">
              <Building className="w-4 h-4 mr-2" />
              Company Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <ApplicationModal
        job={job}
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </>
  );
}
