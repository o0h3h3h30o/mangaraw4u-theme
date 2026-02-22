/**
 * MangaCarouselSkeleton Component
 * Loading skeleton for manga carousel
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface MangaCarouselSkeletonProps {
  className?: string;
  count?: number;
}

/**
 * MangaCarouselSkeleton component for loading state
 *
 * @param className - Optional additional CSS classes
 * @param count - Number of skeleton items to display (default: 8)
 */
export function MangaCarouselSkeleton({
  className,
  count = 6,
}: MangaCarouselSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Carousel items skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 md:gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn("space-y-3", index >= 2 && "hidden md:block")}
          >
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
