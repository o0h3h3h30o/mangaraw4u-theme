/**
 * Rating API Endpoints
 */

import type { RateMangaRequest, RateMangaResponse } from "@/types/comment";

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";

export const ratingApi = {
  rateManga: async (slug: string, data: RateMangaRequest): Promise<RateMangaResponse> => {
    const res = await fetch(
      `${NODE_API_URL}/api/manga/${encodeURIComponent(slug)}/rate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to rate manga: HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as RateMangaResponse;
    }
    throw new Error("Invalid response");
  },

  getUserRating: async (slug: string): Promise<number | null> => {
    const res = await fetch(
      `${NODE_API_URL}/api/manga/${encodeURIComponent(slug)}/rating`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data.score : null;
  },
};
