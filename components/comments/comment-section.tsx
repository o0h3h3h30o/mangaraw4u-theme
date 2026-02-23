"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { useAuthStore } from "@/lib/store/authStore";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";
import { CommentSkeleton } from "./comment-skeleton";
import { CommentEmpty } from "./comment-empty";
import Link from "next/link";
import type { Comment } from "@/types/comment";

interface CommentSectionProps {
  comments: Comment[];
  totalCount: number;
  isLoading: boolean;
  isFetching?: boolean;
  sort: "asc" | "desc";
  onSortChange: (sort: "asc" | "desc") => void;
  onAddComment: (content: string, parentId?: string | null, captcha?: { token: string; answer: string }) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CommentSection({
  comments,
  totalCount,
  isLoading,
  isFetching = false,
  sort,
  onSortChange,
  onAddComment,
  currentPage,
  totalPages,
  onPageChange,
}: CommentSectionProps) {
  const t = useTranslations("comment");
  const tAuth = useTranslations("auth");
  const { isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <div className="transition-opacity duration-200">
        <CommentSkeleton count={3} />
      </div>
    );
  }

  return (
    <Card
      className="transition-opacity duration-200"
      data-testid="comment-section"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            {t("title")}
            <span className="text-sm font-normal text-muted-foreground">
              ({totalCount})
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSortChange(sort === "desc" ? "asc" : "desc")}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {sort === "desc" ? t("sortNewest") : t("sortOldest")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated ? (
          <CommentForm onSubmit={(content, captcha) => onAddComment(content, null, captcha)} />
        ) : (
          <div className="flex items-center justify-center py-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mr-2">
              {t("loginRequired")}
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link prefetch={false} href="/login">{tAuth("login")}</Link>
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <CommentEmpty />
        ) : (
          <div className={`transition-opacity ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
            <CommentList
              comments={comments}
              onReply={onAddComment}
            />
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="pt-2"
        />
      </CardContent>
    </Card>
  );
}
