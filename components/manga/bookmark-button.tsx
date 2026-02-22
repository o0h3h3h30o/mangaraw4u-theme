"use client";

/**
 * Bookmark Button Component
 * Allows authenticated users to add/remove manga from their favorites
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";
import { userFavoritesApi } from "@/lib/api/endpoints/user";
import { cn } from "@/lib/utils";
import { STALE_TIMES } from "@/lib/constants";
import type { Manga } from "@/types/manga";

interface BookmarkButtonProps {
  manga: Pick<Manga, "id" | "name">;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export function BookmarkButton({
  manga,
  variant = "outline",
  size = "default",
  showText = true,
  className,
}: BookmarkButtonProps) {
  const t = useTranslations("manga");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tNotifications = useTranslations("notifications");

  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Use React Query to manage bookmark status - single source of truth
  const { data: favoriteStatus } = useQuery({
    queryKey: ["user", "favorites", manga.id, "status"],
    queryFn: () => userFavoritesApi.checkStatus(manga.id),
    enabled: isAuthenticated,
    staleTime: STALE_TIMES.LONG,
  });

  const isBookmarked = favoriteStatus?.is_favorited ?? false;

  // Add to favorites mutation with optimistic update
  const addMutation = useMutation({
    mutationFn: () => userFavoritesApi.add({ manga_id: manga.id }),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["user", "favorites", manga.id, "status"],
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData([
        "user",
        "favorites",
        manga.id,
        "status",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["user", "favorites", manga.id, "status"], {
        is_favorited: true,
        manga_id: manga.id,
      });

      return { previousStatus };
    },
    onSuccess: () => {
      toast.success(tNotifications("bookmarkAdded"), {
        description: manga.name,
      });
      // Invalidate favorites list to refresh library page
      queryClient.invalidateQueries({
        queryKey: ["user", "favorites"],
        refetchType: "none", // Don't refetch immediately
      });
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ["user", "favorites", manga.id, "status"],
          context.previousStatus
        );
      }
      const errorMessage =
        error instanceof Error ? error.message : tErrors("general");
      toast.error(tErrors("general"), {
        description: errorMessage,
      });
    },
    onSettled: () => {
      // Always refetch status to sync with server (but won't duplicate initial mutation)
      queryClient.invalidateQueries({
        queryKey: ["user", "favorites", manga.id, "status"],
      });
    },
  });

  // Remove from favorites mutation with optimistic update
  const removeMutation = useMutation({
    mutationFn: () => userFavoritesApi.remove(manga.id),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["user", "favorites", manga.id, "status"],
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData([
        "user",
        "favorites",
        manga.id,
        "status",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["user", "favorites", manga.id, "status"], {
        is_favorited: false,
        manga_id: manga.id,
      });

      return { previousStatus };
    },
    onSuccess: () => {
      toast.success(tNotifications("bookmarkRemoved"), {
        description: manga.name,
      });
      // Invalidate favorites list to refresh library page
      queryClient.invalidateQueries({
        queryKey: ["user", "favorites"],
        refetchType: "none", // Don't refetch immediately
      });
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ["user", "favorites", manga.id, "status"],
          context.previousStatus
        );
      }
      const errorMessage =
        error instanceof Error ? error.message : tErrors("general");
      toast.error(tErrors("general"), {
        description: errorMessage,
      });
    },
    onSettled: () => {
      // Always refetch status to sync with server
      queryClient.invalidateQueries({
        queryKey: ["user", "favorites", manga.id, "status"],
      });
    },
  });

  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error(tErrors("unauthorized"), {
        description: t("addToBookmarks"),
      });
      return;
    }

    if (isBookmarked) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  const buttonText = isBookmarked
    ? showText
      ? t("bookmarked")
      : ""
    : showText
      ? tCommon("bookmark")
      : "";

  const Icon = isBookmarked ? BookmarkCheck : Bookmark;

  return (
    <Button
      onClick={handleClick}
      variant={isBookmarked ? "default" : variant}
      size={size}
      disabled={isLoading}
      className={cn(
        "border-2 transition-all",
        isBookmarked
          ? "border-yellow-500/50 bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90 hover:border-yellow-500/70"
          : "border-muted-foreground/30 hover:border-primary/40",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      {buttonText && <span className="ml-2">{buttonText}</span>}
    </Button>
  );
}
