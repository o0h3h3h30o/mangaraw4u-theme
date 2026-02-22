"use client";

/**
 * User Profile Hooks
 * Custom hooks for user profile operations with auth store sync
 */

import { useState, useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/endpoints/auth";
import {
  updateProfileSchema,
  avatarFileSchema,
  changePasswordSchema,
} from "@/lib/validators/user-schemas";
import type { ChangePasswordData } from "@/types/user";

/**
 * Hook to update user profile (name, email)
 * Syncs with auth store on success
 */
export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  const updateProfile = useCallback(
    async (data: { name?: string; email?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate input
        const validated = updateProfileSchema.parse(data);

        // Call API
        const updatedUser = await authApi.updateProfile(validated);

        // Sync auth store
        updateUser(updatedUser);

        return { success: true, data: updatedUser };
      } catch {
        // Sanitize error messages - don't expose raw API errors
        const errorMessage = "user.profile.updateFailed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser]
  );

  return {
    updateProfile,
    isLoading,
    error,
  };
}

/**
 * Hook to upload user avatar
 * Syncs with auth store on success
 */
export function useUploadAvatar() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  const uploadAvatar = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate file
        avatarFileSchema.parse(file);

        // Call API with avatar
        const updatedUser = await authApi.updateProfile({ avatar: file });

        // Sync auth store (new avatar_full_url)
        updateUser(updatedUser);

        return { success: true, data: updatedUser };
      } catch {
        // Sanitize error messages - don't expose raw API errors
        const errorMessage = "user.profile.avatarUploadFailed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser]
  );

  return {
    uploadAvatar,
    isLoading,
    error,
  };
}

/**
 * Hook to update user password
 * Note: Backend doesn't verify current_password, but we validate client-side
 * User object unchanged after password update (only password hash changes server-side)
 */
export function useUpdatePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePassword = useCallback(async (data: ChangePasswordData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate input (including current_password check client-side)
      const validated = changePasswordSchema.parse(data);

      // Call API (only send new password fields)
      // Backend doesn't use current_password, but we validated it for UX
      await authApi.updateProfile({
        password: validated.password,
        password_confirmation: validated.password_confirmation,
      });

      // No user data changes (only password hash on backend)
      return { success: true };
    } catch {
      // Sanitize error messages - don't expose raw API errors
      const errorMessage = "user.profile.passwordUpdateFailed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updatePassword,
    isLoading,
    error,
  };
}
