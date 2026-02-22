"use client";

/**
 * Refresh User Hook
 * Hook to refresh user data from the API
 */

import { useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/endpoints/auth";

/**
 * Hook to refresh user data
 */
export function useRefreshUser() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const token = useAuthStore((state) => state.token);

  const refreshUser = useCallback(async () => {
    if (!token) return null;

    try {
      const user = await authApi.getProfile();
      // Update the entire user object in the store
      setAuth(user, token);
      return user;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return null;
    }
  }, [token, setAuth]);

  const refreshUserPartial = useCallback(async () => {
    if (!token) return null;

    try {
      const user = await authApi.getProfile();
      // Only update fields that might have changed
      updateUser({
        total_points: user.total_points ?? 0,
        used_points: user.used_points ?? 0,
        available_points: user.available_points ?? 0,
        achievements_points: user.achievements_points ?? 0,
      });
      return user;
    } catch (error) {
      console.error("Failed to refresh user data partially:", error);
      return null;
    }
  }, [token, updateUser]);

  return {
    refreshUser,
    refreshUserPartial,
  };
}
