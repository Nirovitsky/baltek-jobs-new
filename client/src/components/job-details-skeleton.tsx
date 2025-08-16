import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailsSkeleton() {
  return (
    <Card className="h-full max-h-[calc(100vh-205px)] flex flex-col w-full overflow-hidden">
      {/* Fixed Header - matches exact structure */}
      <div className="p-6 border-b bg-background">
        {/* Header - matches job-details structure */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="flex items-center space-x-4 text-sm mt-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="w-10 h-8 rounded" />
            <Skeleton className="w-10 h-8 rounded" />
          </div>
        </div>

        {/* Quick Info Cards - matches exact grid structure */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-5 w-28 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Scrollable Content - matches exact structure */}
      <div className="flex-1 overflow-y-auto job-description-scroll">
        <CardContent className="p-6">
          {/* Skills section */}
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>

          {/* Description section */}
          <div className="mb-6">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="prose max-w-none">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
          
          {/* Requirements section */}
          <div className="mb-6">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="prose max-w-none">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>

          {/* Benefits section */}
          <div className="mb-6">
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="prose max-w-none">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          
          {/* Action Buttons - matches exact structure */}
          <div className="flex space-x-3">
            <Skeleton className="h-10 flex-1 rounded" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}