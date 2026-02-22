/**
 * useBrowseManga Hook
 * Data fetching hook for browse page with prefetch support
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { mangaKeys } from "@/lib/api/query-keys";
import type { FilterValues } from "@/components/browse/browse-filter-bar";
import type { MangaListParams } from "@/types/manga";

/**
 * Build API params from filter values and page
 */
function buildApiParams(filters: FilterValues, page: number): MangaListParams {
  const params: MangaListParams = {
    page,
    per_page: 24,
    sort: filters.sort,
  };

  if (filters.search) {
    params["filter[name]"] = filters.search;
  }

  if (filters.status && filters.status !== "all") {
    params["filter[status]"] = parseInt(filters.status, 10) as 1 | 2;
  }

  if (filters.genre && filters.genre !== "all") {
    params["filter[accept_genres]"] = filters.genre as unknown as number;
  }

  if (filters.author) {
    params["filter[author]"] = filters.author;
  }

  return params;
}

/**
 * Fetch manga with all filters via single browse endpoint
 */
function fetchManga(filters: FilterValues, page: number) {
  return mangaApi.getList(buildApiParams(filters, page));
}

/**
 * Hook for fetching browse manga data with prefetch support
 *
 * @param filters - Filter values for the manga list
 * @param page - Current page number
 * @returns Query result with prefetchNextPage function
 */
export function useBrowseManga(filters: FilterValues, page: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: mangaKeys.list(filters, page),
    queryFn: () => fetchManga(filters, page),
    staleTime: 60_000, // 1 min fresh
  });

  const prefetchNextPage = useCallback(() => {
    const totalPages = query.data?.meta?.pagination?.last_page || 1;
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: mangaKeys.list(filters, page + 1),
        queryFn: () => fetchManga(filters, page + 1),
        staleTime: 60_000,
      });
    }
  }, [queryClient, filters, page, query.data]);

  // Auto-prefetch next page when current page is loaded
  useEffect(() => {
    if (query.data && !query.isLoading) {
      // Prefetch next page after a short delay to avoid immediate requests
      const timer = setTimeout(() => {
        prefetchNextPage();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [query.data, query.isLoading, prefetchNextPage]);

  return { ...query, prefetchNextPage };
}
