"use client";

/**
 * Token Refresh Hook
 * Periodically validates authentication token to ensure it's still valid
 */

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/endpoints/auth";

/**
 * Interval for token validation (5 minutes)
 */
const TOKEN_VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook that validates token periodically
 *
 * This hook will:
 * 1. Check if user is authenticated
 * 2. Validate token every 5 minutes by calling /auth/profile
 * 3. Update lastValidated timestamp on success
 * 4. Trigger logout if token is invalid (401 error)
 *
 * Note: The API client already handles 401 errors by calling logout,
 * so this hook primarily serves to proactively validate the token
 * and keep the session alive.
 *
 * @example
 * ```tsx
 * function App() {
 *   useTokenRefresh(); // Add this to your root layout or app component
 *   return <div>...</div>
 * }
 * ```
 */
export function useTokenRefresh() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setLastValidated = useAuthStore((state) => state.setLastValidated);
  const logout = useAuthStore((state) => state.logout);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run if user is authenticated
    if (!isAuthenticated) {
      // Clear interval if exists
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    /**
     * Validate token by calling profile endpoint
     */
    const validateToken = async () => {
      try {
        // Call profile endpoint to validate token
        await authApi.getProfile();
        // Update last validated timestamp
        setLastValidated(Date.now());
      } catch (error) {
        // If validation fails (401), logout is already triggered by API client
        // This catch block handles any other errors without logging out
        console.error("Token validation failed:", error);
      }
    };

    // Validate immediately on mount
    validateToken();

    // Set up periodic validation
    intervalRef.current = setInterval(validateToken, TOKEN_VALIDATION_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, setLastValidated, logout]);
}
