/**
 * Query Key Factory
 * Centralized query key definitions for React Query
 * Ensures consistent keys between server prefetch and client queries
 */

import type { FilterValues } from "@/components/browse/browse-filter-bar";

export const mangaKeys = {
  all: ["manga"] as const,
  lists: () => [...mangaKeys.all, "list"] as const,
  list: (filters: FilterValues, page: number) =>
    [...mangaKeys.lists(), { filters, page }] as const,
  details: () => [...mangaKeys.all, "detail"] as const,
  detail: (slug: string) => [...mangaKeys.details(), slug] as const,
};

export const genreKeys = {
  all: ["genres"] as const,
  list: () => [...genreKeys.all, "list"] as const,
};

export const chapterKeys = {
  all: ["chapters"] as const,
  list: (mangaSlug: string) => [...chapterKeys.all, mangaSlug] as const,
  detail: (chapterId: string) =>
    [...chapterKeys.all, "chapter", chapterId] as const,
};
