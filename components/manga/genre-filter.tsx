"use client";

/**
 * GenreFilter Component
 * Interactive genre filter for manga browsing
 * Fetches genres from API and allows multi-select filtering
 */

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

import { genreApi } from "@/lib/api/endpoints/manga";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GenreFilterProps {
  className?: string;
  maxDisplay?: number;
  selectedGenreIds?: number[];
  onChange?: (genreIds: number[]) => void;
  showClearButton?: boolean;
}

/**
 * GenreFilter component for filtering manga by genres
 *
 * @param className - Optional additional CSS classes
 * @param maxDisplay - Maximum number of genres to display initially (default: all)
 * @param selectedGenreIds - Currently selected genre IDs (controlled mode)
 * @param onChange - Callback when genre selection changes (controlled mode)
 * @param showClearButton - Whether to show clear all filters button (default: true)
 */
export function GenreFilter({
  className,
  maxDisplay,
  selectedGenreIds,
  onChange,
  showClearButton = true,
}: GenreFilterProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch genres
  const { data, isLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genreApi.getList({ per_page: 100 }),
  });

  const genres = data?.data || [];
  const displayGenres = maxDisplay ? genres.slice(0, maxDisplay) : genres;

  // Get selected genres from URL or props
  const getSelectedGenres = (): number[] => {
    if (selectedGenreIds !== undefined) {
      return selectedGenreIds;
    }
    const genreParam = searchParams.get("genre_id");
    if (!genreParam) return [];
    return genreParam.split(",").map(Number);
  };

  const selected = getSelectedGenres();

  const toggleGenre = (genreId: number) => {
    const newSelected = selected.includes(genreId)
      ? selected.filter((id) => id !== genreId)
      : [...selected, genreId];

    if (onChange) {
      // Controlled mode
      onChange(newSelected);
    } else {
      // Uncontrolled mode - update URL
      const params = new URLSearchParams(searchParams.toString());
      if (newSelected.length > 0) {
        params.set("genre_id", newSelected.join(","));
      } else {
        params.delete("genre_id");
      }
      router.push(`?${params.toString()}`);
    }
  };

  const clearAllFilters = () => {
    if (onChange) {
      onChange([]);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("genre_id");
      router.push(`?${params.toString()}`);
    }
  };

  if (isLoading) {
    return <GenreFilterSkeleton className={className} />;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{t("filterByGenre")}</h3>
        {showClearButton && selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {t("clearFilters")}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayGenres.map((genre) => {
          const isSelected = selected.includes(genre.id);
          return (
            <Badge
              key={genre.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                isSelected && "bg-primary text-primary-foreground"
              )}
              onClick={() => toggleGenre(genre.id)}
            >
              {genre.name}
              {isSelected && <X className="h-3 w-3 ml-1" />}
            </Badge>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selected.length} {t("filters")}
        </div>
      )}
    </div>
  );
}

/**
 * GenreFilterSkeleton component for loading state
 */
export function GenreFilterSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-5 w-32" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}
