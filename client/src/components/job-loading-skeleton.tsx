import { Skeleton } from "@/components/ui/skeleton";

interface JobLoadingSkeletonProps {
  count?: number;
}

export default function JobLoadingSkeleton({ count = 3 }: JobLoadingSkeletonProps) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              {/* Job Title */}
              <Skeleton className="h-6 w-3/4 mb-3" />
              
              {/* Job Type */}
              <Skeleton className="h-4 w-20 mb-3" />
              
              {/* Skills Tags */}
              <div className="flex items-center space-x-2 mb-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
              
              {/* Company Details */}
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
            
            {/* Salary */}
            <div className="text-right">
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}