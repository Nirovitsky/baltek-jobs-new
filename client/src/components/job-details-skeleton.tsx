import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailsSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-48 mb-2" />
              <div className="flex items-center space-x-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-5 w-28 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto job-description-scroll">
        <CardContent className="p-6">
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>

          <div className="mb-6">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          
          <div className="mt-8">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}