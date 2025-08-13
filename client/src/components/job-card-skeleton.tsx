import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building } from "lucide-react";

export default function JobCardSkeleton() {
  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-muted/80">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Top Row: Job Title and Salary */}
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-3/4 mr-4" />
            <Skeleton className="h-4 w-20 flex-shrink-0" />
          </div>
          
          {/* Tags Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-18 rounded" />
          </div>
          
          {/* Company Row */}
          <div className="flex items-center justify-between bg-muted/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center border border-border">
                <Building className="w-3 h-3 text-muted-foreground" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-20 flex-shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}