/**
 * Image placeholder utilities for Next.js Image component blur effects
 * Provides shimmer placeholder for better perceived performance
 */

/**
 * Base64 encoded shimmer SVG for blur placeholder
 * Creates a dark blue gradient shimmer effect
 */
export const SHIMMER_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(
  `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#1a1a2e"/>
    <rect width="100%" height="100%" fill="url(#shimmer)"/>
    <defs>
      <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#1a1a2e"/>
        <stop offset="50%" style="stop-color:#2a2a4e"/>
        <stop offset="100%" style="stop-color:#1a1a2e"/>
      </linearGradient>
    </defs>
  </svg>`
).toString("base64")}`;

/**
 * Browser-compatible fallback shimmer placeholder
 * For environments where Buffer is not available
 */
export const SHIMMER_DATA_URL_BROWSER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Crect fill='%231a1a2e' width='400' height='600'/%3E%3C/svg%3E";

/**
 * Get shimmer placeholder URL based on environment
 * @returns {string} Shimmer data URL
 */
export function getShimmerPlaceholder(): string {
  // Use Buffer in Node.js/Next.js environment, fallback for browser
  if (typeof Buffer !== "undefined") {
    return SHIMMER_DATA_URL;
  }
  return SHIMMER_DATA_URL_BROWSER;
}
