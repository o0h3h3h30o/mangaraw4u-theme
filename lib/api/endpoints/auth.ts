/**
 * Authentication API Endpoints
 * Calls the Node.js Express backend
 */

import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  GoogleAuthData,
  UpdateProfileData,
} from "@/types/user";

const NODE_API_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";

/**
 * Helper to make auth API requests.
 * Throws an Error with the server's error message on failure.
 */
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${NODE_API_URL}/api/auth${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

/**
 * Get the stored auth token from localStorage (via Zustand's persisted state).
 */
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

/**
 * Authentication API
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return authFetch<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    return authFetch<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  googleAuth: async (_data: GoogleAuthData): Promise<AuthResponse> => {
    throw new Error("Google authentication is not yet available");
  },

  getProfile: async (): Promise<User> => {
    const token = getStoredToken();
    return authFetch<User>("/profile", {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },

  updateProfile: async (_data: UpdateProfileData): Promise<User> => {
    throw new Error("Profile update is not yet available");
  },

  logout: async (): Promise<null> => {
    const token = getStoredToken();
    try {
      await authFetch("/logout", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Even if server logout fails, client-side logout proceeds
    }
    return null;
  },
};
