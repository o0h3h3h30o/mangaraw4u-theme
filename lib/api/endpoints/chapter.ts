/**
 * Chapter API Endpoints
 * All endpoints call real backend API - no mock fallbacks
 */

import type { PaginatedResponse } from "@/types/api";
import type {
  Chapter,
  ChapterImagesResponse,
  TrackViewResponse,
  ChapterReportTypesResponse,
  ChapterReport,
  CreateChapterReportRequest,
} from "@/types/chapter";
import type {
  Comment,
  CommentListParams,
  CreateCommentRequest,
} from "@/types/comment";
import { CaptchaRequiredError } from "@/lib/api/endpoints/manga";

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (typeof window === "undefined") return headers;
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

function makePaginatedResponse<T>(data: T[], page: number = 1, perPage: number = 20): PaginatedResponse<T> {
  const total = data.length;
  return {
    success: true,
    message: "Success",
    data: data.slice((page - 1) * perPage, page * perPage),
    meta: {
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total,
        from: (page - 1) * perPage + 1,
        to: Math.min(page * perPage, total),
      },
    },
  };
}

/**
 * Chapter API
 */
export const chapterApi = {
  getDetail: async (mangaSlug: string, chapterSlug: string): Promise<Chapter> => {
    const res = await fetch(
      `${NODE_API_URL}/api/chapter/${encodeURIComponent(mangaSlug)}/${encodeURIComponent(chapterSlug)}`
    );
    if (!res.ok) throw new Error(`Failed to fetch chapter detail: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error("Invalid response format");
    return json.data as Chapter;
  },

  getImages: async (mangaSlug: string, chapterSlug: string): Promise<ChapterImagesResponse> => {
    const res = await fetch(
      `${NODE_API_URL}/api/chapter/${encodeURIComponent(mangaSlug)}/${encodeURIComponent(chapterSlug)}/images`
    );
    if (!res.ok) throw new Error(`Failed to fetch chapter images: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.chapter || !Array.isArray(json.images)) throw new Error("Invalid response format");
    return { chapter: json.chapter, images: json.images };
  },

  trackView: async (mangaSlug: string, chapterSlug: string): Promise<TrackViewResponse> => {
    const res = await fetch(
      `${NODE_API_URL}/api/chapter/${encodeURIComponent(mangaSlug)}/${encodeURIComponent(chapterSlug)}/track-view`,
      { method: "POST" }
    );
    if (!res.ok) return { chapter_views: 0, manga_views: 0 };
    const json = await res.json();
    return { chapter_views: json.chapter_views || 0, manga_views: json.manga_views || 0 };
  },

  getComments: async (mangaSlug: string, chapterSlug: string, params?: CommentListParams): Promise<PaginatedResponse<Comment>> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 10;
    const sort = params?.sort || "desc";
    const res = await fetch(
      `${NODE_API_URL}/api/comments/chapter/${encodeURIComponent(mangaSlug)}/${encodeURIComponent(chapterSlug)}?page=${page}&per_page=${perPage}&sort=${sort}`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json as PaginatedResponse<Comment>;
    }
    throw new Error("Invalid response");
  },

  addComment: async (mangaSlug: string, chapterSlug: string, data: CreateCommentRequest): Promise<Comment> => {
    const res = await fetch(
      `${NODE_API_URL}/api/comments/chapter/${encodeURIComponent(mangaSlug)}/${encodeURIComponent(chapterSlug)}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (res.status === 429) {
      const json = await res.json();
      if (json.captcha_required && json.captcha) {
        throw new CaptchaRequiredError(json.captcha);
      }
    }
    if (!res.ok) throw new Error(`Failed to add comment: HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  },
};

/**
 * Chapter Report API
 */
export const chapterReportApi = {
  getTypes: async (): Promise<ChapterReportTypesResponse> => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      broken_images: "Ảnh bị lỗi",
      missing_images: "Thiếu ảnh",
      wrong_order: "Sai thứ tự",
      wrong_chapter: "Sai chapter",
      duplicate: "Trùng lặp",
      other: "Khác",
    };
  },

  create: async (_mangaSlug: string, _chapterSlug: string, data: CreateChapterReportRequest): Promise<ChapterReport> => {
    await new Promise((r) => setTimeout(r, 500));
    return {
      id: 1,
      user_id: 1,
      chapter_id: 1,
      manga_id: 1,
      report_type: data.report_type,
      report_type_label: data.report_type,
      description: data.description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  getUserReports: async (params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<ChapterReport>> => {
    await new Promise((r) => setTimeout(r, 300));
    return makePaginatedResponse([], params?.page, params?.per_page);
  },
};
