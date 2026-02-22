"use client";

/**
 * SearchBar Component
 * Search input with live dropdown results
 */

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { mangaApi } from "@/lib/api/endpoints/manga";
import type { MangaListItem } from "@/types/manga";
import { SearchDropdown } from "./search-dropdown";

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

/**
 * SearchBar component with live search dropdown
 *
 * @param className - Optional additional CSS classes
 * @param placeholder - Optional custom placeholder text (overrides i18n default)
 */
export function SearchBar({ className, placeholder }: SearchBarProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [manuallyClosedDropdown, setManuallyClosedDropdown] = useState(false);
  const [prevResultsLength, setPrevResultsLength] = useState(0);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      // Reset manually closed flag when query changes
      setManuallyClosedDropdown(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  const { data, isLoading } = useQuery({
    queryKey: ["manga-search", debouncedQuery],
    queryFn: async () => {
      const response = await mangaApi.search({
        q: debouncedQuery,
        per_page: 10,
      });
      return response;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract results array from paginated response with useMemo to prevent re-renders
  const results = useMemo(() => data?.data || [], [data?.data]);

  // Derive dropdown visibility from current state (no useEffect needed)
  const isDropdownOpen = useMemo(() => {
    if (manuallyClosedDropdown) return false;
    return isFocused && debouncedQuery.length >= 2;
  }, [isFocused, debouncedQuery, manuallyClosedDropdown]);

  // Reset selected index when results.length changes
  // Use useLayoutEffect to update state synchronously before paint
  useEffect(() => {
    if (results.length !== prevResultsLength) {
      setPrevResultsLength(results.length);
      setSelectedIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length]);

  // Handle form submit (Enter key when no selection)
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (selectedIndex >= 0 && results[selectedIndex]) {
        // Navigate to selected manga
        const manga = results[selectedIndex];
        router.push(`/manga/${manga.slug}`);
        setManuallyClosedDropdown(true);
        setQuery("");
        inputRef.current?.blur();
      } else if (query.trim()) {
        // Navigate to search page
        router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
        setManuallyClosedDropdown(true);
        inputRef.current?.blur();
      }
    },
    [query, selectedIndex, results, router]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;

        case "Escape":
          e.preventDefault();
          setManuallyClosedDropdown(true);
          setSelectedIndex(-1);
          break;

        case "Tab":
          setManuallyClosedDropdown(true);
          setSelectedIndex(-1);
          break;
      }
    },
    [isDropdownOpen, results.length]
  );

  // Handle manga selection
  const handleSelectManga = useCallback(
    (manga: MangaListItem) => {
      router.push(`/manga/${manga.slug}`);
      setManuallyClosedDropdown(true);
      setQuery("");
      inputRef.current?.blur();
    },
    [router]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setManuallyClosedDropdown(false);
  }, []);

  // Handle blur with delay for click handling
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-9 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-controls="search-dropdown"
          aria-activedescendant={
            selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
        />
      </form>

      <SearchDropdown
        isOpen={isDropdownOpen}
        results={results}
        isLoading={isLoading}
        selectedIndex={selectedIndex}
        query={debouncedQuery}
        totalResults={data?.meta?.pagination?.total || results.length}
        onSelect={handleSelectManga}
        onClose={() => setManuallyClosedDropdown(true)}
        onSelectIndex={setSelectedIndex}
      />
    </div>
  );
}
