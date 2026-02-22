/**
 * Manga API Endpoints
 * All endpoints call real backend API - no mock fallbacks
 */

import type { PaginatedResponse } from "@/types/api";
import type {
  Manga,
  MangaListItem,
  MangaListParams,
  MangaSearchParams,
  Genre,
  GenreMangasParams,
  Artist,
  Group,
  Doujinshi,
} from "@/types/manga";
import type { ChapterListItem, ChapterListParams } from "@/types/chapter";
import type {
  Comment,
  CreateCommentRequest,
  MangaCommentParams,
  CaptchaChallenge,
} from "@/types/comment";
import { toTitleCase } from "@/lib/utils";

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";
const COVER_CDN_URL = process.env.NEXT_PUBLIC_COVER_CDN_URL || "https://s2.manga18.club";

export class CaptchaRequiredError extends Error {
  captcha: CaptchaChallenge;
  constructor(captcha: CaptchaChallenge) {
    super("Captcha required");
    this.name = "CaptchaRequiredError";
    this.captcha = captcha;
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (typeof window === "undefined") return headers;
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const token = JSON.parse(stored)?.state?.token;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
  } catch { /* ignore */ }
  return headers;
}

function mapMangaListItem(item: {
  manga_id: number; manga_name: string; manga_slug: string; manga_cover?: string;
  hot?: number; is_new?: number; caution?: number; average_rating?: number;
  views?: number; view_day?: number; view_month?: number;
  chapter_1?: string; chap_1_slug?: string; time_chap_1?: string; update_at?: number;
}): MangaListItem {
  return {
    id: item.manga_id,
    uuid: String(item.manga_id),
    name: toTitleCase(item.manga_name),
    slug: item.manga_slug,
    cover_full_url: `${COVER_CDN_URL}/cover/${item.manga_slug}.jpg`,
    is_hot: item.hot === 1,
    caution: item.caution === 1,
    status: 1,
    views: item.views || 0,
    views_day: item.view_day || 0,
    average_rating: parseFloat(String(item.average_rating)) || 0,
    updated_at: item.update_at ? new Date(item.update_at * 1000).toISOString() : new Date().toISOString(),
    latest_chapter: item.chapter_1 ? {
      id: 0,
      uuid: item.chap_1_slug || "",
      name: item.chapter_1,
      slug: item.chap_1_slug || "",
      created_at: item.time_chap_1 || "",
    } : undefined,
  };
}

/**
 * Manga API
 */
