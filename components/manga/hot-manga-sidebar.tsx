"use client";

/**
 * HotMangaSidebar Component
 * Displays top ranked manga with tabs (day/month/all)
 * Shows ranking numbers and compact card design
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Star } from "lucide-react";

import type { MangaListItem } from "@/types/manga";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HotMangaSidebarSkeleton } from "@/components/layout/loading";
import { cn } from "@/lib/utils";

export interface HotMangaSidebarProps {
  maxItems?: number;
  className?: string;
  sticky?: boolean;
}

type TabValue = "day" | "month" | "all";

export function HotMangaSidebar({
  maxItems = 10,
  className,
  sticky = false,
}: HotMangaSidebarProps) {
  const t = useTranslations("homepage.sections");
  const [activeTab, setActiveTab] = useState<TabValue>("day");

  const { data, isLoading, error } = useQuery({
    queryKey: ["mangas", "top", activeTab, maxItems],
    queryFn: () => mangaApi.getTop(activeTab, maxItems),
  });

  return (
    <div className={cn(sticky && "sticky top-4", className)}>
      <div>
        <div className="pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <h2 className="text-2xl font-bold">{t("topRanked")}</h2>
          </div>
        </div>
        <div>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="day">{t("tabs.day")}</TabsTrigger>
              <TabsTrigger value="month">{t("tabs.month")}</TabsTrigger>
              <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
            </TabsList>

            {(["day", "month", "all"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {isLoading || error || !data || data.length === 0 ? (
                  <HotMangaSidebarSkeleton count={maxItems} />
                ) : (
                  <div className="space-y-3">
                    {data.map((manga, index) => (
                      <RankedMangaCard
                        key={manga.id}
                        manga={manga}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/**
 * RankedMangaCard - Compact card for sidebar ranking
 */
interface RankedMangaCardProps {
  manga: MangaListItem;
  rank: number;
}

function RankedMangaCard({ manga, rank }: RankedMangaCardProps) {
  return (
    <Link
      prefetch={false}
      href={`/manga/${manga.slug}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
    >
      {/* Rank badge */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm",
          rank === 1 && "bg-yellow-500 text-yellow-950",
          rank === 2 && "bg-gray-400 text-gray-950",
          rank === 3 && "bg-orange-600 text-orange-50",
          rank > 3 && "bg-muted text-muted-foreground"
        )}
      >
        #{rank}
      </div>

      {/* Thumbnail */}
      <div className="relative h-16 w-12 flex-shrink-0 rounded overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={manga.cover_full_url}
          alt={manga.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading={rank <= 3 ? "eager" : "lazy"}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium capitalize text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {manga.name}
        </h3>
        {manga.latest_chapter && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            Chapter {manga.latest_chapter.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span>{Number(manga.average_rating || 0).toFixed(1)}</span>
          </div>
          <span>•</span>
          <span>{formatViews(manga.views)}</span>
        </div>
      </div>
    </Link>
  );
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
}
