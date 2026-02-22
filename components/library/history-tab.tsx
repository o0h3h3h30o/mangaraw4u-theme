"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Star } from "lucide-react";

import { useReadingProgressStore } from "@/lib/store/readingProgressStore";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { EmptyState } from "./empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LibraryPagination } from "./library-pagination";
import { Button } from "@/components/ui/button";
import { getShimmerPlaceholder } from "@/lib/utils/image-placeholder";

const PER_PAGE = 24;

export function HistoryTab() {
  const t = useTranslations("user.library");
  const progress = useReadingProgressStore((s) => s.progress);
  const clearProgress = useReadingProgressStore((s) => s.clearProgress);
  const [page, setPage] = useState(1);

  // Sort all entries by timestamp desc
  const allEntries = useMemo(
    () =>
      Object.entries(progress).sort(
        ([, a], [, b]) => b.timestamp - a.timestamp
      ),
    [progress]
  );

  const totalPages = Math.ceil(allEntries.length / PER_PAGE);
  const pagedEntries = allEntries.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );
  const slugs = pagedEntries.map(([slug]) => slug);

  const { data: mangaMap, isLoading } = useQuery({
    queryKey: ["manga", "by-slugs", slugs],
    queryFn: () => mangaApi.getBySlugs(slugs),
    enabled: slugs.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  if (allEntries.length === 0) {
    return (
      <EmptyState
        variant="history"
        title={t("emptyStates.history.title")}
        description={t("emptyStates.history.description")}
        actionLabel={t("emptyStates.history.action")}
        actionHref="/browse"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleRemove = (slug: string) => {
    clearProgress(slug);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        {t("stats.totalHistory", { count: allEntries.length })}
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {pagedEntries.map(([slug, item]) => {
          const manga = mangaMap?.[slug];
          if (!manga) return null;

          return (
            <div key={slug} className="group relative flex flex-col space-y-1.5">
              <Link
                href={`/manga/${slug}/${item.chapterSlug}`}
                className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-sm hover:shadow-md transition-shadow"
              >
                <Image
                  src={manga.cover_full_url}
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
                    Chapter {item.chapterNumber}
                  </span>
                </div>
              </Link>
              <Link href={`/manga/${slug}`}>
                <h3 className="font-semibold capitalize text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {manga.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-[11px] text-muted-foreground">
                  {Number(manga.average_rating || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {new Date(item.timestamp).toLocaleDateString("vi-VN")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(slug)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <LibraryPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
