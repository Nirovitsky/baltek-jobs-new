import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface JobSkeletonProps {
  count?: number;
}

export default function JobSkeleton({ count = 10 }: JobSkeletonProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <Skeleton className="h-6 w-32" />
      </div>
      
      <div className="flex-1 overflow-y-auto infinite-scroll">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="px-5 py-4 border-b">
            <div className="relative">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <Skeleton className="h-4 w-3/4 mb-2.5" />
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-12 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0">
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}