import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import JobCardSkeleton from "@/components/job-card-skeleton";
import { Search, Briefcase } from "lucide-react";

interface JobListSkeletonProps {
  count?: number;
}

export default function JobListSkeleton({ count = 8 }: JobListSkeletonProps) {
  return (
    <div className="h-full flex flex-col w-[400px]">
      {/* Header Section */}
      <div className="px-3 py-4 border-b bg-background rounded-t-lg flex-shrink-0 space-y-4">
        {/* Job Count with Icon */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Search className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        
        {/* Enhanced Search Bar */}
        <form className="relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <Input
              type="text"
              placeholder="Search jobs, companies, skills..."
              disabled
              className="pl-12 pr-4 py-3 bg-background border-border rounded-lg shadow-sm text-sm placeholder:text-muted-foreground"
            />
          </div>
        </form>
      </div>
      
      {/* Job List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 p-3">
        {Array.from({ length: count }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}