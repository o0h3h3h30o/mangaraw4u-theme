import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Create next-intl plugin with i18n configuration
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  headers: async () => [
    // Homepage: CF cache 10 minutes
    {
      source: "/",
      headers: [
        { key: "CDN-Cache-Control", value: "public, max-age=600, stale-while-revalidate=60" },
      ],
    },
    // Manga detail: CF cache 1 hour
    {
      source: "/manga/:slug",
      headers: [
        { key: "CDN-Cache-Control", value: "public, max-age=3600, stale-while-revalidate=120" },
      ],
    },
    // Chapter reader: CF cache 24 hours
    {
      source: "/manga/:slug/:chapter",
      headers: [
        { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=300" },
      ],
    },
    // Browse: CF cache 5 minutes
    {
      source: "/browse",
      headers: [
        { key: "CDN-Cache-Control", value: "public, max-age=300, stale-while-revalidate=60" },
      ],
    },
    // Auth/admin pages: no cache
    {
      source: "/(login|register|profile|admin)(.*)",
      headers: [
        { key: "CDN-Cache-Control", value: "no-store" },
      ],
    },
  ],
  // Optimization for large dependencies
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "embla-carousel-react",
      "framer-motion",
      "@tanstack/react-query",
      "sonner",
    ],
  },
};

// Export the config wrapped with next-intl plugin
export default withNextIntl(nextConfig);
