"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";

import { genreApi } from "@/lib/api/endpoints/manga";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GenresDropdownProps {
  className?: string;
}

export function GenresDropdown({ className }: GenresDropdownProps) {
  const tNav = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const tManga = useTranslations("manga");

  // Fetch genres - load 200 at a time (reasonable for dropdown)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["genres-dropdown", { per_page: 200 }],
    queryFn: () => genreApi.getList({ per_page: 200 }),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const genres = data?.data || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-1 font-medium transition-colors hover:text-foreground/80",
            className
          )}
        >
          {tNav("genres")}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 max-h-[400px] overflow-y-auto"
      >
        <DropdownMenuLabel>{tNav("allGenres")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {tNav("loadingGenres")}
            </span>
          </div>
        )}

        {isError && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            {tCommon("error")}
          </div>
        )}

        {!isLoading && !isError && genres.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            {tManga("noResults")}
          </div>
        )}

        {!isLoading && !isError && genres.length > 0 && (
          <>
            {genres.map((genre) => (
              <DropdownMenuItem key={genre.id} asChild>
                <Link
                  href={`/browse?genre=${genre.slug}`}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{genre.name}</span>
                  {genre.mangas_count !== undefined &&
                    genre.mangas_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {genre.mangas_count}
                      </span>
                    )}
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
