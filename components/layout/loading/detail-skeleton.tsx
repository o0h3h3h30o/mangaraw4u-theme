import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function MangaDetailSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex flex-col gap-8">
        {/* --- HEADER: SIDE-BY-SIDE LAYOUT --- */}
        <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Left: Cover Image */}
          <div className="shrink-0 w-[110px] sm:w-[150px] md:w-[220px]">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          </div>

          {/* Right: Info Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Stats Grid */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Author / Group / Updated */}
            <div className="flex flex-col gap-1 mt-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>

            {/* Tags */}
            <div className="hidden sm:flex flex-wrap gap-1.5 mt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-auto pt-2">
              <Skeleton className="h-9 w-32 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="px-1 space-y-2">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <Separator />

        {/* --- CHAPTER LIST --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-32 sm:w-48 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-border/40"
              >
                <div className="space-y-1.5 w-3/4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
