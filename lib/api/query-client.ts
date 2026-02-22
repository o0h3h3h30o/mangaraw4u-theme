/**
 * Server-side QueryClient Factory
 * Creates a cached QueryClient instance for server-side rendering
 */

import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

/**
 * Create and cache a QueryClient instance for server-side rendering
 * Uses React's cache() to ensure we get the same instance within a single request
 */
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // Data is considered fresh for 1 minute on server
          staleTime: 60 * 1000,
          // Keep data in memory for 5 minutes
          gcTime: 5 * 60 * 1000,
          // Don't refetch on window focus on server
          refetchOnWindowFocus: false,
        },
      },
    })
);
