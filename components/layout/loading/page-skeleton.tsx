import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "../container";
import { MangaCardSkeletonGrid } from "./manga-card-skeleton";

export function PageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="border-b">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-64" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-8">
        <div className="space-y-8">
          {/* Section Title */}
          <Skeleton className="h-8 w-48" />

          {/* Content Grid */}
          <MangaCardSkeletonGrid count={12} />
        </div>
      </Container>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <Container className="py-8">
      <div className="space-y-12">
        {/* Hero/Banner Section */}
        <Skeleton className="h-64 w-full rounded-lg md:h-96" />

        {/* Recently Updated Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
          <MangaCardSkeletonGrid count={6} />
        </div>

        {/* Hot Manga Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
          <MangaCardSkeletonGrid count={6} />
        </div>

        {/* Recommended Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-24" />
          </div>
          <MangaCardSkeletonGrid count={6} />
        </div>
      </div>
    </Container>
  );
}
