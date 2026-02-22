/**
 * Browse Page
 * Server component for manga browsing with filters and pagination
 * Implements SSR prefetch and streaming with Suspense
 */

import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";
import {
  generatePageMetadata,
  generateDefaultMetadata,
} from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/config";
import { getQueryClient } from "@/lib/api/query-client";
import { mangaKeys, genreKeys } from "@/lib/api/query-keys";
import { BrowseContent } from "./browse-content";
import { BrowseSkeleton } from "@/components/browse/browse-skeleton";
import type { SortOption } from "@/components/browse/sort-select";
import { API_BASE_URL } from "@/lib/api/config";
import { getTranslations } from "next-intl/server";

/**
 * Generate metadata for browse page
 */
interface BrowsePageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    sort?: string;
    q?: string;
    genre?: string;
    author?: string;
  }>;
}

/**
 * Generate metadata for browse page
 */
export async function generateMetadata({
  searchParams,
}: BrowsePageProps): Promise<Metadata> {
  const params = await searchParams;
  const t = await getTranslations("seo");

  // If there are search params (filters, pagination, etc.), deindex the page
  const hasParams = Object.keys(params).length > 0;

  const title = t("browse.title");
  const description = t("browse.description");

  // Get base metadata to inherit from
  const baseMetadata = await generateDefaultMetadata();
  const pageMetadata = await generatePageMetadata({
    title,
    description,
  });

  return {
    ...baseMetadata,
    ...pageMetadata,
    title: `${title} | ${siteConfig.name}`, // Override title template if needed
    openGraph: {
      ...baseMetadata.openGraph,
      ...pageMetadata.openGraph,
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/browse`,
    },
    twitter: {
      ...baseMetadata.twitter,
      ...pageMetadata.twitter,
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    ...(hasParams && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

/**
 * Prefetch browse data on server
 * Prefetches manga list and genres for SSR
 */
async function prefetchBrowseData(
  params: Awaited<BrowsePageProps["searchParams"]>
) {
  const queryClient = getQueryClient();

  // Parse filters from search params
  const filters = {
    search: params.q || "",
    status: params.status || "all",
    sort: (params.sort as SortOption) || "-updated_at",
    genre: params.genre || "all",
    author: params.author || undefined,
  };
  const page = parseInt(params.page || "1", 10);

  // Build API URL for manga list
  const mangaParams = new URLSearchParams({
    page: String(page),
    per_page: "24",
    sort: filters.sort,
    include: "genres,artist,latest_chapter",
  });

  if (filters.search) {
    mangaParams.set("filter[name]", filters.search);
  }

  if (filters.status && filters.status !== "all") {
    mangaParams.set("filter[status]", filters.status);
  }

  if (filters.genre && filters.genre !== "all") {
    mangaParams.set("filter[accept_genres]", filters.genre);
  }

  if (filters.author) {
    mangaParams.set("filter[author]", filters.author);
  }

  // Parallel prefetch - manga list + genres
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: mangaKeys.list(filters, page),
      queryFn: () =>
        fetch(`${API_BASE_URL}/mangas?${mangaParams.toString()}`).then((r) => {
          if (!r.ok) {
            throw new Error("Failed to fetch manga list");
          }
          return r.json();
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: genreKeys.all,
      queryFn: () =>
        fetch(`${API_BASE_URL}/genres?per_page=100`).then((r) => {
          if (!r.ok) {
            throw new Error("Failed to fetch genres");
          }
          return r.json();
        }),
    }),
  ]);

  return dehydrate(queryClient);
}

/**
 * Browse page - displays manga list with filters and pagination
 * Implements SSR prefetch and streaming with Suspense
 */
export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const dehydratedState = await prefetchBrowseData(params);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <HydrationBoundary state={dehydratedState}>
        <Suspense fallback={<BrowseSkeleton />}>
          <BrowseContent searchParams={params} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
