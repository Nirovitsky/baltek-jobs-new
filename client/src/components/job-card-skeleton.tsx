import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobCardSkeleton() {
  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50/80">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Top Row: Job Title and Salary */}
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-3/4 mr-4" />
            <Skeleton className="h-4 w-20 flex-shrink-0" />
          </div>
          
          {/* Tags Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
          
          {/* Company Row */}
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}