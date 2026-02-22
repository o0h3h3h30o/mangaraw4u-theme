/**
 * Authentication Store
 * Zustand store for managing authentication state with localStorage persistence
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";

/**
 * Custom storage that works on both client and server
 */
const customStorage = () => {
  if (typeof window === "undefined") {
    // Server-side - return noop storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  // Client-side - use localStorage
  return {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        // Ignore errors
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch {
        // Ignore errors
      }
    },
  };
};

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  lastValidated: number | null; // Timestamp of last token validation
}

/**
 * Authentication actions interface
 */
interface AuthActions {
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  getToken: () => string | null;
  setLastValidated: (timestamp: number) => void;
}

/**
 * Complete auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Initial state
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  lastValidated: null,
};

/**
 * Auth store with persistence
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Set authentication (after login/register)
       */
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          lastValidated: Date.now(),
        }),

      /**
       * Update user data (after profile update)
       */
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      /**
       * Logout and clear authentication
       */
      logout: () => set(initialState),

      /**
       * Get current token (helper method)
       */
      getToken: () => get().token,

      /**
       * Update last validation timestamp
       */
      setLastValidated: (timestamp) =>
        set({
          lastValidated: timestamp,
        }),
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(customStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastValidated: state.lastValidated,
      }),
    }
  )
);
