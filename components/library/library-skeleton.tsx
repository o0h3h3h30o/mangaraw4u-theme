"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LibrarySkeletonProps {
  className?: string;
}

/**
 * Full page skeleton for library page loading state
 */
export function LibrarySkeleton({ className }: LibrarySkeletonProps) {
  return (
    <div
      className={cn(
        "container mx-auto max-w-7xl space-y-6 px-4 py-8",
        className
      )}
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Content skeleton */}
      <LibraryGridSkeleton count={10} />
    </div>
  );
}

interface LibraryGridSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Grid skeleton matching manga card layout
 * Used inside tab content during loading
 */
export function LibraryGridSkeleton({
  count = 10,
  className,
}: LibraryGridSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <Skeleton className="h-4 w-32" />

      {/* Grid skeleton */}
      <div
        className={cn(
          "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
          className
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <MangaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Single manga card skeleton
 */
function MangaCardSkeleton() {
  return (
    <div className="space-y-2">
      {/* Cover image */}
      <Skeleton className="aspect-[3/4] rounded-lg" />

      {/* Title */}
      <Skeleton className="h-4 w-3/4" />

      {/* Chapter/metadata */}
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

interface TabContentSkeletonProps {
  showStats?: boolean;
  gridCount?: number;
}

/**
 * Tab content skeleton with optional stats line
 */
export function TabContentSkeleton({
  showStats = true,
  gridCount = 10,
}: TabContentSkeletonProps) {
  return (
    <div className="space-y-6">
      {showStats && <Skeleton className="h-4 w-36" />}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: gridCount }).map((_, i) => (
          <MangaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Continue reading section skeleton (5 items, no stats)
 */
export function ContinueReadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <MangaCardSkeleton key={i} />
        ))}
      </div>

      {/* View all button skeleton */}
      <div className="flex justify-center pt-4">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
    </div>
  );
}
