/**
 * HotMangaSidebarSkeleton Component
 * Loading skeleton for hot manga sidebar with tabs and ranked list
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface HotMangaSidebarSkeletonProps {
  className?: string;
  count?: number;
}

/**
 * HotMangaSidebarSkeleton component for loading state
 *
 * @param className - Optional additional CSS classes
 * @param count - Number of skeleton items to display (default: 10)
 */
export function HotMangaSidebarSkeleton({
  className,
  count = 10,
}: HotMangaSidebarSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-7 w-32" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
      </div>

      {/* List items skeleton */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Rank number */}
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            {/* Thumbnail */}
            <Skeleton className="h-16 w-12 rounded flex-shrink-0" />
            {/* Content */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
