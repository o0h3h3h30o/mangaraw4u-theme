"use client";

/**
 * Comments Hooks
 * Custom React Query hooks for comments data
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { chapterApi } from "@/lib/api/endpoints/chapter";
import type { PaginatedResponse } from "@/types/api";
import type {
  Comment,
  CommentListParams,
  CreateCommentRequest,
  MangaCommentParams,
  CommentableType,
} from "@/types/comment";
import { useRefreshUser } from "@/lib/hooks/use-refresh-user";
import { useAuthStore } from "@/lib/store/authStore";
import { STALE_TIMES } from "@/lib/constants";

// === Helper Functions ===
/**
 * Recursively insert reply into parent comment's replies array with depth protection
 */
function insertReplyIntoComments(
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
        replies: insertReplyIntoComments(
          comment.replies,
          parentId,
          reply,
          depth + 1
        ),
      };
    }
    return comment;
  });
}

/**
 * Generate unique temporary ID for optimistic comments
 */
function generateTempId(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

// === Query Keys ===
/**
 * Comments Query Keys
 * Hierarchical pattern for cache management
 */
export const commentKeys = {
  all: ["comments"] as const,
  manga: (slug: string, params?: MangaCommentParams) =>
    params
      ? ([...commentKeys.all, "manga", slug, params] as const)
      : ([...commentKeys.all, "manga", slug] as const),
  chapter: (
    mangaSlug: string,
    chapterSlug: string,
    params?: CommentListParams
  ) =>
    params
      ? ([...commentKeys.all, "chapter", mangaSlug, chapterSlug, params] as const)
      : ([...commentKeys.all, "chapter", mangaSlug, chapterSlug] as const),
};

// === Type Definitions ===
interface UseCommentsParams {
  page?: number;
  per_page?: number;
  sort?: "asc" | "desc";
  enabled?: boolean;
}

interface UseMangaCommentsParams extends UseCommentsParams {
  type?: "all" | "manga" | "chapter";
}

interface CommentsData {
  items: Comment[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// === Query Hooks ===

/**
 * Hook for fetching manga comments
 */
export function useMangaComments(
  slug: string,
  {
    page = 1,
    per_page = 20,
    sort = "desc",
    type = "manga",
    enabled = true,
  }: UseMangaCommentsParams = {}
) {
  return useQuery({
    queryKey: commentKeys.manga(slug, { page, per_page, sort, type }),
    queryFn: () => mangaApi.getComments(slug, { page, per_page, sort, type }),
    staleTime: STALE_TIMES.LONG,
    enabled: enabled && !!slug,
    placeholderData: keepPreviousData,
    select: (data: PaginatedResponse<Comment>): CommentsData => ({
      items: data.data,
      pagination: data.meta.pagination,
    }),
  });
}

/**
 * Hook for fetching chapter comments
 */
export function useChapterComments(
  mangaSlug: string,
  chapterSlug: string,
  {
    page = 1,
    per_page = 20,
    sort = "desc",
    enabled = true,
  }: UseCommentsParams = {}
) {
  return useQuery({
    queryKey: commentKeys.chapter(mangaSlug, chapterSlug, {
      page,
      per_page,
      sort,
    }),
    queryFn: () =>
      chapterApi.getComments(mangaSlug, chapterSlug, { page, per_page, sort }),
    staleTime: STALE_TIMES.LONG,
    enabled: enabled && !!mangaSlug && !!chapterSlug,
    select: (data: PaginatedResponse<Comment>): CommentsData => ({
      items: data.data,
      pagination: data.meta.pagination,
    }),
  });
}

// === Mutation Hooks ===

/**
 * Factory: creates an optimistic add-comment mutation for any commentable type.
 * Eliminates duplication between manga and chapter comment hooks.
 */
function useAddCommentMutation(config: {
  mutationFn: (data: CreateCommentRequest) => Promise<Comment>;
  queryKey: readonly unknown[];
  commentableType: CommentableType;
}) {
  const queryClient = useQueryClient();
  const { refreshUserPartial } = useRefreshUser();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: config.mutationFn,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: config.queryKey as string[],
        exact: false,
      });

      const previousQueries = queryClient.getQueriesData<
        PaginatedResponse<Comment>
      >({ queryKey: config.queryKey as string[], exact: false });

      const tempId = generateTempId();
      const optimisticComment: Comment = {
        id: tempId,
        uuid: `temp-${tempId}`,
        content: newComment.content,
        commentable_type: config.commentableType,
        commentable_id: "0",
        parent_id: newComment.parent_id?.toString() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: user?.id || 0,
          uuid: user?.uuid || "",
          name: user?.name || "You",
          avatar_full_url: user?.avatar_full_url || "",
        },
        replies: [],
        replies_count: 0,
        can_edit: false,
        can_delete: false,
      };

      queryClient.setQueriesData<PaginatedResponse<Comment>>(
        { queryKey: config.queryKey as string[], exact: false },
        (old) => {
          if (!old)
            return {
              data: [optimisticComment],
              success: true,
              message: "",
              meta: {
                pagination: {
                  total: 1,
                  current_page: 1,
                  last_page: 1,
                  per_page: 20,
                  from: 1,
                  to: 1,
                },
              },
            };

          if (newComment.parent_id) {
            return {
              ...old,
              data: insertReplyIntoComments(
                old.data,
                newComment.parent_id.toString(),
                optimisticComment
              ),
            };
          }

          return { ...old, data: [optimisticComment, ...old.data] };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _newComment, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: config.queryKey as string[],
        exact: false,
      });

      try {
        await refreshUserPartial();
      } catch (error) {
        console.error("Failed to refresh user points after comment:", error);
      }
    },
  });
}

/**
 * Hook for adding manga comment
 */
export function useAddMangaComment(slug: string) {
  return useAddCommentMutation({
    mutationFn: (data) => mangaApi.addComment(slug, data),
    queryKey: ["comments", "manga", slug],
    commentableType: "manga" as CommentableType,
  });
}

/**
 * Hook for adding chapter comment
 */
export function useAddChapterComment(mangaSlug: string, chapterSlug: string) {
  return useAddCommentMutation({
    mutationFn: (data) => chapterApi.addComment(mangaSlug, chapterSlug, data),
    queryKey: ["comments", "chapter", mangaSlug, chapterSlug],
    commentableType: "chapter" as CommentableType,
  });
}

/**
 * Hook for prefetching comments
 */
export function useCommentsPrefetch() {
  const queryClient = useQueryClient();

  return {
    prefetchMangaComments: (slug: string, params?: MangaCommentParams) =>
      queryClient.prefetchQuery({
        queryKey: commentKeys.manga(slug, params),
        queryFn: () => mangaApi.getComments(slug, params),
        staleTime: STALE_TIMES.LONG,
      }),

    prefetchChapterComments: (
      mangaSlug: string,
      chapterSlug: string,
      params?: CommentListParams
    ) =>
      queryClient.prefetchQuery({
        queryKey: commentKeys.chapter(mangaSlug, chapterSlug, params),
        queryFn: () => chapterApi.getComments(mangaSlug, chapterSlug, params),
        staleTime: STALE_TIMES.LONG,
      }),
  };
}
