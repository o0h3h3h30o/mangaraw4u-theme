"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { ChapterNavigation } from "@/types/chapter";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const ReaderSettingsPanel = dynamic(
  () =>
    import("./reader-settings-panel").then((mod) => ({
      default: mod.ReaderSettingsPanel,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

interface ReaderControlsProps {
  mangaSlug: string;
  mangaName?: string;
  currentChapterSlug: string;
  chapterList?: { slug: string; name: string; chapter_number: number }[];
  navigation?: ChapterNavigation;

  zoom: number;
  onZoomChange: (zoom: number) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  imageSpacing: number;
  onImageSpacingChange: (spacing: number) => void;
  currentChapterNumber?: number;
  showControls: boolean;
  onNavigateChapter: (slug: string) => void;
}

export function ReaderControls({
  mangaSlug,
  mangaName,
  currentChapterSlug,
  chapterList,
  navigation,
  zoom,
  onZoomChange,
  backgroundColor,
  onBackgroundColorChange,
  imageSpacing,
  onImageSpacingChange,
  currentChapterNumber,
  showControls,
  onNavigateChapter,
}: ReaderControlsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <TooltipProvider>
      {/* Top Bar */}
      <div
        className={cn(
          "fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur transition-transform duration-300",
          showControls ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex items-center gap-4">
          <Link prefetch={false} href={`/manga/${mangaSlug}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium line-clamp-1">
              {currentChapterNumber
                ? `Chapter ${currentChapterNumber}`
                : "Chapter Reader"}
            </h1>
            <Link
              prefetch={false}
              href={`/manga/${mangaSlug}`}
              className="text-xs text-muted-foreground hover:underline"
            >
              {mangaName || "Back to Manga"}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-center border-t bg-background/95 px-4 backdrop-blur transition-transform duration-300",
          showControls ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={!navigation?.previous}
            onClick={() =>
              navigation?.previous &&
              onNavigateChapter(navigation.previous.slug)
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Chapter Selector - Centered */}
          <Select value={currentChapterSlug} onValueChange={onNavigateChapter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapterList?.map((chapter) => (
                <SelectItem key={chapter.slug} value={chapter.slug}>
                  Chapter {chapter.chapter_number}
                </SelectItem>
              ))}
              {/* Fallback for current chapter if not in list (e.g. due to pagination) */}
              {chapterList &&
                !chapterList.some((c) => c.slug === currentChapterSlug) && (
                  <SelectItem value={currentChapterSlug}>
                    Chapter {currentChapterNumber || "..."}
                  </SelectItem>
                )}
              {!chapterList && (
                <SelectItem value={currentChapterSlug}>
                  Chapter {currentChapterNumber || "..."}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            disabled={!navigation?.next}
            onClick={() =>
              navigation?.next && onNavigateChapter(navigation.next.slug)
            }
          >
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to Top</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Settings Panel */}
      <ReaderSettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        zoom={zoom}
        onZoomChange={onZoomChange}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={onBackgroundColorChange}
        imageSpacing={imageSpacing}
        onImageSpacingChange={onImageSpacingChange}
      />
    </TooltipProvider>
  );
}
