"use client";

/**
 * SearchResultItem Component
 * Individual search result with thumbnail, title, and latest chapter
 */

import Link from "next/link";

import type { MangaListItem } from "@/types/manga";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/manga/star-rating";

export interface SearchResultItemProps {
  manga: MangaListItem;
  isSelected: boolean;
  index: number;
  onClick: () => void;
  onMouseEnter: () => void;
}

export function SearchResultItem({
  manga,
  isSelected,
  index,
  onClick,
  onMouseEnter,
}: SearchResultItemProps) {
  return (
    <Link
      href={`/manga/${manga.slug}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      id={`search-result-${index}`}
      className={cn(
        "flex items-start gap-3 p-2 border-b last:border-b-0",
        "transition-colors duration-200",
        "hover:bg-accent/50 focus:bg-accent/50 focus:outline-none",
        isSelected && "bg-accent"
      )}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-14 h-20 bg-muted rounded-sm overflow-hidden">
        <img
          src={manga.cover_thumb_url}
          alt={manga.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {manga.caution && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold px-1 py-px leading-tight rounded-bl-sm">
            18+
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Title */}
        <h4 className="font-semibold capitalize text-sm line-clamp-2 leading-snug mb-1">
          {manga.name}
        </h4>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-0.5">
          <StarRating value={Math.round(manga.average_rating || 0)} readonly size="sm" />
          <span className="text-[11px] text-muted-foreground">
            {Number(manga.average_rating || 0).toFixed(1)}
          </span>
        </div>

        {/* Latest Chapter */}
        {manga.latest_chapter && (
          <p className="text-xs text-muted-foreground truncate">
            Chapter {manga.latest_chapter.name}
          </p>
        )}
      </div>
    </Link>
  );
}
