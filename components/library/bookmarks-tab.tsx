"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useFavorites } from "@/lib/hooks/use-library";
import { useRemoveBookmark } from "@/lib/hooks/use-library";
import { LibraryMangaCard } from "./library-manga-card";
import { EmptyState } from "./empty-state";
import { TabContentSkeleton } from "./library-skeleton";
import { LibraryPagination } from "./library-pagination";

export function BookmarksTab() {
  const t = useTranslations("user.library");
  const tNotify = useTranslations("notifications");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, isFetching, error } = useFavorites({ page, per_page: perPage });
  const removeMutation = useRemoveBookmark();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemove = async (mangaId: number, mangaName: string) => {
    try {
      await removeMutation.mutateAsync(mangaId);
      toast.success(tNotify("bookmarkRemoved"), {
        description: mangaName,
      });
    } catch {
      toast.error(t("errors.removeFailed"));
    }
  };

  if (isLoading) {
    return <TabContentSkeleton showStats gridCount={perPage} />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        {t("errors.loadFailed")}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        variant="bookmarks"
        title={t("emptyStates.bookmarks.title")}
        description={t("emptyStates.bookmarks.description")}
        actionLabel={t("emptyStates.bookmarks.action")}
        actionHref="/manga"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="text-sm text-muted-foreground">
        {t("stats.totalBookmarks", { count: data.pagination.total })}
      </div>

      {/* Grid */}
      <div className={`grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 transition-opacity ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
        {data.items.map((manga) => (
          <LibraryMangaCard
            key={manga.id}
            manga={manga}
            showRemove
            onRemove={() => handleRemove(manga.id, manga.name)}
            isRemoving={removeMutation.isPending}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.last_page > 1 && (
        <LibraryPagination
          currentPage={page}
          totalPages={data.pagination.last_page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
