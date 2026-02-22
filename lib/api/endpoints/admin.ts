/**
 * Admin API Endpoints
 */

import type { PaginatedResponse } from "@/types/api";

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";

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

async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = getAuthHeaders();
  const res = await fetch(`${NODE_API_URL}/api/admin${endpoint}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface AdminStats {
  total_manga: number;
  total_chapters: number;
  total_users: number;
  total_comments: number;
}

export interface AdminManga {
  id: number;
  name: string;
  slug: string;
  status: number;
  is_public: number;
  views: number;
  hot: number;
  created_at: string;
  update_at: number;
  chapter_count: number;
}

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  status: number;
  last_login: string | null;
  created_at: string;
}

export interface AdminComment {
  id: number;
  content: string;
  user_id: number;
  manga_id: number;
  created_at: string;
  user_name: string | null;
  manga_name: string | null;
}

export interface AdminChapter {
  id: number;
  name: string;
  slug: string;
  number: string;
  view: number;
  is_show: number;
  source_url: string;
  is_crawling: number;
  created_at: string;
}

export interface AdminMangaDetail {
  id: number;
  name: string;
  slug: string;
  new_slug: string;
  summary: string;
  status_id: number;
  is_public: number;
  hot: number;
  caution: number;
  views: number;
  rating: number;
  otherNames: string;
  from_manga18fx: string;
  categories: { id: number; name: string; slug: string }[];
  authors: { id: number; name: string; slug: string }[];
  artists: { id: number; name: string; slug: string }[];
}

export interface AdminTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  show_home: number;
  jp_name: string | null;
  created_at: string;
}

export interface AdminComicType {
  id: number;
  label: string;
  created_at: string;
}

export interface AdminAuthor {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface AdminPage {
  id: number;
  slug: string;
  image: string;
  external: number;
}

export interface AdminChapterPages {
  pages: AdminPage[];
  manga_slug: string;
  chapter_slug: string;
}

// Helper for FormData uploads (no Content-Type header)
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) return JSON.parse(stored)?.state?.token || null;
  } catch { /* ignore */ }
  return null;
}

async function adminUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${NODE_API_URL}/api/admin${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const json = await adminFetch<{ success: boolean; data: AdminStats }>("/stats");
    return json.data;
  },

  // Manga
  listMangas: async (params?: { page?: number; per_page?: number; q?: string }): Promise<PaginatedResponse<AdminManga>> => {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.set("page", String(params.page));
    if (params?.per_page) urlParams.set("per_page", String(params.per_page));
    if (params?.q) urlParams.set("q", params.q);
    return adminFetch(`/manga?${urlParams.toString()}`);
  },

  getManga: async (id: number): Promise<AdminMangaDetail> => {
    const json = await adminFetch<{ success: boolean; data: AdminMangaDetail }>(`/manga/${id}`);
    return json.data;
  },

  createManga: async (data: { name: string; slug: string; summary?: string; otherNames?: string; from_manga18fx?: string; status_id?: number; is_public?: number; hot?: number; caution?: number; category_ids?: number[]; author_ids?: number[]; artist_ids?: number[] }) => {
    return adminFetch<{ success: boolean; data: { id: number; name: string; slug: string } }>("/manga", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateManga: async (id: number, data: Partial<{ name: string; slug: string; summary: string; otherNames: string; from_manga18fx: string; status_id: number; is_public: number; hot: number; caution: number; category_ids: number[]; author_ids: number[]; artist_ids: number[] }>) => {
    return adminFetch<{ success: boolean; message: string }>(`/manga/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteManga: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/manga/${id}`, { method: "DELETE" });
  },

  uploadCover: async (mangaId: number, file: File): Promise<{ success: boolean; data: { url: string } }> => {
    const formData = new FormData();
    formData.append("cover", file);
    return adminUpload(`/manga/${mangaId}/cover`, formData);
  },

  // Authors
  listAuthors: async (q?: string): Promise<AdminAuthor[]> => {
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    const json = await adminFetch<{ success: boolean; data: AdminAuthor[] }>(`/authors${params}`);
    return json.data;
  },

  // Chapters
  listChapters: async (mangaId: number): Promise<{ success: boolean; data: AdminChapter[] }> => {
    return adminFetch(`/manga/${mangaId}/chapters`);
  },

  createChapter: async (mangaId: number, data: { name: string; slug: string; number?: string; is_show?: number; source_url?: string; is_crawling?: number }) => {
    return adminFetch<{ success: boolean; data: { id: number; name: string; slug: string } }>(`/manga/${mangaId}/chapters`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateChapter: async (id: number, data: Partial<{ name: string; slug: string; number: string; is_show: number; source_url: string; is_crawling: number }>) => {
    return adminFetch<{ success: boolean; message: string }>(`/chapters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteChapter: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/chapters/${id}`, { method: "DELETE" });
  },

  // Chapter pages
  getChapterPages: async (chapterId: number): Promise<AdminChapterPages> => {
    const json = await adminFetch<{ success: boolean; data: AdminChapterPages }>(`/chapters/${chapterId}/pages`);
    return json.data;
  },

  uploadChapterPages: async (chapterId: number, files: File[]): Promise<{ success: boolean; data: { uploaded: number; manga_slug: string; chapter_slug: string } }> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("pages", f));
    return adminUpload(`/chapters/${chapterId}/pages`, formData);
  },

  addChapterPageUrls: async (chapterId: number, urls: string[]): Promise<{ success: boolean; data: { added: number } }> => {
    return adminFetch(`/chapters/${chapterId}/pages/urls`, {
      method: "POST",
      body: JSON.stringify({ urls }),
    });
  },

  deleteChapterPage: async (pageId: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/pages/${pageId}`, { method: "DELETE" });
  },

  bulkDeletePages: async (ids: number[]) => {
    return adminFetch<{ success: boolean; message: string }>("/pages/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  bulkDeleteChapters: async (ids: number[]) => {
    return adminFetch<{ success: boolean; message: string }>("/chapters/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  // Users
  listUsers: async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<AdminUser>> => {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.set("page", String(params.page));
    if (params?.per_page) urlParams.set("per_page", String(params.per_page));
    return adminFetch(`/users?${urlParams.toString()}`);
  },

  updateUser: async (id: number, data: Partial<{ role: string; status: number; name: string; email: string; password: string }>) => {
    return adminFetch<{ success: boolean; message: string }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/users/${id}`, { method: "DELETE" });
  },

  // Comments
  listComments: async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<AdminComment>> => {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.set("page", String(params.page));
    if (params?.per_page) urlParams.set("per_page", String(params.per_page));
    return adminFetch(`/comments?${urlParams.toString()}`);
  },

  deleteComment: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/comments/${id}`, { method: "DELETE" });
  },

  // Tags
  listTags: async (q?: string): Promise<AdminTag[]> => {
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    const json = await adminFetch<{ success: boolean; data: AdminTag[] }>(`/tags${params}`);
    return json.data;
  },
  createTag: async (data: { name: string; slug: string }) => {
    return adminFetch<{ success: boolean; data: { id: number; name: string; slug: string } }>("/tags", { method: "POST", body: JSON.stringify(data) });
  },
  updateTag: async (id: number, data: Partial<{ name: string; slug: string }>) => {
    return adminFetch<{ success: boolean; message: string }>(`/tags/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteTag: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/tags/${id}`, { method: "DELETE" });
  },

  // Categories
  listCategories: async (q?: string): Promise<AdminCategory[]> => {
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    const json = await adminFetch<{ success: boolean; data: AdminCategory[] }>(`/categories${params}`);
    return json.data;
  },
  createCategory: async (data: { name: string; slug: string; show_home?: number; jp_name?: string }) => {
    return adminFetch<{ success: boolean; data: { id: number; name: string; slug: string } }>("/categories", { method: "POST", body: JSON.stringify(data) });
  },
  updateCategory: async (id: number, data: Partial<{ name: string; slug: string; show_home: number; jp_name: string }>) => {
    return adminFetch<{ success: boolean; message: string }>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteCategory: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/categories/${id}`, { method: "DELETE" });
  },

  // Comic Types
  listComicTypes: async (): Promise<AdminComicType[]> => {
    const json = await adminFetch<{ success: boolean; data: AdminComicType[] }>("/comictypes");
    return json.data;
  },
  createComicType: async (data: { label: string }) => {
    return adminFetch<{ success: boolean; data: { id: number; label: string } }>("/comictypes", { method: "POST", body: JSON.stringify(data) });
  },
  updateComicType: async (id: number, data: { label: string }) => {
    return adminFetch<{ success: boolean; message: string }>(`/comictypes/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteComicType: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/comictypes/${id}`, { method: "DELETE" });
  },

  // Authors (full CRUD)
  createAuthor: async (data: { name: string; slug: string }) => {
    return adminFetch<{ success: boolean; data: { id: number; name: string; slug: string } }>("/authors", { method: "POST", body: JSON.stringify(data) });
  },
  updateAuthor: async (id: number, data: Partial<{ name: string; slug: string }>) => {
    return adminFetch<{ success: boolean; message: string }>(`/authors/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteAuthor: async (id: number) => {
    return adminFetch<{ success: boolean; message: string }>(`/authors/${id}`, { method: "DELETE" });
  },
};
