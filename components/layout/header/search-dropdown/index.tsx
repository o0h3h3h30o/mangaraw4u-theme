"use client";

/**
 * SearchDropdown Component
 * Main dropdown container for live search results
 * Handles visibility, keyboard navigation, and accessibility
 */

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import type { MangaListItem } from "@/types/manga";
import { cn } from "@/lib/utils";
import { SearchResultItem } from "./search-result-item";
import { SearchSkeleton } from "./search-skeleton";
import { SearchEmpty } from "./search-empty";

export interface SearchDropdownProps {
  isOpen: boolean;
  results: MangaListItem[];
  isLoading: boolean;
  selectedIndex: number;
  query: string;
  totalResults?: number;
  onSelect: (manga: MangaListItem) => void;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function SearchDropdown({
  isOpen,
  results,
  isLoading,
  selectedIndex,
  query,
  totalResults,
  onSelect,
  onClose,
  onSelectIndex,
}: SearchDropdownProps) {
  const t = useTranslations("search");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(
        `[role="option"][aria-selected="true"]`
      );
      selectedElement?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Click outside detection
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Delay to prevent immediate close when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasResults = results.length > 0;
  const total = totalResults || results.length;
  const showViewAll = total > 10;

  return (
    <div
      ref={dropdownRef}
      id="search-dropdown"
      role="listbox"
      className={cn(
        "absolute top-full left-0 right-0 mt-2 z-50",
        "bg-popover text-popover-foreground",
        "border rounded-md shadow-lg",
        "backdrop-blur-sm",
        "max-h-[480px] md:max-h-[520px] overflow-y-auto",
        "animate-in fade-in-0 slide-in-from-top-2 duration-200",
        "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      )}
    >
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading && t("searching")}
        {!isLoading &&
          hasResults &&
          t("resultsFound", { count: results.length })}
        {!isLoading && !hasResults && query.length >= 2 && t("noResultsTitle")}
      </div>

      {/* Loading state */}
      {isLoading && <SearchSkeleton />}

      {/* Results */}
      {!isLoading && hasResults && (
        <div>
          {results.map((manga, index) => (
            <SearchResultItem
              key={manga.id}
              manga={manga}
              isSelected={selectedIndex === index}
              index={index}
              onClick={() => onSelect(manga)}
              onMouseEnter={() => onSelectIndex(index)}
            />
          ))}

          {/* View all results link */}
          {showViewAll && (
            <Link
              href={`/browse?q=${encodeURIComponent(query)}`}
              className={cn(
                "block p-3 text-center text-sm font-medium",
                "text-primary hover:bg-accent/50",
                "transition-colors duration-200",
                "border-t"
              )}
              onClick={onClose}
            >
              {t("viewAllResults", { count: total })}
            </Link>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasResults && query.length >= 2 && <SearchEmpty />}
    </div>
  );
}
