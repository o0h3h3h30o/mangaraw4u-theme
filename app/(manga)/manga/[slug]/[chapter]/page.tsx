/**
 * Chapter Reader Page
 * Server component with SEO metadata from centralized config
 */

import type { Metadata } from "next";

import { generateChapterMetadata } from "@/lib/seo/metadata";
import { chapterApi } from "@/lib/api/endpoints/chapter";
import { ReaderView } from "@/components/reader/reader-view";

interface PageProps {
  params: Promise<{
    slug: string;
    chapter: string;
  }>;
}

/**
 * Generate metadata for chapter reader page using centralized SEO config
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug, chapter } = await params;
    const chapterData = await chapterApi.getDetail(slug, chapter);

    return generateChapterMetadata(chapterData);
  } catch {
    // Return basic metadata if chapter not found
    return {
      title: "Chapter Not Found",
      description: "The requested chapter could not be found.",
    };
  }
}

/**
 * Chapter Reader Page Component
 */
export default async function ChapterPage({ params }: PageProps) {
  const { slug, chapter } = await params;
  return <ReaderView key={chapter} mangaSlug={slug} chapterSlug={chapter} />;
}