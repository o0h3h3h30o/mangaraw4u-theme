"use client";

/**
 * RecentlyUpdatedSection Component
 * Displays recently updated manga in a grid with header and pagination
 */

import { useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { mangaApi } from "@/lib/api/endpoints/manga";
import { MangaGrid } from "./manga-grid";
import { Pagination } from "@/components/ui/pagination";

export interface RecentlyUpdatedSectionProps {
  perPage?: number;
  className?: string;
}

/**
 * RecentlyUpdatedSection component
 * Fetches and displays recently updated manga using the main mangas API
 *
 * @param perPage - Number of manga items to fetch (default: 24)
 * @param className - Optional additional CSS classes
 */
export function RecentlyUpdatedSection({
  perPage = 30,
  className,
}: RecentlyUpdatedSectionProps) {
  const t = useTranslations("homepage.sections");
  const tEmpty = useTranslations("homepage.emptyStates");
  const sectionRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read page from URL search params
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ["mangas", "hot-new-releases", { page, per_page: perPage }],
    queryFn: () => mangaApi.getHotNewReleases({ page, per_page: perPage }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });

      if (sectionRef.current) {
        const yOffset = -100;
        const element = sectionRef.current;
        const targetY =
          element.getBoundingClientRect().top + window.scrollY + yOffset;

        const startY = window.scrollY;
        const distance = targetY - startY;
        const duration = 800;
        let startTime: number | null = null;

        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          window.scrollTo(0, startY + distance * ease);
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        };

        requestAnimationFrame(animation);
      }
    },
    [searchParams, router, pathname]
  );

  return (
    <div ref={sectionRef} className={className}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌇</span>
          <h2 className="text-2xl font-bold">{t("recentlyUpdated")}</h2>
        </div>
        <Link
          href="/browse"
          className="text-sm text-primary hover:underline font-medium"
        >
          {t("viewAll")} →
        </Link>
      </div>

      <div>
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-2">{tEmpty("loadError")}</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {!error && (
          <>
            <MangaGrid
              key={page}
              mangas={data?.data || []}
              isLoading={isLoading}
              emptyMessage={tEmpty("noManga")}
              columns={{ default: 3, sm: 3, md: 4, lg: 5 }}
            />

            {data?.meta?.pagination && data.meta.pagination.last_page > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={data.meta.pagination.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
