"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ChevronRight,
  Eye,
  Search,
  ArrowUpDown,
  CalendarDays,
  User,
  Paintbrush,
  PawPrint,
  BookOpen,
} from "lucide-react";
import { useState, useMemo, useCallback, type ComponentType } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MangaDetailSkeleton } from "@/components/layout/loading/detail-skeleton";
import { BookmarkButton } from "@/components/manga/bookmark-button";
import { StarRating } from "@/components/manga/star-rating";
import { mangaApi, CaptchaRequiredError } from "@/lib/api/endpoints/manga";
import { useAuthStore } from "@/lib/store/authStore";
import { cn, formatNumber } from "@/lib/utils";
import { useMangaComments, useAddMangaComment } from "@/lib/hooks/use-comments";
import { useRateManga, useUserRating } from "@/lib/hooks/use-rating";
import type { Manga } from "@/types/manga";
import type { ChapterListItem } from "@/types/chapter";
import { CommentsSkeleton } from "@/components/comments/comments-skeleton";
import { LazyCommentWrapper } from "@/components/comments/lazy-comment-wrapper";
import { useReadingProgressStore } from "@/lib/store/readingProgressStore";
import { STALE_TIMES } from "@/lib/constants";

// Dynamic import for CommentSection - reduces initial bundle size
const CommentSection = dynamic(
  () =>
    import("@/components/comments/comment-section").then((mod) => ({
      default: mod.CommentSection,
    })),
  {
    loading: () => <CommentsSkeleton />,
    ssr: false,
  }
);

// --- Sub-components ---

// Component hiển thị thông tin dạng dòng nhỏ gọn
interface MetaItemProps {
  icon: ComponentType<{ className?: string }>;
  text: string;
  className?: string;
}

const MetaItem = ({ icon: Icon, text, className }: MetaItemProps) => (
  <div
    className={cn(
      "flex items-center gap-1.5 text-xs text-muted-foreground",
      className
    )}
  >
    <Icon className="h-3.5 w-3.5" />
    <span className="line-clamp-1">{text}</span>
  </div>
);

const Breadcrumb = ({ name }: { name: string }) => {
  const t = useTranslations("navigation");
  return (
    <nav className="flex items-center text-xs sm:text-sm text-muted-foreground mb-4 overflow-hidden whitespace-nowrap mask-linear-fade">
      <Link prefetch={false} href="/" className="hover:text-primary transition-colors">
        {t("home")}
      </Link>
      <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0" />
      <Link prefetch={false} href="/browse" className="hover:text-primary transition-colors">
        {t("mangaList")}
      </Link>
      <ChevronRight className="h-3 w-3 mx-1 flex-shrink-0" />
      <span className="font-medium text-foreground truncate">{name}</span>
    </nav>
  );
};

// Component mô tả có nút xem thêm
// Component mô tả có nút xem thêm
const ExpandableDescription = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("manga.detail");

  const cleanContent = useMemo(() => {
    if (!content) return "";
    return content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/\n\s*\n/g, "\n\n")
      .trim();
  }, [content]);

  if (!cleanContent) return null;

  return (
    <div className="group relative mt-3">
      <div
        className={cn(
          "text-sm text-muted-foreground whitespace-pre-line leading-normal overflow-hidden",
          !isExpanded && "line-clamp-3"
        )}
      >
        {cleanContent}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {isExpanded ? t("showLess") : t("showMore")}
      </button>
    </div>
  );
};

// Rating display with average fallback when user hasn't voted
interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  userVote: number | null | undefined;
  onRate: (rating: number) => void;
  isLoading: boolean;
}

const RatingDisplay = ({
  averageRating,
  totalRatings,
  userVote,
  onRate,
  isLoading,
}: RatingDisplayProps) => {
  const tRating = useTranslations("rating");
  const hasVoted = userVote != null && userVote > 0;
  const displayValue = hasVoted ? userVote : Math.round(averageRating || 0);

  return (
    <div className="flex items-center gap-1.5">
      <StarRating
        value={displayValue}
        onChange={onRate}
        size="sm"
        isLoading={isLoading}
      />
      <span className="text-xs text-muted-foreground">
        {Number(averageRating || 0).toFixed(1)}
        <span className="ml-0.5">({formatNumber(totalRatings || 0)})</span>
      </span>
    </div>
  );
};

// --- Main Components ---

interface MangaDetailProps {
  manga: Manga;
  chapters: ChapterListItem[];
  isChaptersLoading?: boolean;
  sortOrder: "newest" | "oldest";
  setSortOrder: (order: "newest" | "oldest") => void;
}

