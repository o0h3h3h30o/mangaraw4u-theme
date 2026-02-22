/**
 * API Configuration
 * Centralized configuration for API client
 */

/**
 * API base URL - from environment variable or fallback to localhost
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * API version
 */
export const API_VERSION = "v1";

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Initial delay in ms
  retryStatusCodes: [408, 429, 500, 502, 503, 504], // Which status codes to retry
  retryMethods: ["GET"], // Only retry GET requests by default
};

/**
 * Default cache configuration for Next.js fetch
 */
export const DEFAULT_CACHE_CONFIG = {
  // Use 'force-cache' for static data, 'no-store' for dynamic data
  cache: "no-store" as RequestCache,
  // Revalidate after 60 seconds
  next: {
    revalidate: 60,
  },
};

/**
 * Default headers for all requests
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
