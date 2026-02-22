import { Skeleton } from "@/components/ui/skeleton";

export function PopularGenresSkeleton() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative h-32 rounded-xl overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
