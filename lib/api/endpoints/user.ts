/**
 * User API Endpoints
 * All endpoints call real backend API - no mock fallbacks
 */

import type { PaginatedResponse } from "@/types/api";
import type { UserAchievements, UserPets } from "@/types/user";
import type {
  FavoriteManga,
  AddFavoriteRequest,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  CheckFavoriteStatusResponse,
} from "@/types/manga";
import type { ReadingHistoryItem } from "@/types/chapter";

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * User Favorites API
 */
export const userFavoritesApi = {
  getList: async (params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<FavoriteManga>> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 20;
    const res = await fetch(
      `${NODE_API_URL}/api/bookmarks?page=${page}&per_page=${perPage}`,
      { headers: authHeaders() }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch bookmarks: HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json as PaginatedResponse<FavoriteManga>;
    }
    throw new Error("Invalid bookmarks response");
  },

  add: async (data: AddFavoriteRequest): Promise<AddFavoriteResponse> => {
    try {
      const res = await fetch(`${NODE_API_URL}/api/bookmarks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        return { manga: json.manga, favorited: json.favorited };
      }
      throw new Error(json.error || "Failed to add bookmark");
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to add bookmark");
    }
  },

  remove: async (mangaId: number): Promise<RemoveFavoriteResponse> => {
    try {
      const res = await fetch(`${NODE_API_URL}/api/bookmarks/${mangaId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        return { manga_id: json.manga_id, favorited: json.favorited };
      }
      throw new Error(json.error || "Failed to remove bookmark");
    } catch (e) {
      throw e instanceof Error ? e : new Error("Failed to remove bookmark");
    }
  },

  checkStatus: async (mangaId: number): Promise<CheckFavoriteStatusResponse> => {
    try {
      const res = await fetch(`${NODE_API_URL}/api/bookmarks/check/${mangaId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        return { manga_id: json.manga_id, is_favorited: json.is_favorited };
      }
      throw new Error("Invalid response");
    } catch {
      return { manga_id: mangaId, is_favorited: false };
    }
  },
};

/**
 * User Reading History API
 */
export const userHistoryApi = {
  getList: async (_params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<ReadingHistoryItem>> => {
    throw new Error("Reading history API not implemented yet");
  },

  remove: async (_mangaId: number): Promise<{ manga_id: number }> => {
    throw new Error("Reading history API not implemented yet");
  },
};

/**
 * User Achievements API
 */
export const userAchievementsApi = {
  get: async (): Promise<UserAchievements> => {
    throw new Error("Achievements API not implemented yet");
  },
};

/**
 * User Pets API
 */
export const userPetsApi = {
  get: async (): Promise<UserPets> => {
    throw new Error("Pets API not implemented yet");
  },
};
