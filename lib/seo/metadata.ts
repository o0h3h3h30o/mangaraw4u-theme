import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig, buildUrl, buildImageUrl } from "./config";

/**
 * Metadata Generators
 *
 * This file contains reusable functions to generate metadata for different page types.
 * All functions automatically use the centralized siteConfig and next-intl for localization.
 */

/**
 * Interface for generic page metadata parameters
 */
interface PageMetadataParams {
  title: string | { default: string; template: string };
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}

/**
 * Generate metadata for a generic page
 */
export async function generatePageMetadata({
  title,
  description,
  path = "",
  image,
  keywords = [],
  type = "website",
  noindex = false,
}: PageMetadataParams): Promise<Metadata> {
  const t = await getTranslations("seo");
  const url = buildUrl(path);
  const ogImage = image
    ? buildImageUrl(image)
    : buildImageUrl(siteConfig.ogImage);

  // Get default keywords from translations
  const defaultKeywords = t.raw("keywords") as unknown as string[];

  // Combine provided keywords with default site keywords
  const allKeywords = [...defaultKeywords, ...keywords];

  // Replace {siteName} placeholder if present in title/desc
  // Handle both string and title template object
  const finalTitle =
    typeof title === "string"
      ? title.replace(/{siteName}/g, siteConfig.name)
      : title;
  const finalDescription = description.replace(/{siteName}/g, siteConfig.name);

  // Extract string title for OpenGraph (which doesn't support template objects)
  const ogTitle =
    typeof finalTitle === "string" ? finalTitle : finalTitle.default;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: allKeywords,

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // Robots
    robots: noindex
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },

    // Open Graph
    openGraph: {
      title: ogTitle,
      description: finalDescription,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
      locale: "vi_VN", // This could also be dynamic if needed
      type,
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: finalDescription,
      images: [ogImage],
      creator: siteConfig.links.twitter,
      site: siteConfig.links.twitter,
    },

    metadataBase: new URL(siteConfig.url),
  };
}

/**
 * Generate Default Metadata (for Root Layout)
 * Call this in app/layout.tsx
 */
export async function generateDefaultMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo");

  const title = t("default.title", { siteName: siteConfig.name });
  const description = t("default.description", { siteName: siteConfig.name });
  const template = t("default.template", { siteName: siteConfig.name });

  const baseMetadata = await generatePageMetadata({
    title: {
      default: title,
      template: template,
    },
    description,
  });

  return {
    ...baseMetadata,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    icons: {
      icon: siteConfig.favicon,
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    verification: siteConfig.verification,
  };
}

/**
 * Generate metadata for manga detail pages
 */
export async function generateMangaMetadata(manga: {
  name: string;
  name_alt?: string;
  pilot: string;
  cover_full_url: string;
  slug: string;
  average_rating?: number;
  views?: number;
  status?: number;
  genres?: Array<{ name: string }>;
}): Promise<Metadata> {
  const t = await getTranslations("seo");

  // Build keywords from genres
  const genreKeywords = manga.genres?.map((g) => g.name) || [];

  // Build title with alternative name if available (max 70 chars)
  let title = manga.name;
  if (manga.name_alt) {
    const withAlt = `${manga.name} (${manga.name_alt})`;
    title = withAlt.length <= 70 ? withAlt : manga.name;
  }
  title = truncateText(title, 70);

  // Build description from translation template
  const pilotSnippet = manga.pilot.replace(/<[^>]*>/g, "").substring(0, 100);
  const description = truncateText(
    t("manga.description", { name: manga.name, pilot: pilotSnippet }),
    160
  );

  return generatePageMetadata({
    title,
    description,
    path: `/manga/${manga.slug}`,
    image: manga.cover_full_url,
    keywords: [...genreKeywords, "manga", manga.name],
    type: "article",
  });
}

/**
 * Generate metadata for chapter reader pages
 */
export async function generateChapterMetadata(chapter: {
  name: string;
  slug: string;
  order?: number;
  manga: {
    name: string;
    slug: string;
    cover_full_url?: string;
  };
}): Promise<Metadata> {
  const t = await getTranslations("seo");

  const title = `${chapter.manga.name} - ${chapter.name}`;
  const description = t("chapter.description", {
    mangaName: chapter.manga.name,
    chapterName: chapter.name,
  });

  return generatePageMetadata({
    title,
    description,
    path: `/manga/${chapter.manga.slug}/${chapter.slug}`,
    image: chapter.manga.cover_full_url,
    keywords: [
      chapter.manga.name,
      chapter.name,
      t("chapter.keywords.read"),
      t("chapter.keywords.chapter"),
    ],
    type: "article",
  });
}

/**
 * Generate metadata for genre pages
 */
export async function generateGenreMetadata(genre: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Metadata> {
  const t = await getTranslations("seo");

  const title = t("genre.title", { name: genre.name });
  const description =
    genre.description || t("genre.description", { name: genre.name });

  return generatePageMetadata({
    title,
    description,
    path: `/genres/${genre.slug}`,
    keywords: [
      genre.name,
      t("genre.keywords.genre"),
      t("genre.keywords.manga"),
      t("genre.keywords.comic"),
    ],
  });
}

/**
 * Generate metadata for search results pages
 */
export async function generateSearchMetadata(query: string): Promise<Metadata> {
  const t = await getTranslations("seo");

  const title = t("search.title", { query });
  const description = t("search.description", { query });

  return generatePageMetadata({
    title,
    description,
    path: `/search?q=${encodeURIComponent(query)}`,
    keywords: [query, t("search.keywords.search")],
    noindex: true, // Search result pages typically shouldn't be indexed
  });
}

/**
 * Generate metadata for user profile pages
 */
export async function generateProfileMetadata(user: {
  name: string;
  avatar_full_url?: string;
}): Promise<Metadata> {
  const t = await getTranslations("seo");

  const title = t("profile.title", { name: user.name });
  const description = t("profile.description", { name: user.name });

  return generatePageMetadata({
    title,
    description,
    path: "/profile",
    image: user.avatar_full_url,
    type: "profile",
    noindex: true, // User profiles typically shouldn't be indexed
  });
}

/**
 * Generate metadata for library/history pages
 */
export async function generateLibraryMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo");

  return generatePageMetadata({
    title: t("library.title"),
    description: t("library.description"),
    path: "/library",
    noindex: true, // Private pages shouldn't be indexed
  });
}

/**
 * Generate metadata for artist pages
 */
export async function generateArtistMetadata(artist: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Metadata> {
  const t = await getTranslations("seo");

  const title = t("artist.title", { name: artist.name });
  const description =
    artist.description || t("artist.description", { name: artist.name });

  return generatePageMetadata({
    title,
    description,
    path: `/artists/${artist.slug}`,
    keywords: [artist.name, t("artist.keywords.artist"), "manga"],
  });
}

/**
 * Helper: Strip HTML tags from string
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Helper: Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
