"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Reply, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import { sanitizeText } from "@/lib/utils/sanitize";
import { useRelativeTime } from "@/hooks/use-relative-time";
import { CommentReplyForm } from "./comment-reply-form";
import type { Comment } from "@/types/comment";

const MAX_DEPTH = 1; // API only supports comment (depth 0) and reply (depth 1)

interface CommentItemProps {
  comment: Comment;
  depth: number;
  onReply: (content: string, parentId: string | null, captcha?: { token: string; answer: string }) => Promise<void>;
}

export function CommentItem({ comment, depth, onReply }: CommentItemProps) {
  const t = useTranslations("comment");
  const locale = useLocale();
  const { isAuthenticated } = useAuthStore();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2);

  // Runtime validation to prevent infinite recursion
  const hasReplies =
    Array.isArray(comment.replies) && comment.replies.length > 0;
  const canNest = depth < MAX_DEPTH && depth >= 0; // Ensure depth is non-negative

  const handleReply = async (content: string, captcha?: { token: string; answer: string }) => {
    // Always pass comment.id for replies, never null or undefined
    await onReply(content, comment.id, captcha);
    setIsReplying(false);
  };

  // Calculate relative time using custom hook (client-side only)
  const timeAgo =
    useRelativeTime(comment.created_at || new Date().toISOString(), {
      locale,
    }) || t("unknownTime");

  const chapterName = comment.chapter_info?.name;

  return (
    <li
      className={cn(
        "group",
        depth > 0 && "ml-6 sm:ml-10 border-l-2 border-border pl-4"
      )}
      aria-level={depth + 1}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={comment.user.avatar_full_url}
            alt={comment.user.name}
          />
          <AvatarFallback>
            {comment.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.user.name}</span>
            {chapterName && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {chapterName}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          <p className="text-sm mt-1 whitespace-pre-wrap break-words">
            {sanitizeText(comment.content)}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {isAuthenticated && canNest && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3 mr-1" />
                {t("reply")}
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3">
              <CommentReplyForm
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                replyingTo={comment.user.name}
              />
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && (
            <div className="mt-3">
              {comment.replies_count > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs mb-2"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      {t("hideReplies")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      {t("showReplies", { count: comment.replies_count })}
                    </>
                  )}
                </Button>
              )}

              {showReplies && (
                <ul className="space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      onReply={onReply}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
