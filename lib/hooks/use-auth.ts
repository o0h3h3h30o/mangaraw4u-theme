"use client";

/**
 * Authentication Hooks
 * Custom hooks for authentication operations using Zustand store
 */

import { useState, useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/endpoints/auth";
import type {
  LoginCredentials,
  RegisterData,
  GoogleAuthData,
} from "@/types/user";

/**
 * Hook to get current authentication state
 * Returns user, token, and authentication status from Zustand store
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === "admin",
  };
}

/**
 * Hook to perform login
 * Returns login function, loading state, and error state
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login(credentials);
        setAuth(response.user, response.token);
        return { success: true, data: response };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  return {
    login,
    isLoading,
    error,
  };
}

/**
 * Hook to perform logout
 * Returns logout function, loading state, and error state
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = useAuthStore((state) => state.logout);

  const performLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call logout API endpoint to revoke token on server
      await authApi.logout();
      // Clear local auth state
      logout();
      return { success: true };
    } catch (err) {
      // Even if API call fails, still logout locally
      logout();
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  return {
    logout: performLogout,
    isLoading,
    error,
  };
}

/**
 * Hook to perform registration
 * Returns register function, loading state, and error state
 */
export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.register(data);
        setAuth(response.user, response.token);
        return { success: true, data: response };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Registration failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  return {
    register,
    isLoading,
    error,
  };
}

/**
 * Hook to perform Google OAuth authentication
 * Returns googleAuth function, loading state, and error state
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const googleAuth = useCallback(
    async (data: GoogleAuthData) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.googleAuth(data);
        setAuth(response.user, response.token);
        return { success: true, data: response };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Google authentication failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth]
  );

  return {
    googleAuth,
    isLoading,
    error,
  };
}
