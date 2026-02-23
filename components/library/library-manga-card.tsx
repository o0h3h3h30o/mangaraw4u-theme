"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { X, Play, Star } from "lucide-react";

import type { MangaListItem } from "@/types/manga";
import type { ChapterListItem } from "@/types/chapter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LibraryMangaCardProps {
  manga: MangaListItem;
  /** Last read chapter info */
  lastReadChapter?: ChapterListItem;
  /** Last read timestamp */
  lastReadAt?: string;
  /** Show remove button */
  showRemove?: boolean;
  /** Remove handler */
  onRemove?: () => void;
  /** Is remove action pending */
  isRemoving?: boolean;
  /** Custom className */
  className?: string;
}

export const LibraryMangaCard = memo(function LibraryMangaCard({
  manga,
  lastReadChapter,
  lastReadAt,
  showRemove = false,
  onRemove,
  isRemoving = false,
  className,
}: LibraryMangaCardProps) {
  const t = useTranslations("user.library.card");
  const tCommon = useTranslations("homepage.mangaCard");

  // Build continue reading URL
  const continueUrl = lastReadChapter
    ? `/manga/${manga.slug}/${lastReadChapter.slug}`
    : `/manga/${manga.slug}`;

  return (
    <div className={cn("group relative flex flex-col space-y-1.5", className)}>
      {/* Cover Image Container */}
      <Link
        prefetch={false}
        href={continueUrl}
        className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-lg bg-muted",
          "shadow-sm hover:shadow-md transition-shadow duration-200"
        )}
      >
        <Image
          src={manga.cover_full_url}
          alt={manga.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover"
          priority={false}
          unoptimized
        />

        {/* Hot Badge */}
        {manga.is_hot && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-orange-500 text-white border-0 text-xs">
              {tCommon("hot")}
            </Badge>
          </div>
        )}

        {/* Continue Reading Overlay (on hover) */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <Play className="h-5 w-5" />
            {lastReadChapter ? t("continue") : t("start")}
          </div>
        </div>
      </Link>

      {/* Remove Button (absolute positioned) */}
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-1 left-1 h-7 w-7 rounded-full",
            "bg-black/50 hover:bg-red-500 text-white",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          disabled={isRemoving}
          aria-label={t("remove")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Title & Metadata */}
      <div className="space-y-0.5 pt-1">
        <Link prefetch={false} href={`/manga/${manga.slug}`}>
          <h3 className="font-semibold capitalize text-sm line-clamp-1 hover:text-primary transition-colors">
            {manga.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
          {/* Last Read Chapter or Latest Chapter */}
          {lastReadChapter ? (
            <p className="truncate" title={lastReadChapter.name}>
              Chapter {lastReadChapter.name}
            </p>
          ) : manga.latest_chapter ? (
            <p className="truncate" title={manga.latest_chapter.name}>
              Chapter {manga.latest_chapter.name}
            </p>
          ) : (
            <span />
          )}

          {/* Time ago (for history) */}
          {lastReadAt && (
            <span className="shrink-0 text-muted-foreground/70">
              {formatTimeAgo(lastReadAt)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <span className="text-[11px] text-muted-foreground">
            {Number(manga.average_rating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
});

// Helper: Format time ago string
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}
