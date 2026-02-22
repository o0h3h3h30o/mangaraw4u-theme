"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { chapterApi } from "@/lib/api/endpoints/chapter";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { ReaderControls } from "./reader-controls";
import { ReaderImage } from "./reader-image";
import { ChapterWithNavigation } from "@/types/chapter";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { CommentsSkeleton } from "@/components/comments/comments-skeleton";
import { LazyCommentWrapper } from "@/components/comments/lazy-comment-wrapper";
import { useReaderStore } from "@/lib/store/readerStore";
import { useReadingProgressStore } from "@/lib/store/readingProgressStore";

const ChapterReaderComments = dynamic(
  () =>
    import("@/components/comments/chapter-reader-comments").then((mod) => ({
      default: mod.ChapterReaderComments,
    })),
  {
    loading: () => <CommentsSkeleton />,
    ssr: false, // Comments don't need SSR
  }
);

import { cn } from "@/lib/utils";

interface ReaderViewProps {
  mangaSlug: string;
  chapterSlug: string;
}

export function ReaderView({ mangaSlug, chapterSlug }: ReaderViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  // State
  const readingMode = "long-strip";
  const [showControls, setShowControls] = useState(true);

  // Store for persistent settings
  const { preferences, updatePreference } = useReaderStore();
  const { zoom, backgroundColor, imageSpacing } = preferences;

  // Reading progress store
  const setReadingProgress = useReadingProgressStore((s) => s.setProgress);

  const setZoom = useCallback(
    (value: number) => {
      updatePreference("zoom", value);
    },
    [updatePreference]
  );

  const setBackgroundColor = useCallback(
    (value: string) => {
      updatePreference("backgroundColor", value);
    },
    [updatePreference]
  );

  const setImageSpacing = useCallback(
    (value: number) => {
      updatePreference("imageSpacing", value);
    },
    [updatePreference]
  );

  // Fetch Chapter Details
  const {
    data: chapter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chapter", mangaSlug, chapterSlug],
    queryFn: async () => {
      const [chapterData, imagesData] = await Promise.all([
        chapterApi.getDetail(mangaSlug, chapterSlug),
        chapterApi.getImages(mangaSlug, chapterSlug),
      ]);

      return {
        ...chapterData,
        content: imagesData.images,
      } as ChapterWithNavigation;
    },
  });

  // Fetch Chapter List (for dropdown and navigation)
  const { data: chapterList } = useQuery({
    queryKey: ["manga-chapters", mangaSlug],

    queryFn: async () => {
      const perPage = 100; // Safe limit
      const initial = await mangaApi.getChapters(mangaSlug, {
        page: 1,
        per_page: perPage,
      });

      let allData = [...initial.data];
      const lastPage = initial.meta?.pagination?.last_page || 1;

      if (lastPage > 1) {
        const promises = [];
        for (let i = 2; i <= lastPage; i++) {
          promises.push(
            mangaApi.getChapters(mangaSlug, { page: i, per_page: perPage })
          );
        }

        const results = await Promise.all(promises);
        results.forEach((res) => {
          allData = [...allData, ...res.data];
        });
      }

      // Sort by chapter number (descending for list usually, but navigation uses ascending)
      // The navigation Memo sorts it ascending.
      // Let's just return the full data.
      return {
        ...initial,
        data: allData,
      };
    },
    enabled: !!mangaSlug,
  });

  // Calculate navigation from chapter list
  const navigation = useMemo(() => {
    if (!chapterList?.data || !chapter) return undefined;

    // Sort chapters by chapter_number ascending
    const sortedChapters = [...chapterList.data].sort(
      (a, b) => a.chapter_number - b.chapter_number
    );

    // Find current chapter index
    const currentIndex = sortedChapters.findIndex(
      (ch) => ch.slug === chapterSlug
    );

    if (currentIndex === -1) return undefined;

    const previousChapter =
      currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
    const nextChapter =
      currentIndex < sortedChapters.length - 1
        ? sortedChapters[currentIndex + 1]
        : null;

    return {
      previous: previousChapter
        ? {
            id: previousChapter.id,
            uuid: previousChapter.uuid,
            slug: previousChapter.slug,
            name: previousChapter.name,
            order: previousChapter.order,
          }
        : null,
      next: nextChapter
        ? {
            id: nextChapter.id,
            uuid: nextChapter.uuid,
            slug: nextChapter.slug,
            name: nextChapter.name,
            order: nextChapter.order,
          }
        : null,
    };
  }, [chapterList, chapter, chapterSlug]);

  // Track View
  useEffect(() => {
    if (chapterSlug && mangaSlug) {
      chapterApi.trackView(mangaSlug, chapterSlug).catch(console.error);
    }
  }, [mangaSlug, chapterSlug]);

  // Save reading progress when chapter loads
  useEffect(() => {
    if (chapter && mangaSlug) {
      setReadingProgress(mangaSlug, chapterSlug, chapter.chapter_number);
    }
  }, [chapter, mangaSlug, chapterSlug, setReadingProgress]);

  // Prefetch adjacent chapters when current chapter loads
  useEffect(() => {
    if (navigation?.next?.slug) {
      queryClient.prefetchQuery({
        queryKey: ["chapter", mangaSlug, navigation.next.slug],
        queryFn: async () => {
          const [chapterData, imagesData] = await Promise.all([
            chapterApi.getDetail(mangaSlug, navigation.next!.slug),
            chapterApi.getImages(mangaSlug, navigation.next!.slug),
          ]);
          return {
            ...chapterData,
            content: imagesData.images,
          } as ChapterWithNavigation;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes fresh
      });
    }
    if (navigation?.previous?.slug) {
      queryClient.prefetchQuery({
        queryKey: ["chapter", mangaSlug, navigation.previous.slug],
        queryFn: async () => {
          const [chapterData, imagesData] = await Promise.all([
            chapterApi.getDetail(mangaSlug, navigation.previous!.slug),
            chapterApi.getImages(mangaSlug, navigation.previous!.slug),
          ]);
          return {
            ...chapterData,
            content: imagesData.images,
          } as ChapterWithNavigation;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes fresh
      });
    }
  }, [mangaSlug, navigation, queryClient]);

  // Navigation Handler
  const handleNavigateChapter = useCallback(
    (slug: string) => {
      router.push(`/manga/${mangaSlug}/${slug}`);
    },
    [router, mangaSlug]
  );

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowControls((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        if (navigation?.previous?.slug) {
          handleNavigateChapter(navigation.previous.slug);
        }
      } else if (e.key === "ArrowRight") {
        if (navigation?.next?.slug) {
          handleNavigateChapter(navigation.next.slug);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigation, handleNavigateChapter]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load chapter</p>
        <button
          onClick={() => router.push(`/manga/${mangaSlug}`)}
          className="text-primary hover:underline"
        >
          Back to Manga
        </button>
      </div>
    );
  }

  const images = chapter.content || [];

  return (
    <div className="relative min-h-screen" style={{ backgroundColor }}>
      <ReaderControls
        mangaSlug={mangaSlug}
        mangaName={chapter.manga.name}
        currentChapterSlug={chapterSlug}
        currentChapterNumber={chapter.chapter_number}
        chapterList={chapterList?.data}
        navigation={navigation}
        zoom={zoom}
        onZoomChange={setZoom}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={setBackgroundColor}
        imageSpacing={imageSpacing}
        onImageSpacingChange={setImageSpacing}
        showControls={showControls}
        onNavigateChapter={handleNavigateChapter}
      />

      {/* Click zone to toggle controls */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowControls(!showControls);
          }
        }}
        style={{ pointerEvents: showControls ? "none" : "auto" }}
      />

      {/* Main Content */}
      <main
        className={cn(
          "relative z-0 mx-auto min-h-screen transition-all duration-300",
          showControls ? "pt-16 pb-16" : "py-0"
        )}
        onClick={() => setShowControls(!showControls)}
        style={{
          width: "100%",
          maxWidth: "100%",
          backgroundColor,
        }}
      >
        <div
          className="mx-auto flex flex-col items-center justify-center"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          {images.map((src, index) => (
            <ReaderImage
              key={index}
              src={src}
              alt={`Page ${index + 1}`}
              index={index}
              className="w-full max-w-4xl"
              style={{ marginBottom: `${imageSpacing}px` }}
            />
          ))}
        </div>
      </main>

      {/* Comments Section */}
      <div className="relative z-0 mx-auto w-full max-w-4xl bg-background px-4 py-8">
        <LazyCommentWrapper>
          <ChapterReaderComments
            mangaSlug={mangaSlug}
            chapterSlug={chapterSlug}
            className="w-full"
          />
        </LazyCommentWrapper>
      </div>
    </div>
  );
}
