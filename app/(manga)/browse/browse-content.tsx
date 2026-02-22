"use client";

/**
 * Browse Content Component
 * Client component for browse page with filters, manga grid, and pagination
 */

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { BrowseFilterBar, type FilterValues } from "@/components/browse";
import { MangaGrid } from "@/components/manga/manga-grid";
import { Pagination } from "@/components/ui/pagination";
import { useBrowseManga } from "@/hooks/use-browse-manga";
import { genreApi } from "@/lib/api/endpoints/manga";
import { genreKeys } from "@/lib/api/query-keys";
import { STALE_TIMES } from "@/lib/constants";
import type { SortOption } from "@/components/browse/sort-select";
import { formatNumber } from "@/lib/utils";

interface BrowseContentProps {
  searchParams: {
    page?: string;
    status?: string;
    sort?: string;
    q?: string;
    genre?: string;
    author?: string;
  };
}

/**
 * Parse URL search params into filter values
 */
function parseSearchParams(searchParams: BrowseContentProps["searchParams"]): {
  filters: FilterValues;
  page: number;
} {
  return {
    filters: {
      search: searchParams.q || "",
      status: searchParams.status || "all",
      sort: (searchParams.sort as SortOption) || "-updated_at",
      genre: searchParams.genre || "all",
      author: searchParams.author || undefined,
    },
    page: parseInt(searchParams.page || "1", 10),
  };
}

/**
 * Build URL with filter params
 */
function buildUrl(filters: FilterValues, page: number): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.sort !== "-updated_at") {
    params.set("sort", filters.sort);
  }

  if (filters.search) {
    params.set("q", filters.search);
  }

  if (filters.genre && filters.genre !== "all") {
    params.set("genre", filters.genre);
  }

  if (filters.author) {
    params.set("author", filters.author);
  }

  const queryString = params.toString();
  return queryString ? `/browse?${queryString}` : "/browse";
}

/**
 * Browse content component with filters and pagination
 */
export function BrowseContent({ searchParams }: BrowseContentProps) {
  const t = useTranslations("browse");
  const router = useRouter();

  // Parse values from URL
  const { filters, page } = parseSearchParams(searchParams);

  // Fetch manga list with prefetch support
  const { data, isLoading, error, prefetchNextPage } = useBrowseManga(
    filters,
    page
  );

  // Fetch genres list (cached, shared with GenreSelect)
  const { data: genresData } = useQuery({
    queryKey: genreKeys.all,
    queryFn: () => genreApi.getList({ per_page: 100 }),
    staleTime: STALE_TIMES.LONG,
  });

  // Determine page title based on active filter
  const isGenreOnly =
    filters.genre &&
    filters.genre !== "all" &&
    !filters.search &&
    !filters.author &&
    filters.status === "all" &&
    filters.sort === "-updated_at";

  const genreName = isGenreOnly
    ? genresData?.data?.find((g) => g.slug === filters.genre)?.name
    : null;

  // Show author name as title when filtering by author
  const authorTitle = filters.author || null;

  const pageTitle = genreName || authorTitle || t("title");

  // Handle filter apply
  const handleApplyFilters = (newFilters: FilterValues) => {
    router.push(buildUrl(newFilters, 1));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    router.push(buildUrl(filters, newPage));

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mangas = data?.data || [];
  const pagination = data?.meta?.pagination;
  const totalPages = pagination?.last_page || 1;
  const totalCount = pagination?.total || 0;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        {!isLoading && totalCount > 0 && (
          <p className="text-muted-foreground">
            {t("totalResults", { count: formatNumber(totalCount) })}
          </p>
        )}
      </div>

      {/* Filter Bar */}
      <BrowseFilterBar initialValues={filters} onApply={handleApplyFilters} />

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{t("noResults")}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("noResultsDescription")}
          </p>
        </div>
      )}

      {/* Manga Grid */}
      {!error && (
        <>
          <MangaGrid
            key={page}
            mangas={mangas}
            isLoading={isLoading}
            className="xl:grid-cols-7"
            columns={{
              default: 2,
              sm: 3,
              md: 4,
              lg: 6,
            }}
            emptyMessage={
              <div className="text-center">
                <p className="text-lg font-medium">{t("noResults")}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("noResultsDescription")}
                </p>
              </div>
            }
          />

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
}
