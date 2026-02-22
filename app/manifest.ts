import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/config";

/**
 * Web App Manifest
 *
 * Provides metadata for PWA installation. Uses Vietnamese as default locale.
 * Theme colors match dark mode from globals.css (--background in .dark class).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name.split(" ")[0] || "Manga",
    description: "Đọc manga online miễn phí với chất lượng cao",
    start_url: "/",
    display: "standalone",
    background_color: "#18121d",
    theme_color: "#18121d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
