/**
 * Centralized application constants
 * Avoids magic numbers scattered across the codebase
 */

// === Cache / Stale Times (milliseconds) ===
export const STALE_TIMES = {
  /** Default stale time for most queries (1 minute) */
  DEFAULT: 60_000,
  /** For data that rarely changes: genres, static config (5 minutes) */
  LONG: 5 * 60_000,
  /** For frequently updated data: comments, user data (2 minutes) */
  SHORT: 2 * 60_000,
} as const;

// === UI Constants ===
export const UI = {
  /** Number of images to prioritize loading (above the fold) */
  PRIORITY_IMAGE_COUNT: 6,
  /** Search input debounce delay (ms) */
  SEARCH_DEBOUNCE_MS: 500,
} as const;
