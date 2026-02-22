"use client";

/**
 * Library Hooks
 * Custom React Query hooks for user library data (favorites)
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { userFavoritesApi } from "@/lib/api/endpoints/user";
import type { PaginatedResponse } from "@/types/api";
import type { FavoriteManga } from "@/types/manga";

// === Constants ===
const LIBRARY_STALE_TIME = 1000 * 60 * 5; // 5 minutes

// === Query Keys ===
export const libraryKeys = {
  all: ["library"] as const,
  favorites: (params?: { page?: number; per_page?: number }) =>
    [...libraryKeys.all, "favorites", params] as const,
};

// === Type Definitions ===
interface UseFavoritesParams {
  page?: number;
  per_page?: number;
  enabled?: boolean;
}

interface LibraryData<T> {
  items: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// === Query Hooks ===

/**
 * Hook for fetching user's favorite manga with pagination
 */
export function useFavorites({
  page = 1,
  per_page = 20,
  enabled = true,
}: UseFavoritesParams = {}) {
  return useQuery({
    queryKey: libraryKeys.favorites({ page, per_page }),
    queryFn: () => userFavoritesApi.getList({ page, per_page }),
    staleTime: LIBRARY_STALE_TIME,
    enabled,
    placeholderData: keepPreviousData,
    select: (
      data: PaginatedResponse<FavoriteManga>
    ): LibraryData<FavoriteManga> => ({
      items: data.data,
      pagination: data.meta.pagination,
    }),
  });
}

// === Mutation Hooks ===

/**
 * Hook for removing manga from favorites/bookmarks
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mangaId: number) => userFavoritesApi.remove(mangaId),

    onMutate: async (mangaId: number) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.all });

      const previousQueries = queryClient.getQueriesData<
        PaginatedResponse<FavoriteManga>
      >({
        queryKey: ["library", "favorites"],
      });

      queryClient.setQueriesData<PaginatedResponse<FavoriteManga>>(
        { queryKey: ["library", "favorites"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((manga) => manga.id !== mangaId),
            meta: {
              ...oldData.meta,
              pagination: {
                ...oldData.meta.pagination,
                total: oldData.meta.pagination.total - 1,
              },
            },
          };
        }
      );

      return { previousQueries };
    },

    onError: (_err, _mangaId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "favorites"] });
    },
  });
}

// === Prefetch Hook ===

export function useLibraryPrefetch() {
  const queryClient = useQueryClient();

  return {
    prefetchFavorites: (params?: { page?: number; per_page?: number }) =>
      queryClient.prefetchQuery({
        queryKey: libraryKeys.favorites(params || { page: 1, per_page: 20 }),
        queryFn: () =>
          userFavoritesApi.getList(params || { page: 1, per_page: 20 }),
        staleTime: LIBRARY_STALE_TIME,
      }),
    // History reads from localStorage, no prefetch needed
    prefetchHistory: () => Promise.resolve(),
  };
}
