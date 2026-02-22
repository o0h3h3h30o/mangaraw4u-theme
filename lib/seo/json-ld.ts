import { siteConfig, buildUrl, buildImageUrl } from "./config";

/**
 * JSON-LD Schema Generators
 *
 * JSON-LD (JavaScript Object Notation for Linked Data) is a method of encoding
 * structured data that helps search engines better understand your content.
 *
 * These generators create schema.org markup for different types of content,
 * improving SEO and enabling rich snippets in search results.
 *
 * Usage in pages:
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(generateWebsiteSchema()),
 *   }}
 * />
 * ```
 */

/**
 * Generate Website schema
 *
 * Basic schema for the website itself. Use in the root layout.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(generateWebsiteSchema()),
 *   }}
 * />
 * ```
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    // Note: description is not in siteConfig anymore (moved to i18n)
    // We can use a default or omit it here if we don't have access to i18n
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Organization schema
 *
 * Provides information about your organization.
 *
 * @example
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(generateOrganizationSchema()),
 *   }}
 * />
 * ```
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: buildImageUrl(siteConfig.ogImage),
    sameAs: [siteConfig.links.twitter, siteConfig.links.telegram].filter(
      Boolean
    ), // Remove empty values
  };
}

/**
 * Generate Breadcrumb schema
 *
 * Creates a breadcrumb trail for navigation.
 *
 * @example
 * ```tsx
 * const breadcrumbs = [
 *   { name: 'Trang chủ', url: '/' },
 *   { name: 'Manga', url: '/manga' },
 *   { name: 'One Piece', url: '/manga/one-piece' },
 * ];
 *
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
 *   }}
 * />
 * ```
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildUrl(item.url),
    })),
  };
}

/**
 * Generate Manga (Book) schema
 *
 * Creates schema for manga detail pages using the Book type.
 *
 * @example
 * ```tsx
 * export default async function MangaPage({ params }) {
 *   const manga = await fetchManga(params.slug);
 *
 *   return (
 *     <>
 *       <script
 *         type="application/ld+json"
 *         dangerouslySetInnerHTML={{
 *           __html: JSON.stringify(generateMangaSchema(manga)),
 *         }}
 *       />
 *       {/* Page content *\/}
 *     </>
 *   );
 * }
 * ```
 */
export function generateMangaSchema(manga: {
  name: string;
  name_alt?: string;
  pilot: string;
  cover_full_url: string;
  slug: string;
  average_rating?: number;
  total_ratings?: number;
  views?: number;
  status?: number;
  artist?: { name: string };
  genres?: Array<{ name: string }>;
  created_at?: string;
  updated_at?: string;
}) {
  // Clean HTML from description
  const cleanDescription = manga.pilot.replace(/<[^>]*>/g, "");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: manga.name,
    alternateName: manga.name_alt,
    description: cleanDescription,
    image: buildImageUrl(manga.cover_full_url),
    url: buildUrl(`/manga/${manga.slug}`),
    genre: manga.genres?.map((g) => g.name).join(", "),
  };

  // Add author if available
  if (manga.artist?.name) {
    schema.author = {
      "@type": "Person",
      name: manga.artist.name,
    };
  }

  // Add aggregate rating if available
  if (manga.average_rating && manga.total_ratings) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: manga.average_rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: manga.total_ratings,
    };
  }

  // Add dates if available
  if (manga.created_at) {
    schema.datePublished = manga.created_at;
  }
  if (manga.updated_at) {
    schema.dateModified = manga.updated_at;
  }

  return schema;
}

/**
 * Generate Article schema for chapters
 *
 * Creates schema for chapter reader pages.
 *
 * @example
 * ```tsx
 * export default async function ChapterPage({ params }) {
 *   const chapter = await fetchChapter(params.chapterSlug);
 *
 *   return (
 *     <>
 *       <script
 *         type="application/ld+json"
 *         dangerouslySetInnerHTML={{
 *           __html: JSON.stringify(generateChapterSchema(chapter)),
 *         }}
 *       />
 *       {/* Page content *\/}
 *     </>
 *   );
 * }
 * ```
 */
