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
      <div className="px-3 pt-6 pb-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0 space-y-4">
        {/* Job Count with Icon */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        
        {/* Enhanced Search Bar */}
        <form className="relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
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