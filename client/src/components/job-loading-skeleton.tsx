import { Skeleton } from "@/components/ui/skeleton";

interface JobLoadingSkeletonProps {
  count?: number;
}

export default function JobLoadingSkeleton({ count = 3 }: JobLoadingSkeletonProps) {
  return (
    <div className="flex-shrink-0">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full px-6 py-5 border-b border-gray-100">
          <div className="relative w-full min-h-[120px]">
            <div className="flex justify-between items-start w-full">
              <div className="flex-1 pr-6 min-w-0">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0">
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}