export function generateChapterSchema(chapter: {
  name: string;
  slug: string;
  views?: number;
  created_at?: string;
  manga: {
    name: string;
    slug: string;
    cover_full_url?: string;
    artist?: { name: string };
  };
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${chapter.manga.name} - ${chapter.name}`,
    name: chapter.name,
    image: chapter.manga.cover_full_url
      ? buildImageUrl(chapter.manga.cover_full_url)
      : undefined,
    url: buildUrl(`/manga/${chapter.manga.slug}/${chapter.slug}`),
    isPartOf: {
      "@type": "Book",
      name: chapter.manga.name,
      url: buildUrl(`/manga/${chapter.manga.slug}`),
    },
  };

  // Add author if available
  if (chapter.manga.artist?.name) {
    schema.author = {
      "@type": "Person",
      name: chapter.manga.artist.name,
    };
  }

  // Add publisher
  schema.publisher = {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  };

  // Add dates
  if (chapter.created_at) {
    schema.datePublished = chapter.created_at;
  }

  return schema;
}

/**
 * Generate Review schema
 *
 * Creates schema for user reviews/ratings.
 *
 * @example
 * ```tsx
 * const reviews = manga.reviews.map(review =>
 *   generateReviewSchema(review, manga)
 * );
 * ```
 */
export function generateReviewSchema(
  review: {
    content: string;
    rating: number;
    user: { name: string };
    created_at: string;
  },
  manga: {
    name: string;
    slug: string;
    total_ratings?: number;
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewBody: review.content,
    datePublished: review.created_at,
    author: {
      "@type": "Person",
      name: review.user.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: manga.total_ratings,
    },
    itemReviewed: {
      "@type": "Book",
      name: manga.name,
      url: buildUrl(`/manga/${manga.slug}`),
    },
  };
}

/**
 * Generate ItemList schema
 *
 * Creates schema for lists of items (e.g., manga lists, genre pages).
 *
 * @example
 * ```tsx
 * const hotMangas = await fetchHotMangas();
 * const schema = generateItemListSchema({
 *   name: "Hot Manga",
 *   description: "Manga thịnh hành nhất hiện nay",
 *   items: hotMangas.map((manga, index) => ({
 *     position: index + 1,
 *     name: manga.name,
 *     url: `/manga/${manga.slug}`,
 *     image: manga.cover_full_url,
 *   })),
 * });
 * ```
 */
export function generateItemListSchema(params: {
  name: string;
  description?: string;
  items: Array<{
    position: number;
    name: string;
    url: string;
    image?: string;
  }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: params.name,
    description: params.description,
    numberOfItems: params.items.length,
    itemListElement: params.items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      item: {
        "@type": "Book",
        name: item.name,
        url: buildUrl(item.url),
        image: item.image ? buildImageUrl(item.image) : undefined,
      },
    })),
  };
}

/**
 * Generate Person schema for artists/authors
 *
 * @example
 * ```tsx
 * const artist = await fetchArtist(params.slug);
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(generatePersonSchema(artist)),
 *   }}
 * />
 * ```
 */
export function generatePersonSchema(person: {
  name: string;
  slug: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    description: person.description,
    url: buildUrl(`/artists/${person.slug}`),
    jobTitle: "Manga Artist",
  };
}

/**
 * Helper: Combine multiple schemas
 *
 * Use when you need multiple schemas on the same page.
 *
 * @example
 * ```tsx
 * const schemas = combineSchemas([
 *   generateBreadcrumbSchema(breadcrumbs),
 *   generateMangaSchema(manga),
 * ]);
 *
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
 * />
 * ```
 */
export function combineSchemas(schemas: Array<Record<string, unknown>>) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}
