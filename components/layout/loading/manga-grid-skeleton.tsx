/**
 * MangaGridSkeleton Component
 * Loading skeleton for manga grid layout
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface MangaGridSkeletonProps {
  className?: string;
  count?: number;
}

/**
 * MangaGridSkeleton component for loading state
 *
 * @param className - Optional additional CSS classes
 * @param count - Number of skeleton cards to display (default: 12)
 */
export function MangaGridSkeleton({
  className,
  count = 10,
}: MangaGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn("space-y-3", index >= 6 && "hidden sm:block")}
        >
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