export const mangaApi = {
  getList: async (params?: MangaListParams): Promise<PaginatedResponse<MangaListItem>> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 24;
    const urlParams = new URLSearchParams();
    urlParams.set("page", String(page));
    urlParams.set("per_page", String(perPage));
    if (params?.["filter[name]"]) urlParams.set("q", params["filter[name]"]);
    if (params?.["filter[status]"]) urlParams.set("status", String(params["filter[status]"]));
    if (params?.["filter[accept_genres]"]) urlParams.set("genre", String(params["filter[accept_genres]"]));
    if (params?.["filter[author]"]) urlParams.set("author", params["filter[author]"]);
    if (params?.sort) urlParams.set("sort", params.sort);

    const res = await fetch(`${NODE_API_URL}/api/manga/browse?${urlParams.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch manga list: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");

    return {
      success: true,
      message: "Success",
      data: json.data.map(mapMangaListItem),
      meta: json.meta,
    };
  },

  getRecent: async (params?: Partial<MangaListParams>): Promise<PaginatedResponse<MangaListItem>> => {
    return mangaApi.getList({ ...params, sort: "-updated_at" } as MangaListParams);
  },

  getTop: async (period: "day" | "month" | "all" = "day", limit = 10): Promise<MangaListItem[]> => {
    const res = await fetch(`${NODE_API_URL}/api/manga/top?period=${period}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch top manga: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    return json.data.map(mapMangaListItem);
  },

  getNewest: async (limit = 10): Promise<MangaListItem[]> => {
    const res = await fetch(`${NODE_API_URL}/api/manga/newest?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch newest manga: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    return json.data.map(mapMangaListItem);
  },

  getBySlugs: async (slugs: string[]): Promise<Record<string, { id: number; name: string; slug: string; cover_full_url: string; average_rating: number }>> => {
    if (slugs.length === 0) return {};
    const res = await fetch(`${NODE_API_URL}/api/manga/by-slugs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return {};
    const map: Record<string, { id: number; name: string; slug: string; cover_full_url: string; average_rating: number }> = {};
    for (const item of json.data) {
      map[item.manga_slug] = {
        id: item.manga_id,
        name: toTitleCase(item.manga_name),
        slug: item.manga_slug,
        cover_full_url: `${COVER_CDN_URL}/cover/${item.manga_slug}.jpg`,
        average_rating: parseFloat(String(item.average_rating)) || 0,
      };
    }
    return map;
  },

  search: async (params: MangaSearchParams): Promise<PaginatedResponse<MangaListItem>> => {
    const limit = params.per_page || 10;
    const res = await fetch(
      `${NODE_API_URL}/api/manga/search?q=${encodeURIComponent(params.q)}&limit=${limit}`
    );
    if (!res.ok) throw new Error(`Failed to search: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");

    const mangas = json.data.map(mapMangaListItem);
    const total = mangas.length;
    return {
      success: true,
      message: "Success",
      data: mangas,
      meta: {
        pagination: {
          current_page: params.page || 1,
          last_page: 1,
          per_page: params.per_page || total,
          total,
          from: 1,
          to: total,
        },
      },
    };
  },

  getDetail: async (slug: string): Promise<Manga> => {
    const res = await fetch(`${NODE_API_URL}/api/manga/detail/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error(`Failed to fetch manga detail: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error("Invalid response format");
    return json.data as Manga;
  },

  getChapters: async (slug: string, params?: ChapterListParams): Promise<PaginatedResponse<ChapterListItem>> => {
    const sort = params?.sort || "desc";
    const page = params?.page || 1;
    const perPage = params?.per_page || 999;
    const res = await fetch(
      `${NODE_API_URL}/api/manga/${encodeURIComponent(slug)}/chapters?sort=${sort}&page=${page}&per_page=${perPage}`
    );
    if (!res.ok) throw new Error(`Failed to fetch chapters: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    return {
      success: true,
      message: "Success",
      data: json.data as ChapterListItem[],
      meta: json.meta || {
        pagination: {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: json.data.length,
          from: 1,
          to: json.data.length,
        },
      },
    };
  },

  getComments: async (slug: string, params?: MangaCommentParams): Promise<PaginatedResponse<Comment>> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 10;
    const sort = params?.sort || "desc";
    const type = params?.type || "manga";
    const res = await fetch(
      `${NODE_API_URL}/api/comments/manga/${encodeURIComponent(slug)}?page=${page}&per_page=${perPage}&sort=${sort}&type=${type}`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error(`Failed to fetch comments: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    return json as PaginatedResponse<Comment>;
  },

  getHotNewReleases: async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<MangaListItem>> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 30;
    const res = await fetch(`${NODE_API_URL}/api/manga/hot-new-releases?page=${page}&per_page=${perPage}`);
    if (!res.ok) throw new Error(`Failed to fetch hot new releases: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    return {
      success: true,
      message: "Success",
      data: json.data.map(mapMangaListItem),
      meta: json.meta || {
        pagination: {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: json.data.length,
          from: 1,
          to: json.data.length,
        },
      },
    };
  },

  addComment: async (slug: string, data: CreateCommentRequest): Promise<Comment> => {
    const res = await fetch(
      `${NODE_API_URL}/api/comments/manga/${encodeURIComponent(slug)}`,
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
    if (!json.success || !json.data) throw new Error("Invalid response");
    return json.data as Comment;
  },
};

/**
 * Genre API
 */
export const genreApi = {
  getList: async (params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<Genre>> => {
    const res = await fetch(`${NODE_API_URL}/api/category`);
    if (!res.ok) throw new Error(`Failed to fetch genres: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    const genres: Genre[] = json.data.map((cat: { id: number; name: string; slug?: string; [key: string]: unknown }) => ({
      id: cat.id,
      uuid: String(cat.id),
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
    }));
    const page = params?.page || 1;
    const perPage = params?.per_page || genres.length;
    const from = (page - 1) * perPage;
    const sliced = genres.slice(from, from + perPage);
    return {
      success: true,
      message: "Success",
      data: sliced,
      meta: {
        pagination: {
          current_page: page,
          last_page: Math.ceil(genres.length / perPage),
          per_page: perPage,
          total: genres.length,
          from: from + 1,
          to: from + sliced.length,
        },
      },
    };
  },

  getDetail: async (slug: string): Promise<Genre> => {
    const res = await fetch(`${NODE_API_URL}/api/category`);
    if (!res.ok) throw new Error(`Failed to fetch genre detail: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    const genre = json.data.find((cat: { slug?: string; name: string }) =>
      (cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")) === slug
    );
    if (!genre) throw new Error(`Genre "${slug}" not found`);
    return { id: genre.id, uuid: String(genre.id), name: genre.name, slug: genre.slug || slug };
  },

  getMangas: async (slug: string, params?: GenreMangasParams): Promise<PaginatedResponse<MangaListItem>> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 30;
    const res = await fetch(`${NODE_API_URL}/api/manga/by-category/${encodeURIComponent(slug)}?page=${page}&per_page=${perPage}`);
    if (!res.ok) throw new Error(`Failed to fetch genre mangas: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    return {
      success: true,
      message: "Success",
      data: json.data.map(mapMangaListItem),
      meta: json.meta || {
        pagination: {
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: json.data.length,
          from: 1,
          to: json.data.length,
        },
      },
    };
  },

  getPopular: async (limit = 4): Promise<{ id: number; name: string; slug: string; manga_count: number }[]> => {
    const res = await fetch(`${NODE_API_URL}/api/category/popular?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch popular genres: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error("Invalid response format");
    return json.data;
  },
};

/**
 * Artist API
 */
export const artistApi = {
  getList: async (_params?: { search?: string; per_page?: number; page?: number }): Promise<PaginatedResponse<Artist>> => {
    throw new Error("Artist API not implemented yet");
  },

  getDetail: async (_slug: string): Promise<Artist> => {
    throw new Error("Artist API not implemented yet");
  },

  getMangas: async (_slug: string, _params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<MangaListItem>> => {
    throw new Error("Artist API not implemented yet");
  },
};

/**
 * Group API
 */
export const groupApi = {
  getList: async (_params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<Group>> => {
    throw new Error("Group API not implemented yet");
  },

  getDetail: async (_slug: string): Promise<Group> => {
    throw new Error("Group API not implemented yet");
  },
};

/**
 * Doujinshi API
 */
export const doujinshiApi = {
  getList: async (_params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<Doujinshi>> => {
    throw new Error("Doujinshi API not implemented yet");
  },

  getDetail: async (_slug: string): Promise<Doujinshi> => {
    throw new Error("Doujinshi API not implemented yet");
  },

  getMangas: async (_slug: string, _params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<MangaListItem>> => {
    throw new Error("Doujinshi API not implemented yet");
  },
};
