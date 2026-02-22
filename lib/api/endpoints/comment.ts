/**
 * Comment API Endpoints
 */

import type { PaginatedResponse } from "@/types/api";
import type {
  Comment,
  UpdateCommentRequest,
  CommentListParams,
} from "@/types/comment";

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

/**
 * Comment API
 */
export const commentApi = {
  update: async (id: string, data: UpdateCommentRequest): Promise<Comment> => {
    const res = await fetch(`${NODE_API_URL}/api/comments/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to update comment: HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as Comment;
    }
    throw new Error("Invalid response");
  },

  delete: async (id: string): Promise<null> => {
    const res = await fetch(`${NODE_API_URL}/api/comments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to delete comment: HTTP ${res.status}`);
    }
    return null;
  },

  getRecent: async (params?: CommentListParams): Promise<PaginatedResponse<Comment>> => {
    const perPage = params?.per_page || 5;
    const res = await fetch(
      `${NODE_API_URL}/api/comments/recent?per_page=${perPage}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch recent comments: HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.success) {
      return {
        success: true,
        message: json.message || "Success",
        data: json.data || [],
        meta: json.meta || {
          pagination: { current_page: 1, last_page: 1, per_page: perPage, total: (json.data || []).length, from: 1, to: (json.data || []).length },
        },
      };
    }
    throw new Error("Invalid response");
  },
};
