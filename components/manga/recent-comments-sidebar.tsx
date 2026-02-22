"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations, useFormatter } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { commentApi } from "@/lib/api/endpoints/comment";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeText } from "@/lib/utils/sanitize";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";

export function RecentCommentsSidebar() {
  const t = useTranslations("homepage.sections");

  const { data, isLoading } = useQuery({
    queryKey: ["comments", "recent"],
    queryFn: () => commentApi.getRecent({ per_page: 5 }),
  });

  if (isLoading) {
    return <RecentCommentsSkeleton />;
  }

  if (!data?.data || data.data.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💬</span>
        <h2 className="text-xl font-bold">{t("recentComments")}</h2>
      </div>

      {/* Scrollable container with max height and fade effect */}
      <div className="relative">
        <div className="max-h-[600px] overflow-y-auto space-y-4 scrollbar-hide pr-1">
          {data.data.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
        {/* Fade effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const format = useFormatter();
  const date = new Date(comment.created_at);
  const now = new Date(); // Current time for relative comparison

  const sanitizedContent = sanitizeText(comment.content);

  // Determine context link and text
  const context = comment.context;
  let contextLink = "/";
  let contextText = "";

  if (context) {
    if (
      context.type === "chapter" &&
      context.chapter_slug &&
      context.manga_slug
    ) {
      // Assuming route is /manga/[slug]/[chapter_slug]
      // Need to verify route structure. Usually /manga/slug/chapter-slug or /chapter/slug
      // Based on manga-reader-sd structure, I'll check generic routes but
      // typically it's /manga/[slug]/[chapter] if it's (manga)/manga/[slug]
      // Let's assume /manga/[manga_slug]/[chapter_slug] for now based on standard specificied.
      // Actually user request showed `sitemap-chapters.xml` which implies structure.
      // Let's safe bet /manga/[manga_slug]/[chapter_slug] for chapter.
      contextLink = `/manga/${context.manga_slug}/${context.chapter_slug}`;
      contextText = context.text;
    } else if (context.type === "manga" && context.manga_slug) {
      contextLink = `/manga/${context.manga_slug}`;
      contextText = context.text;
    }
  }

  return (
    <div className="group relative bg-card/50 hover:bg-card border border-border/50 hover:border-primary/20 rounded-xl p-3 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8 border border-border">
          <AvatarImage
            src={comment.user.avatar_full_url}
            alt={comment.user.name}
          />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-sm truncate text-foreground/90 group-hover:text-primary transition-colors">
              {comment.user.name}
            </span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {format.relativeTime(date, now)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {sanitizedContent || (
              <span className="italic opacity-50">Content hidden</span>
            )}
          </p>

          {context && (
            <Link
              href={contextLink}
              className="flex items-center gap-1.5 text-[10px] font-medium text-primary/80 hover:text-primary transition-colors bg-primary/5 hover:bg-primary/10 w-fit px-2 py-1 rounded-full max-w-full"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{contextText}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentCommentsSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-3 border border-border/50 rounded-xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-5 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
