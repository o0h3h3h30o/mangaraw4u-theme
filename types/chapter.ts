/**
 * Chapter-related Types
 * All types related to chapters and chapter reading
 */

import type { ListParams } from "./api";

/**
 * Chapter entity (list view)
 */
export interface ChapterListItem {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  views: number;
  order: number;
  chapter_number: number;
  created_at: string;
  updated_at: string;
}

/**
 * Manga reference (for chapter details)
 */
export interface MangaReference {
  id: number;
  uuid: string;
  name: string;
  name_alt?: string;
  slug: string;
  cover_full_url: string;
  cover_thumb_url: string;
}

/**
 * Chapter navigation info
 */
export interface ChapterNavigation {
  previous: ChapterNavigationItem | null;
  next: ChapterNavigationItem | null;
}

/**
 * Chapter navigation item
 */
export interface ChapterNavigationItem {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  order: number;
}

/**
 * Chapter entity (full details)
 */
export interface Chapter {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  views: number;
  order: number;
  chapter_number: number;
  created_at: string;
  updated_at: string;
  content: string[]; // Array of image URLs
  manga: MangaReference;
}

/**
 * Chapter with navigation
 */
export interface ChapterWithNavigation extends Chapter {
  navigation?: ChapterNavigation;
}

/**
 * Chapter images response
 */
export interface ChapterImagesResponse {
  chapter: {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    views: number;
    order: number;
    created_at: string;
    manga: Pick<MangaReference, "id" | "name" | "slug">;
  };
  images: string[];
}

/**
 * Chapter list query parameters
 */
export interface ChapterListParams extends ListParams {
  sort?: "asc" | "desc";
}

/**
 * Track chapter view response
 */
export interface TrackViewResponse {
  chapter_views: number;
  manga_views: number;
}

/**
 * Reading history item
 */
export interface ReadingHistoryItem {
  manga: MangaReference;
  last_read_chapter: ChapterListItem;
  last_read_at: string;
}

/**
 * Chapter report types
 */
export type ChapterReportType =
  | "broken_images"
  | "missing_images"
  | "wrong_order"
  | "wrong_chapter"
  | "duplicate"
  | "other";

/**
 * Chapter report request
 */
export interface CreateChapterReportRequest {
  report_type: ChapterReportType;
  description?: string;
}

/**
 * Chapter report entity
 */
export interface ChapterReport {
  id: number;
  user_id: number;
  chapter_id: number;
  manga_id: number;
  report_type: ChapterReportType;
  report_type_label: string;
  description: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
  chapter?: {
    id: number;
    name: string;
    slug: string;
  };
  manga?: {
    id: number;
    name: string;
    slug: string;
  };
}

/**
 * Chapter report types response
 */
export type ChapterReportTypesResponse = Record<ChapterReportType, string>;
