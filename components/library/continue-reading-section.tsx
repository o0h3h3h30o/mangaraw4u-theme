"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";

import { useReadingProgressStore } from "@/lib/store/readingProgressStore";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { EmptyState } from "./empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getShimmerPlaceholder } from "@/lib/utils/image-placeholder";

export function ContinueReadingSection() {
  const t = useTranslations("user.library");
  const progress = useReadingProgressStore((s) => s.progress);

  // Sort by timestamp desc, take first 12
  const entries = Object.entries(progress)
    .sort(([, a], [, b]) => b.timestamp - a.timestamp)
    .slice(0, 12);

  const slugs = entries.map(([slug]) => slug);

  const { data: mangaMap, isLoading } = useQuery({
    queryKey: ["manga", "by-slugs", slugs],
    queryFn: () => mangaApi.getBySlugs(slugs),
    enabled: slugs.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  if (slugs.length === 0) {
    return (
      <EmptyState
        variant="continue"
        title={t("emptyStates.continue.title")}
        description={t("emptyStates.continue.description")}
        actionLabel={t("emptyStates.continue.action")}
        actionHref="/browse"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {entries.map(([slug, item]) => {
        const manga = mangaMap?.[slug];
        if (!manga) return null;

        return (
          <Link
            key={slug}
            href={`/manga/${slug}/${item.chapterSlug}`}
            className="group flex flex-col space-y-1.5"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm hover:shadow-md transition-shadow">
              <Image
                src={manga.cover_thumb_url}
                alt={manga.name}
                fill
                sizes="(max-width: 640px) 205px, 195px"
                style={{ objectFit: "cover" }}
                placeholder="blur"
                blurDataURL={getShimmerPlaceholder()}
                unoptimized
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <span className="text-[11px] text-white font-medium">
                  Ch. {item.chapterNumber}
                </span>
              </div>
            </div>
            <h3 className="font-semibold capitalize text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {manga.name}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {new Date(item.timestamp).toLocaleDateString("vi-VN")}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
