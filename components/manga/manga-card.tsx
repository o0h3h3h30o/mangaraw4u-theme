"use client";

/**
 * MangaCard Component
 * Reusable card component for displaying manga with cover, title, and metadata
 * Used in grids, lists, and carousels throughout the application
 */

import { memo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";

import type { MangaListItem } from "@/types/manga";
import { Badge } from "@/components/ui/badge";
import { cn, getTimeAgo } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image-placeholder";
import { mangaKeys } from "@/lib/api/query-keys";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { StarRating } from "@/components/manga/star-rating";

export interface MangaCardProps {
  manga: MangaListItem;
  className?: string;
  priority?: boolean; // For first N items in lists
}

/**
 * MangaCard component for displaying individual manga items
 * Minimalist design with essential information only
 *
 * @param manga - Manga data to display
 * @param className - Optional additional CSS classes
 */
export const MangaCard = memo(function MangaCard({
  manga,
  className,
  priority,
}: MangaCardProps) {
  const t = useTranslations("homepage.mangaCard");
  const queryClient = useQueryClient();

  // Prefetch manga detail on hover for faster navigation
  const handleMouseEnter = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: mangaKeys.detail(manga.slug),
      queryFn: () => mangaApi.getDetail(manga.slug),
      staleTime: 60_000, // 1 minute fresh
    });
  }, [queryClient, manga.slug]);

  const mangaHref = `/manga/${manga.slug}`;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={cn("group flex flex-col space-y-1.5", className)}
      onMouseEnter={handleMouseEnter}
    >
      <Link
        href={mangaHref}
        className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-lg bg-muted",
          "shadow-sm hover:shadow-md transition-shadow duration-200"
        )}
      >
        {/* Cover Image */}
        <Image
          src={imgError ? getShimmerPlaceholder() : manga.cover_full_url}
          alt={manga.name}
          fill
          sizes="(max-width: 640px) 205px, 195px"
          style={{ objectFit: "cover" }}
          placeholder="blur"
          blurDataURL={getShimmerPlaceholder()}
          priority={priority}
          unoptimized
          onError={() => setImgError(true)}
        />

        {/* 18+ Badge */}
        {manga.caution ? (
          <div className="absolute top-0 right-0 z-20">
            <Badge className="bg-red-600 text-white border-0 text-xs font-bold px-2 py-0.5 rounded-none rounded-bl-md">
              18+
            </Badge>
          </div>
        ) : null}

        {/* Time Ago Badge */}
        {manga.updated_at && (
          <div className="absolute top-0 left-0 z-10">
            <Badge className="bg-[#56ccf2] text-white border-0 text-[10px] font-bold px-2 py-0.5 rounded-none rounded-br-md">
              {t(`timeAgo.${getTimeAgo(manga.updated_at).key}`, { count: getTimeAgo(manga.updated_at).count })}
            </Badge>
          </div>
        )}
      </Link>

      <div className="space-y-0.5 pt-1">
        {/* Title */}
        <Link href={mangaHref}>
          <h3 className="font-semibold capitalize text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {manga.name}
          </h3>
        </Link>

        {/* Metadata (Chapter) */}
        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
          {manga.latest_chapter ? (
            <Link
              href={`${mangaHref}/${manga.latest_chapter.slug}`}
              className="truncate hover:text-primary transition-colors"
              title={manga.latest_chapter.name}
            >
              Chapter {manga.latest_chapter.name}
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-1">
          <StarRating
            value={Math.round(manga.average_rating || 0)}
            readonly={true}
            size="sm"
          />
          <span className="text-[11px] text-muted-foreground">
            {Number(manga.average_rating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
});
