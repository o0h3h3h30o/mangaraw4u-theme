"use client";

/**
 * Homepage Content (Client Component)
 * Handles data fetching and rendering with i18n support
 * Uses reusable manga components from @/components/manga
 */

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { mangaApi } from "@/lib/api/endpoints/manga";
import { MangaCarousel } from "@/components/manga/manga-carousel";
import { RecentlyUpdatedSection } from "@/components/manga/recently-updated-section";
import { RecentCommentsSidebar } from "@/components/manga/recent-comments-sidebar";
import { HotMangaSidebar } from "@/components/manga/hot-manga-sidebar";
import { MangaCarouselSkeleton } from "@/components/layout/loading";
import { Sparkles } from "lucide-react";
import { PopularGenresSection } from "@/components/manga/popular-genres-section";
import { MangaListItem } from "@/types/manga";
import { PaginatedResponse } from "@/types/api";

interface HomePageContentProps {
  initialCarouselMangas?: MangaListItem[];
}

/**
 * Homepage main content component
 */
export function HomePageContent({
  initialCarouselMangas,
}: HomePageContentProps) {
  const t = useTranslations("homepage");

  return (
    <div className="min-h-screen">
      {/* SEO: Primary H1 for page hierarchy (screen-reader accessible) */}
      <h1 className="sr-only">{t("h1")}</h1>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12">
        {/* Manga Carousel - Full Width */}
        <MangaCarouselSection initialMangas={initialCarouselMangas} />

        {/* Popular Genres Section */}
        <PopularGenresSection />

        {/* Newest Manga Carousel */}
        <NewestMangaSection />

        {/* Desktop: Flex layout with sidebar, Mobile: Vertical stack */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Suspense>
              <RecentlyUpdatedSection />
            </Suspense>
          </div>

          {/* Sidebar - Shows below on mobile, on right on desktop */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <RecentCommentsSidebar />
            <HotMangaSidebar sticky />
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Manga Carousel Section
 * Displays featured/hot manga in a carousel
 */
function MangaCarouselSection({
  initialMangas,
}: {
  initialMangas?: MangaListItem[];
}) {
  const t = useTranslations("homepage.sections");

  const { data, isLoading } = useQuery({
    queryKey: ["mangas", "manga-carousel"],
    queryFn: () => mangaApi.getTop("day", 10),
    initialData: initialMangas || undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });

  if (isLoading) {
    return <MangaCarouselSkeleton count={8} />;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <MangaCarousel
      mangas={data}
      title={t("hotManga")}
      icon={
        <Image
          src="/carousel-title.png"
          alt="Hot manga icon"
          width={36}
          height={36}
          className="w-8 h-8"
        />
      }
      autoplayDelay={5000}
    />
  );
}

/**
 * Newest Manga Carousel Section
 * Displays newly created manga (order by id desc)
 */
function NewestMangaSection() {
  const t = useTranslations("homepage.sections");

  const { data, isLoading } = useQuery({
    queryKey: ["mangas", "newest"],
    queryFn: () => mangaApi.getNewest(10),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });

  if (isLoading) {
    return <MangaCarouselSkeleton count={8} />;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <MangaCarousel
      mangas={data}
      title={t("newestManga")}
      icon={<Sparkles className="w-7 h-7 text-yellow-500" />}
      autoplayDelay={4000}
    />
  );
}
