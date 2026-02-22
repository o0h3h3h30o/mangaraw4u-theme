"use client";

/**
 * Rating Hooks
 * Custom React Query hooks for manga rating functionality
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ratingApi } from "@/lib/api/endpoints/rating";
import { mangaKeys } from "@/lib/api/query-keys";
import type { RateMangaResponse } from "@/types/comment";
import type { Manga } from "@/types/manga";

/**
 * Hook for fetching user's current rating for a manga (IP-based)
 */
export function useUserRating(slug: string) {
  return useQuery({
    queryKey: ["rating", "user", slug],
    queryFn: () => ratingApi.getUserRating(slug),
    staleTime: Infinity,
  });
}

/**
 * Hook for rating a manga
 * Handles optimistic updates and cache invalidation
 */
export function useRateManga(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rating: number) => ratingApi.rateManga(slug, { rating }),

    onMutate: async (newRating) => {
      // Cancel outgoing manga detail refetch
      await queryClient.cancelQueries({
        queryKey: mangaKeys.detail(slug),
      });

      // Snapshot previous manga data
      const previousManga = queryClient.getQueryData<Manga>(
        mangaKeys.detail(slug)
      );

      return { previousManga };
    },

    onError: (err, newRating, context) => {
      // Rollback on error
      if (context?.previousManga) {
        queryClient.setQueryData(mangaKeys.detail(slug), context.previousManga);
      }
    },

    onSuccess: (data: RateMangaResponse, newRating) => {
      // Update manga cache with new average from server
      const updateManga = (oldManga: Manga | undefined) => {
        if (!oldManga) return oldManga;
        return {
          ...oldManga,
          average_rating: data.manga_stats.average_rating,
          total_ratings: data.manga_stats.total_ratings,
        };
      };
      queryClient.setQueryData<Manga>(mangaKeys.detail(slug), updateManga);
      queryClient.setQueryData<Manga>(["manga", slug], updateManga);

      // Update user rating cache
      queryClient.setQueryData(["rating", "user", slug], newRating);
    },

    onSettled: () => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: mangaKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: ["manga", slug] });
    },
  });
}
