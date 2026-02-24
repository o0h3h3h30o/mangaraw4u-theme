"use client";

/**
 * MangaCarouselCard Component
 * Specialized card component for carousel display
 * Features: Gradient overlay at bottom with title and chapter info inside the image
 */

import { memo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";

import { Star } from "lucide-react";

import type { MangaListItem } from "@/types/manga";
import { Badge } from "@/components/ui/badge";
import { cn, getTimeAgo } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image-placeholder";

export interface MangaCarouselCardProps {
  manga: MangaListItem;
  className?: string;
  priority?: boolean;
}

/**
 * MangaCarouselCard component for displaying manga in carousels
 * Optimized for carousel display with overlay gradient and text inside image
 *
 * @param manga - Manga data to display
 * @param className - Optional additional CSS classes
 */
export const MangaCarouselCard = memo(function MangaCarouselCard({
  manga,
  className,
  priority,
}: MangaCarouselCardProps) {
  const t = useTranslations("homepage.mangaCard");

  return (
    <Link
      href={`/manga/${manga.slug}`}
      className={cn("group block", className)}
    >
      <div
        className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-lg",
          "transition-shadow duration-200",
          "hover:shadow-lg hover:border-primary"
        )}
      >
        {/* Cover Image */}
        <Image
          src={manga.cover_thumb_url}
          alt={manga.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          style={{ objectFit: "cover" }}
          placeholder="blur"
          blurDataURL={getShimmerPlaceholder()}
          priority={priority}
          unoptimized
        />

        {/* 18+ Badge */}
        {manga.caution && (
          <div className="absolute top-0 right-0 z-20">
            <Badge className="bg-red-600 text-white border-0 text-xs font-bold px-2 py-0.5 rounded-none rounded-bl-md">
              18+
            </Badge>
          </div>
        )}

        {/* Time Ago Badge */}
        {manga.updated_at && (
          <div className="absolute top-0 left-0 z-10">
            <Badge className="bg-[#56ccf2] text-white border-0 text-[10px] font-bold px-2 py-0.5 rounded-none rounded-br-md">
              {t(`timeAgo.${getTimeAgo(manga.updated_at).key}`, { count: getTimeAgo(manga.updated_at).count })}
            </Badge>
          </div>
        )}

        {/* Gradient Overlay at Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        {/* Text Content - Inside Image with Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 space-y-1">
          {/* Title */}
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-1 capitalize">
            {manga.name}
          </h3>

          {/* Latest Chapter */}
          <div className="text-xs">
            {manga.latest_chapter ? (
              <p className="text-gray-200 truncate" title={manga.latest_chapter.name}>
                Chapter {manga.latest_chapter.name}
              </p>
            ) : (
              <span className="text-gray-400 text-xs">{t("noChapter")}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="text-[11px] text-gray-200">
              {Number(manga.average_rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
