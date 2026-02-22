"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatNumber } from "@/lib/utils";
import { genreApi } from "@/lib/api/endpoints/manga";

// Visual style pool - cycled for dynamic genres
const STYLE_POOL = [
  {
    image: "/drama-girl-2.png",
    bgImage: "/slide-0.png",
    bgClass: "bg-primary/60 hover:bg-primary/40",
    textClass: "text-primary-foreground dark:text-white/60",
  },
  {
    image: "/action-girl.png",
    bgImage: "/slide-action.png",
    bgClass: "bg-chart-2/30 hover:bg-chart-2/20",
    textClass: "text-background dark:text-white/60",
  },
  {
    image: "/romance-girl.png",
    bgImage: "/slide-2-2.png",
    bgClass: "bg-chart-2/30 hover:bg-chart-2/20",
    textClass: "text-chart-1/80 dark:text-white/60",
  },
  {
    image: "/fantasy-girl.png",
    bgImage: "/slide-3-3.png",
    bgClass: "bg-chart-5/30 hover:bg-chart-5/20",
    textClass: "text-chart-1/80 dark:text-chart-5/60",
  },
];

export function PopularGenresSection() {
  const { data: genres, isLoading } = useQuery({
    queryKey: ["categories", "popular"],
    queryFn: () => genreApi.getPopular(4),
    staleTime: 30 * 24 * 60 * 60_000, // 30 days
    gcTime: 30 * 24 * 60 * 60_000,
  });

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!genres || genres.length === 0) return null;

  return (
    <section className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-8">
        {genres.map((genre, index) => {
          const style = STYLE_POOL[index % STYLE_POOL.length];
          return (
            <Link
              key={genre.id}
              href={`/browse?genre=${genre.slug}`}
              className="group"
            >
              <Card
                className={cn(
                  "relative h-32 overflow-visible transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl",
                  style.bgClass
                )}
              >
                <Image
                  src={style.bgImage}
                  alt=""
                  fill
                  className="object-cover object-center opacity-40 transition-opacity duration-300 group-hover:opacity-30"
                  style={{ mixBlendMode: "overlay" }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={75}
                  priority={false}
                />

                <div className="absolute inset-0 flex items-center px-6 z-10">
                  <div className="z-10">
                    <h3
                      className={cn(
                        "text-3xl font-black uppercase tracking-wider font-road-rage",
                        style.textClass
                      )}
                    >
                      {genre.name}
                    </h3>
                    <span className="text-xs font-medium text-foreground mt-1 block group-hover:text-foreground transition-colors">
                      {formatNumber(genre.manga_count)} manga &rarr;
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-40 h-48 pointer-events-none">
                  <Image
                    src={style.image}
                    alt={genre.name}
                    fill
                    className="object-contain object-bottom drop-shadow-xl transition-transform duration-300 group-hover:scale-110 z-10"
                    sizes="(max-width: 640px) 280px, 160px"
                  />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
