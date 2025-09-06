import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Job card skeleton
export const JobCardSkeleton = () => (
  <Card className="p-4">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </Card>
);

// Job list skeleton
export const JobListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <JobCardSkeleton key={index} />
    ))}
  </div>
);

// Job details skeleton
export const JobDetailsSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </Card>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  </Card>
);

// Company profile skeleton
export const CompanyProfileSkeleton = () => (
  <div className="space-y-6">
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </Card>
    
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// Chat skeleton
export const ChatSkeleton = () => (
  <div className="flex flex-col h-full">
    <div className="p-4 border-b">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
    
    <div className="flex-1 p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs p-3 rounded-lg ${index % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Skeleton className={`h-4 w-24 ${index % 2 === 0 ? 'bg-primary-foreground/20' : ''}`} />
          </div>
        </div>
      ))}
    </div>
    
    <div className="p-4 border-t">
      <div className="flex space-x-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-2">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

// Page skeleton for full page loading
export const PageSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);
