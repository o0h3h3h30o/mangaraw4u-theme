/**
 * Manga Detail Page
 * Server component with SEO metadata and JSON-LD schemas
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { generateMangaMetadata } from "@/lib/seo/metadata";
import {
  generateMangaSchema,
  generateBreadcrumbSchema,
  combineSchemas,
} from "@/lib/seo/json-ld";
import { mangaApi } from "@/lib/api/endpoints/manga";
import { MangaDetailContent } from "./manga-detail-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate metadata for manga detail page
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const manga = await mangaApi.getDetail(slug);

    return generateMangaMetadata(manga);
  } catch {
    // Return basic metadata if manga not found
    return {
      title: "Manga Not Found",
      description: "The requested manga could not be found.",
    };
  }
}

/**
 * Manga Detail Page Component
 */
export default async function MangaDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch manga data for JSON-LD schema generation
  let manga;
  try {
    manga = await mangaApi.getDetail(slug);
  } catch {
    notFound();
  }

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Manga", url: "/manga" },
    { name: manga.name, url: `/manga/${manga.slug}` },
  ]);

  // Generate manga schema
  const mangaSchema = generateMangaSchema(manga);

  // Combine schemas
  const schemas = combineSchemas([breadcrumbSchema, mangaSchema]);

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      {/* Client Content */}
      <MangaDetailContent slug={slug} />
    </>
  );
}
