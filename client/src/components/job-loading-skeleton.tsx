import { Skeleton } from "@/components/ui/skeleton";

interface JobLoadingSkeletonProps {
  count?: number;
}

export default function JobLoadingSkeleton({ count = 3 }: JobLoadingSkeletonProps) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="job-card px-5 py-4 border-b hover:bg-gray-50 cursor-pointer focus:outline-none active:bg-gray-50 transition-all duration-200 ease-in-out">
          <div className="relative min-h-[80px]">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                {/* Job Title */}
                <Skeleton className="h-4 w-3/4 mb-2.5" />
                
                {/* Tags in Middle */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                
                {/* Company at Bottom Left */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              
              {/* Salary on Top Right */}
              <div className="text-right flex-shrink-0">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            
            {/* Location at Bottom Right */}
            <div className="absolute bottom-0 right-0">
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}