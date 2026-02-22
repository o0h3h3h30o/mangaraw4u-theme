"use client";

import { useTranslations } from "next-intl";
import { CommentItem } from "./comment-item";
import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
  onReply: (content: string, parentId: string | null, captcha?: { token: string; answer: string }) => Promise<void>;
}

export function CommentList({ comments, onReply }: CommentListProps) {
  const t = useTranslations("comment");

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-4" role="list" aria-label={t("listLabel")}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          depth={0}
          onReply={onReply}
        />
      ))}
    </ul>
  );
}
