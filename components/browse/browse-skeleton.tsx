/**
 * Browse Skeleton Component
 * Loading skeleton for the browse page with filters and manga grid
 */

import { MangaGridSkeleton } from "@/components/layout/loading/manga-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/**
 * Browse page skeleton component
 * Shows loading state for page title, filters, and manga grid
 */
export function BrowseSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Filter Bar Skeleton */}
      <Card className="px-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search input skeleton */}
          <Skeleton className="h-10 flex-1" />
          {/* Filter dropdowns skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </Card>

      {/* Manga Grid Skeleton */}
      <MangaGridSkeleton
        className="grid gap-4 grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        count={24}
      />
    </div>
  );
}
