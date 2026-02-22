/**
 * Comment Cache Utilities
 * Helper functions for optimistic updates in comment cache
 */

import type { Comment } from "@/types/comment";

// === Optimistic Update Helpers ===

/**
 * Recursively insert reply into parent comment's replies array with depth protection
 */
export function insertReplyIntoComments(
  comments: Comment[],
  parentId: string,
  reply: Comment,
  depth = 0
): Comment[] {
  // Prevent infinite recursion with depth guard
  if (depth > 10) {
    console.warn("Maximum comment depth exceeded while inserting reply");
    return comments;
  }

  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [reply, ...(comment.replies || [])],
        replies_count: comment.replies_count + 1,
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: insertReplyIntoComments(comment.replies, parentId, reply, depth + 1),
      };
    }
    return comment;
  });
}

/**
 * Add comment optimistically to the beginning of the list
 */
export function addCommentOptimistically(
  oldData: Comment[] | undefined,
  newComment: Comment
): Comment[] {
  if (!oldData) return [newComment];
  return [newComment, ...oldData];
}

/**
 * Remove comment optimistically from cache
 */
export function removeCommentOptimistically(
  comments: Comment[],
  commentId: string
): Comment[] {
  // First try to remove from top level
  const filtered = comments.filter((c) => c.id !== commentId);

  // If count matches, comment was at top level
  if (filtered.length === comments.length - 1) {
    return filtered;
  }

  // Otherwise, search in replies
  return comments.map((comment) => {
    if (!comment.replies) return comment;

    const filteredReplies = comment.replies.filter((r) => r.id !== commentId);

    // Check if we found it in replies
    if (filteredReplies.length < comment.replies.length) {
      return {
        ...comment,
        replies: filteredReplies,
        replies_count: Math.max(0, comment.replies_count - 1),
      };
    }

    // Recursively check nested replies
    const updatedReplies = removeCommentOptimistically(comment.replies, commentId);
    if (updatedReplies !== comment.replies) {
      const removedCount = countComments(comment.replies) - countComments(updatedReplies);
      return {
        ...comment,
        replies: updatedReplies,
        replies_count: Math.max(0, comment.replies_count - removedCount),
      };
    }

    return comment;
  });
}

/**
 * Helper to count total comments including replies
 */
function countComments(comments: Comment[]): number {
  return comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? countComments(comment.replies) : 0);
  }, 0);
}

/**
 * Update comment optimistically in cache
 */
export function updateCommentOptimistically(
  comments: Comment[],
  commentId: string,
  updates: Partial<Comment>
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, ...updates };
    }
    if (comment.replies && comment.replies.length > 0) {
      const updatedReplies = updateCommentOptimistically(comment.replies, commentId, updates);
      if (updatedReplies !== comment.replies) {
        return { ...comment, replies: updatedReplies };
      }
    }
    return comment;
  });
}