function MangaDetail({
  manga,
  chapters,
  isChaptersLoading = false,
  sortOrder,
  setSortOrder,
}: MangaDetailProps) {
  const t = useTranslations("manga");
  const tCommon = useTranslations("common");
  const tChapter = useTranslations("chapter");
  const tComment = useTranslations("comment");
  const tRating = useTranslations("rating");

  const [searchTerm, setSearchTerm] = useState("");
  const [commentSort, setCommentSort] = useState<"asc" | "desc">("desc");
  const [commentPage, setCommentPage] = useState(1);

  // Rating
  const rateMutation = useRateManga(manga.slug);
  const { data: userRating } = useUserRating(manga.slug);

  // Reading progress from localStorage
  const readingProgress = useReadingProgressStore((s) =>
    s.getProgress(manga.slug)
  );

  // Find first chapter slug: prioritize manga.first_chapter, then find from chapters array
  const firstChapterSlug = useMemo(() => {
    // First priority: explicit first_chapter from API
    if (manga.first_chapter?.slug) return manga.first_chapter.slug;

    // Second priority: find chapter with lowest chapter_number from loaded chapters
    if (chapters.length > 0) {
      const sortedChapters = [...chapters].sort(
        (a, b) => a.chapter_number - b.chapter_number
      );
      return sortedChapters[0]?.slug;
    }

    // Last fallback: latest_chapter (better than nothing)
    return manga.latest_chapter?.slug;
  }, [manga.first_chapter, manga.latest_chapter, chapters]);

  const filteredChapters = useMemo(() => {
    // If no search term, return all chapters (already sorted by server)
    if (!searchTerm) return chapters;

    // Apply client-side search filter only
    const lower = searchTerm.toLowerCase();
    return chapters.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.chapter_number.toString().includes(lower)
    );
  }, [chapters, searchTerm]);

  // Handler for sort change
  const handleSortChange = useCallback(() => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  }, [sortOrder, setSortOrder]);

  // Comments hooks - fetch all comments (manga + chapter) for manga detail page
  const { data: commentsData, isLoading: isCommentsLoading, isFetching: isCommentsFetching } = useMangaComments(
    manga.slug,
    {
      page: commentPage,
      per_page: 10,
      sort: commentSort,
      type: "all",
    }
  );

  const addCommentMutation = useAddMangaComment(manga.slug);

  // Comment handlers
  const handleAddComment = useCallback(
    async (content: string, parentId?: string | null, captcha?: { token: string; answer: string }) => {
      try {
        await addCommentMutation.mutateAsync({
          content,
          parent_id: parentId ?? null,
          ...(captcha ? { captcha_token: captcha.token, captcha_answer: captcha.answer } : {}),
        });
        toast.success(tComment("addSuccess"));
      } catch (error) {
        // Don't show toast for captcha errors - form handles it inline
        if (error instanceof CaptchaRequiredError) {
          throw error;
        }
        toast.error(tComment("addError"));
        throw error;
      }
    },
    [addCommentMutation, tComment]
  );

  // Rating handler (IP-based, no auth required)
  const handleRate = useCallback(
    async (rating: number) => {
      try {
        await rateMutation.mutateAsync(rating);
        toast.success(tRating("success"));
      } catch (error) {
        toast.error(tRating("error"));
      }
    },
    [rateMutation, tRating]
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* --- HEADER: SIDE-BY-SIDE LAYOUT (Mobile & Desktop) --- */}
          <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 items-start">
            {/* Left: Cover Image (Fixed widths) */}
            <div className="shrink-0 w-[110px] sm:w-[150px] md:w-[220px]">
              <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-md bg-muted">
                <img
                  src={manga.cover_full_url}
                  alt={manga.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                />
                {manga.is_hot && (
                  <Badge
                    variant="destructive"
                    className="absolute top-1 left-1 px-1.5 py-0 text-[10px] uppercase"
                  >
                    Hot
                  </Badge>
                )}
              </div>
            </div>

            {/* Right: Info Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
              {/* Title & Status */}
              <div>
                <h1
                  className="text-lg sm:text-2xl md:text-4xl font-bold capitalize leading-tight text-foreground line-clamp-2 md:line-clamp-3"
                  title={manga.name}
                >
                  {manga.name}
                </h1>
                {manga.name_alt && (
                  <p className="hidden sm:block text-sm text-muted-foreground mt-1 truncate">
                    {manga.name_alt}
                  </p>
                )}
              </div>

              {/* Stats Grid (Simplified for Mobile) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "relative flex h-2 w-2",
                      manga.status === 2 ? "text-blue-500" : "text-green-500"
                    )}
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                  </span>
                  <span className="font-medium text-foreground">
                    {manga.status === 2
                      ? t("status.completed")
                      : t("status.ongoing")}
                  </span>
                </div>

                {/* Rating */}
                <RatingDisplay
                  averageRating={manga.average_rating}
                  totalRatings={manga.total_ratings}
                  userVote={rateMutation.data?.rating.rating ?? userRating}
                  onRate={handleRate}
                  isLoading={rateMutation.isPending}
                />

                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{formatNumber(manga.views)}</span>
                </div>
              </div>

              {/* Author / Artist / Updated */}
              <div className="flex flex-col gap-1 mt-1">
                {manga.author && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Author: </span>
                    <Link
                      prefetch={false}
                      href={`/browse?author=${encodeURIComponent(manga.author.name)}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {manga.author.name}
                    </Link>
                  </div>
                )}
                {manga.artist && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Paintbrush className="h-3.5 w-3.5" />
                    <span>Artist: </span>
                    <Link
                      prefetch={false}
                      href={`/browse?author=${encodeURIComponent(manga.artist.name)}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {manga.artist.name}
                    </Link>
                  </div>
                )}
                <MetaItem
                  icon={CalendarDays}
                  text={`${t("detail.updatedAt")}: ${new Date(manga.updated_at).toLocaleString("vi-VN")}`}
                />
              </div>

              {/* Tags (Desktop) */}
              {manga.genres && manga.genres.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-2 mt-2">
                  {manga.genres.map((g) => (
                    <Link prefetch={false} key={g.id} href={`/browse?genre=${g.slug}`}>
                      <Badge
                        variant="secondary"
                        className="text-xs px-2.5 py-1 h-auto font-normal hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                      >
                        {g.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Description Section (Desktop) */}
              {manga.pilot && (
                <div className="hidden sm:block mt-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
                    {t("detail.introduction")}
                  </h3>
                  <ExpandableDescription content={manga.pilot} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-auto pt-2">
                {/* Continue Reading - only if progress exists */}
                {readingProgress && (
                  <Button
                    asChild
                    size="sm"
                    className="min-w-0 flex-1 sm:flex-none sm:w-32 md:w-40 h-9 font-semibold rounded-full shadow-sm"
                  >
                    <Link
                      prefetch={false}
                      href={`/manga/${manga.slug}/${readingProgress.chapterSlug}`}
                    >
                      <BookOpen className="mr-1.5 h-4 w-4 shrink-0" />
                      <span className="text-xs sm:text-sm truncate">
                        {t("detail.continueReading")}
                      </span>
                    </Link>
                  </Button>
                )}

                {/* Read Now Button */}
                {firstChapterSlug ? (
                  <Button
                    asChild
                    size="sm"
                    variant={readingProgress ? "outline" : "default"}
                    className={cn(
                      "min-w-0 flex-1 sm:flex-none h-9 font-semibold rounded-full",
                      readingProgress
                        ? "sm:w-auto"
                        : "sm:w-32 md:w-40 shadow-sm"
                    )}
                  >
                    <Link prefetch={false} href={`/manga/${manga.slug}/${firstChapterSlug}`}>
                      <PawPrint className="mr-1.5 h-4 w-4 shrink-0" />
                      <span className="text-xs sm:text-sm truncate">
                        {tCommon("readNow")}
                      </span>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled
                    className="min-w-0 flex-1 sm:flex-none h-9 rounded-full"
                  >
                    {tCommon("readNow")}
                  </Button>
                )}

                {/* Bookmark Button */}
                <BookmarkButton
                  manga={{ id: manga.id, name: manga.name }}
                  size="sm"
                  showText={false}
                  variant="outline"
                  className="h-9 w-9 shrink-0 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Genres Section - Mobile Only */}
          {manga.genres && manga.genres.length > 0 && (
            <div className="mt-4 sm:hidden">
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map((g) => (
                  <Link prefetch={false} key={g.id} href={`/browse?genre=${g.slug}`}>
                    <Badge
                      variant="secondary"
                      className="text-[11px] px-2 py-0.5 h-auto font-normal hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                    >
                      {g.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Description Section (Full Width below header) - Mobile Only */}
          {manga.pilot && (
            <div className="mt-6 sm:hidden">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
                {t("detail.introduction")}
              </h3>
              <ExpandableDescription content={manga.pilot} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 sm:px-6">
          {/* --- CHAPTER LIST --- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/chibi.svg"
                  alt="Reading"
                  width={30}
                  height={30}
                  className="inline-block"
                />
                {tChapter("chapterList")}
                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {chapters.length}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative w-32 sm:w-48 transition-all focus-within:w-40 sm:focus-within:w-60">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={t("detail.searchChapterPlaceholder")}
                    className="pl-8 h-8 text-xs rounded-full bg-secondary/30 border-transparent focus:bg-background focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSortChange}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Chapter Grid with Scrollable Container */}
            <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {isChaptersLoading ? (
                // Skeleton loading state
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2.5 border-b border-border/40"
                    >
                      <div className="min-w-0 pr-2 flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-3 w-12 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : filteredChapters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 transition-opacity duration-200">
                  {filteredChapters.map((chapter) => (
                    <Link
                      prefetch={false}
                      key={chapter.id}
                      href={`/manga/${manga.slug}/${chapter.slug}`}
                      className="flex justify-between py-2.5 border-b border-border/40 hover:bg-secondary/20 hover:pl-2 transition-all duration-200 rounded-sm"
                    >
                      <div className="min-w-0 pr-2 flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-foreground/90 group-hover:text-primary truncate">
                            {tChapter("chapter")} {chapter.chapter_number}
                          </div>
                          {chapter.name &&
                            chapter.name !==
                              `Chapter ${chapter.chapter_number}` && (
                              <div className="text-[11px] text-muted-foreground truncate">
                                {chapter.name}
                              </div>
                            )}
                        </div>
                        {/* Reading badge */}
                        {readingProgress?.chapterSlug === chapter.slug && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 h-4 bg-primary/10 text-primary flex-shrink-0"
                          >
                            {t("detail.reading")}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0 flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          {formatNumber(chapter.views)}
                        </span>
                        <span className="font-mono">
                          {new Date(chapter.created_at).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                  {t("detail.noChapters")}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <LazyCommentWrapper>
        <CommentSection
          comments={commentsData?.items || []}
          totalCount={commentsData?.pagination.total || 0}
          isLoading={isCommentsLoading}
          isFetching={isCommentsFetching}
          sort={commentSort}
          onSortChange={(s) => { setCommentSort(s); setCommentPage(1); }}
          onAddComment={handleAddComment}
          currentPage={commentPage}
          totalPages={commentsData?.pagination.last_page || 1}
          onPageChange={setCommentPage}
        />
      </LazyCommentWrapper>
    </div>
  );
}

// --- Container wrapper with pagination state ---
interface MangaDetailContentProps {
  slug: string;
}

const CHAPTERS_PER_PAGE = 999; // Fetch all chapters at once

export function MangaDetailContent({ slug }: MangaDetailContentProps) {
  const { isAuthenticated } = useAuthStore();
  const tErrors = useTranslations("errors");

  // Chapter sort order state
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const {
    data: manga,
    isLoading: isMangaLoading,
    error: mangaError,
  } = useQuery({
    queryKey: ["manga", slug],
    queryFn: () => mangaApi.getDetail(slug),
  });

  // Chapters query - fetch all chapters at once
  const { data: chaptersResponse, isLoading: isChaptersLoading } = useQuery({
    queryKey: ["manga", slug, "chapters", sortOrder],
    queryFn: () =>
      mangaApi.getChapters(slug, {
        per_page: CHAPTERS_PER_PAGE,
        sort: sortOrder === "newest" ? "desc" : "asc",
      }),
    enabled: !!manga,
    staleTime: STALE_TIMES.LONG,
  });

  // Extract typed data
  const chapters = chaptersResponse?.data || [];

  // Handler to update sort order - passed to MangaDetail
  const handleSortOrderChange = useCallback((order: "newest" | "oldest") => {
    setSortOrder(order);
  }, []);

  if (isMangaLoading) {
    return <MangaDetailSkeleton />;
  }

  if (mangaError || !manga) {
    return <div className="py-20 text-center">{tErrors("notFound")}</div>;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <Breadcrumb name={manga.name} />
      <MangaDetail
        manga={manga}
        chapters={chapters}
        isChaptersLoading={isChaptersLoading}
        sortOrder={sortOrder}
        setSortOrder={handleSortOrderChange}
      />
    </div>
  );
}
