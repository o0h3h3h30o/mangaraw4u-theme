export const revalidate = 600; // 10 minutes

import { generateDefaultMetadata } from "@/lib/seo/metadata";
import { generateWebsiteSchema } from "@/lib/seo/json-ld";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { HomePageContent } from "./home-content";
import type { Metadata } from "next";

/**
 * Homepage Metadata
 * Uses centralized SEO configuration from lib/seo/config.ts
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateDefaultMetadata();
}

/**
 * Homepage (Server Component)
 * Main landing page with SEO metadata and JSON-LD schema
 */
export default async function HomePage() {
  // Generate JSON-LD schema for homepage
  const websiteSchema = generateWebsiteSchema();

  // Fetch hot mangas on server for LCP optimization
  let hotMangas;
  try {
    hotMangas = await mangaApi.getTop("day", 10);
  } catch (error) {
    console.error("Failed to fetch hot mangas on server:", error);
    // Ignore error, client-side will try to fetch or handle empty state
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Page Content (Client Component) */}
      <HomePageContent initialCarouselMangas={hotMangas} />
    </>
  );
}
