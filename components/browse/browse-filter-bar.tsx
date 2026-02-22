"use client";

/**
 * Browse Filter Bar Component
 * Main filter bar combining search, status, sort, and action buttons
 * Uses manual filter application (Apply button)
 * Layout: All controls in one row (responsive: stacks on mobile)
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusFilter } from "./status-filter";
import { SortSelect, type SortOption } from "./sort-select";
import { GenreSelect } from "./genre-select";

export interface FilterValues {
  search: string;
  status: string; // "all" | "1" | "2"
  sort: SortOption;
  genre: string; // "all" | genre_id
  author?: string; // author/artist slug
}

export interface BrowseFilterBarProps {
  initialValues: FilterValues;
  onApply: (values: FilterValues) => void;
  className?: string;
}

/**
 * Browse filter bar with manual application
 * Filters are only applied when the "Lọc" button is clicked
 *
 * @param initialValues - Initial filter values from URL
 * @param onApply - Callback when filters are applied
 * @param className - Optional additional CSS classes
 */
export function BrowseFilterBar({
  initialValues,
  onApply,
  className,
}: BrowseFilterBarProps) {
  const t = useTranslations("browse");

  // Local state for filter values (not applied until user clicks "Lọc")
  const [search, setSearch] = useState(initialValues.search);
  const [status, setStatus] = useState(initialValues.status);
  const [sort, setSort] = useState(initialValues.sort);
  const [genre, setGenre] = useState(initialValues.genre || "all");

  // Sync local state when URL-driven initialValues change (e.g. nav genre click)
  useEffect(() => { setSearch(initialValues.search); }, [initialValues.search]);
  useEffect(() => { setStatus(initialValues.status); }, [initialValues.status]);
  useEffect(() => { setSort(initialValues.sort); }, [initialValues.sort]);
  useEffect(() => { setGenre(initialValues.genre || "all"); }, [initialValues.genre]);

  const handleApply = () => {
    onApply({ search, status, sort, genre });
  };

  const handleClear = () => {
    const clearedValues: FilterValues = {
      search: "",
      status: "all",
      sort: "-updated_at",
      genre: "all",
    };
    setSearch(clearedValues.search);
    setStatus(clearedValues.status);
    setSort(clearedValues.sort);
    setGenre(clearedValues.genre);
    onApply(clearedValues);
  };

  const hasFilters =
    search !== "" ||
    status !== "all" ||
    sort !== "-updated_at" ||
    genre !== "all" ||
    !!initialValues.author;

  return (
    <Card className={className}>
      <div className="px-6">
        {/* Single Row Layout - Responsive */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input - Full width on mobile, flex-1 on desktop */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApply();
                }
              }}
              className="pl-9"
            />
          </div>

          {/* Filters Row - Stack on mobile, inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-2">
            {/* Sort Select */}
            <div className="w-full sm:w-40">
              <SortSelect value={sort} onChange={setSort} hideLabel />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <StatusFilter value={status} onChange={setStatus} hideLabel />
            </div>

            {/* Genre Filter */}
            <div className="w-full sm:w-40">
              <GenreSelect value={genre} onChange={setGenre} hideLabel />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                className="flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("applyFilters")}</span>
                <span className="sm:hidden">{t("applyFilters")}</span>
              </Button>

              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 sm:flex-none sm:w-auto whitespace-nowrap"
                >
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("clearFilters")}</span>
                  <span className="sm:hidden">{t("clearFilters")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
