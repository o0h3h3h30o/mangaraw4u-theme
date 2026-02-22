"use client";

/**
 * React Query Provider
 * Client component wrapper for TanStack Query (React Query)
 * Provides QueryClient to the entire application for data fetching and caching
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

/**
 * ReactQueryProvider component
 * Creates a QueryClient instance and provides it to children components
 * Uses useState to ensure QueryClient is created once per component lifecycle
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create QueryClient instance once per component mount
  // This prevents creating new instances on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus
            refetchOnWindowFocus: false,
            // Retry failed requests twice with exponential backoff
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
            // Cache data for 5 minutes (considered fresh)
            staleTime: 5 * 60 * 1000,
            // Keep in memory for 30 minutes to prevent cache thrashing during reading sessions
            gcTime: 30 * 60 * 1000,
            // Refetch when network returns from offline state
            refetchOnReconnect: 'always',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
