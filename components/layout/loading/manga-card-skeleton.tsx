import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MangaCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        {/* Cover Image Skeleton */}
        <Skeleton className="aspect-[2/3] w-full" />
      </CardHeader>
      <CardContent className="p-4">
        {/* Title Skeleton */}
        <Skeleton className="mb-2 h-5 w-3/4" />
        {/* Subtitle/Info Skeleton */}
        <Skeleton className="mb-3 h-4 w-1/2" />
        {/* Badges Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

interface MangaCardSkeletonGridProps {
  count?: number;
}

export function MangaCardSkeletonGrid({
  count = 8,
}: MangaCardSkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}
