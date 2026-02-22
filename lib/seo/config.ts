/**
 * SEO Configuration
 *
 * This file acts as the bridge between environment variables and the application.
 * It contains NO hardcoded user-facing strings (which are now in messages/*.json).
 */

// Basic helper to ensure trailing slash
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
};

export const siteConfig = {
  // Site identity (from Env)
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Mangaraw4u",

  // URLs
  url: getBaseUrl(),

  // Images
  ogImage: "/og-donghentai.jpg", // Kept as default resource path
  favicon: "/favicon.ico",

  // Social (from Env)
  links: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@manga-reader",
    telegram: "https://t.me/donghentai", // Could be moved to env if needed
  },

  // Author & publisher (Infrastructure level)
  creator: process.env.NEXT_PUBLIC_SITE_NAME || "Team Manga Reader",
  publisher: process.env.NEXT_PUBLIC_SITE_NAME || "Manga Reader CMS",

  // Verification codes
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
} as const;

// Helper to build absolute URLs
export function buildUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${siteConfig.url}/${cleanPath}`;
}

export function buildImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return buildUrl(imagePath);
}
