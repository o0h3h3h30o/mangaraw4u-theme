"use client";

/**
 * Genre Select Component
 * Dropdown for selecting manga genre
 */

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { genreApi } from "@/lib/api/endpoints/manga";
import { genreKeys } from "@/lib/api/query-keys";
import { STALE_TIMES } from "@/lib/constants";

export interface GenreSelectProps {
  value: string; // "all" or genre slug
  onChange: (value: string) => void;
  className?: string;
  hideLabel?: boolean;
}

/**
 * Genre select component for browse page
 *
 * @param value - Current selected genre slug or "all"
 * @param onChange - Callback when genre changes
 * @param className - Optional additional CSS classes
 * @param hideLabel - Hide the label (useful for compact layouts)
 */
export function GenreSelect({
  value,
  onChange,
  className,
  hideLabel = false,
}: GenreSelectProps) {
  const t = useTranslations("navigation");

  const { data, isLoading } = useQuery({
    queryKey: genreKeys.all,
    queryFn: () => genreApi.getList({ per_page: 100 }),
    staleTime: STALE_TIMES.LONG,
  });

  const genres = data?.data || [];

  return (
    <div className={className}>
      {!hideLabel && (
        <Label className="text-sm font-medium mb-2 block">{t("genres")}</Label>
      )}
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isLoading ? t("loadingGenres") : t("genres")}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allGenres")}</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={genre.slug}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
