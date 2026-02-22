"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CommentTabs } from "./comment-tabs";
import { CommentSection } from "./comment-section";
import { TabContent } from "./tab-content";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { chapterApi } from "@/lib/api/endpoints/chapter";
import { commentKeys, useMangaComments } from "@/lib/hooks/use-comments";

interface ChapterReaderCommentsProps {
  mangaSlug: string;
  chapterSlug: string;
  className?: string;
}

export function ChapterReaderComments({
  mangaSlug,
  chapterSlug,
  className,
}: ChapterReaderCommentsProps) {
  const tTabs = useTranslations("tabs");
  const queryClient = useQueryClient();

  // State for active tab (tracked for onTabChange callback but not used in logic)
  const [, setActiveTab] = useState("chapter");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [chapterCommentPage, setChapterCommentPage] = useState(1);
  const [allCommentPage, setAllCommentPage] = useState(1);

  // Fetch chapter comments (uses shared commentKeys for cache consistency)
  const { data: chapterCommentsData, isLoading: isLoadingChapterComments, isFetching: isFetchingChapterComments } =
    useQuery({
      queryKey: commentKeys.chapter(mangaSlug, chapterSlug, {
        page: chapterCommentPage,
        sort: sortOrder,
        per_page: 10,
      }),
      queryFn: async () => {
        const response = await chapterApi.getComments(mangaSlug, chapterSlug, {
          page: chapterCommentPage,
          sort: sortOrder,
          per_page: 10,
        });
        return {
          comments: response.data || [],
          totalCount: response.meta?.pagination?.total || 0,
          currentPage: response.meta?.pagination?.current_page || 1,
          totalPages: response.meta?.pagination?.last_page || 1,
        };
      },
    });

  // Fetch all comments for this manga (manga-level + all chapters) via type=all
  const { data: allCommentsData, isLoading: isLoadingAllComments, isFetching: isFetchingAllComments } =
    useMangaComments(mangaSlug, {
      type: "all",
      sort: sortOrder,
      per_page: 10,
      page: allCommentPage,
    });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({
      content,
      parentId,
      type,
      captcha,
    }: {
      content: string;
      parentId?: string | null;
      type: "chapter" | "manga";
      captcha?: { token: string; answer: string };
    }) => {
      const data = {
        content,
        parent_id: parentId,
        ...(captcha ? { captcha_token: captcha.token, captcha_answer: captcha.answer } : {}),
      };
      if (type === "chapter") {
        return chapterApi.addComment(mangaSlug, chapterSlug, data);
      } else {
        return mangaApi.addComment(mangaSlug, data);
      }
    },
    onSuccess: () => {
      // Invalidate both chapter and all-comments queries
      queryClient.invalidateQueries({
        queryKey: commentKeys.chapter(mangaSlug, chapterSlug),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.manga(mangaSlug),
        exact: false,
      });
    },
  });

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sort: "asc" | "desc") => {
    setSortOrder(sort);
    setChapterCommentPage(1);
    setAllCommentPage(1);
  }, []);

  // Handle adding comments
  // In "all" tab, new top-level comments default to chapter type
  // Replies inherit parent's type (handled by backend)
  const handleAddComment = useCallback(
    async (content: string, parentId?: string | null, captcha?: { token: string; answer: string }) => {
      await addCommentMutation.mutateAsync({
        content,
        parentId,
        type: "chapter",
        captcha,
      });
    },
    [addCommentMutation]
  );

  // Prepare tabs data - 2 tabs only: Chapter Comments and All Comments
  const tabs = [
    {
      id: "chapter",
      label: tTabs("chapterComments"),
      count: chapterCommentsData?.totalCount || 0,
      content: (
        <TabContent
          isLoading={isLoadingChapterComments}
          tabId="chapter-comments"
        >
          <CommentSection
            comments={chapterCommentsData?.comments || []}
            totalCount={chapterCommentsData?.totalCount || 0}
            isLoading={isLoadingChapterComments}
            isFetching={isFetchingChapterComments}
            sort={sortOrder}
            onSortChange={handleSortChange}
            onAddComment={handleAddComment}
            currentPage={chapterCommentsData?.currentPage || 1}
            totalPages={chapterCommentsData?.totalPages || 1}
            onPageChange={setChapterCommentPage}
          />
        </TabContent>
      ),
    },
    {
      id: "all",
      label: tTabs("allComments"),
      count: allCommentsData?.pagination.total || 0,
      content: (
        <TabContent
          isLoading={isLoadingAllComments}
          tabId="all-comments"
        >
          <CommentSection
            comments={allCommentsData?.items || []}
            totalCount={allCommentsData?.pagination.total || 0}
            isLoading={isLoadingAllComments}
            isFetching={isFetchingAllComments}
            sort={sortOrder}
            onSortChange={handleSortChange}
            onAddComment={handleAddComment}
            currentPage={allCommentsData?.pagination.current_page || 1}
            totalPages={allCommentsData?.pagination.last_page || 1}
            onPageChange={setAllCommentPage}
          />
        </TabContent>
      ),
    },
  ];

  return (
    <div className={className}>
      <CommentTabs
        tabs={tabs}
        defaultTab="chapter"
        onTabChange={handleTabChange}
        variant="segmented"
        className="w-full"
      />
    </div>
  );
}
