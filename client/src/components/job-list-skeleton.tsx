import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import JobCardSkeleton from "@/components/job-card-skeleton";
import { Search } from "lucide-react";

interface JobListSkeletonProps {
  count?: number;
}

export default function JobListSkeleton({ count = 8 }: JobListSkeletonProps) {
  return (
    <div className="h-full flex flex-col w-full">
      <div className="p-6 border-b bg-gray-50 rounded-t-lg flex-shrink-0 space-y-4">
        {/* Job Count with Icon */}
        <div className="flex items-center space-x-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        
        {/* Enhanced Search Bar */}
        <form className="relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <Input
              type="text"
              placeholder="Search jobs, companies, skills..."
              disabled
              className="pl-12 pr-4 py-3 bg-white border-gray-200 rounded-lg shadow-sm text-sm placeholder:text-gray-500"
            />
          </div>
        </form>
      </div>
      
      <div className="infinite-scroll flex-1 overflow-y-auto min-h-0 space-y-3 p-3">
        {Array.from({ length: count }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}