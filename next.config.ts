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
  // HTML pages: no cache (always fresh content)
  // Static assets (JS/CSS/images) vẫn được Next.js tự cache với immutable hash
  headers: async () => [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)).*)",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        { key: "CDN-Cache-Control", value: "no-store" },
        { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
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
