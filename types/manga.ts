/**
 * Manga-related Types
 * All types related to manga, genres, artists, and groups
 */

import type { ListParams } from "./api";

/**
 * Manga status enum
 */
export enum MangaStatus {
  ONGOING = 1,
  COMPLETED = 2,
}

/**
 * Genre entity
 */
export interface Genre {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_nsfw?: boolean;
  created_at?: string;
  updated_at?: string;
  mangas_count?: number;
}

/**
 * Artist entity
 */
export interface Artist {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  mangas_count?: number;
}

/**
 * Translation group entity
 */
export interface Group {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  mangas_count?: number;
}

/**
 * Doujinshi category entity
 */
export interface Doujinshi {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  mangas_count?: number;
}

/**
 * Chapter reference (for latest/first chapter in manga)
 */
export interface ChapterReference {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  views?: number;
  order?: number;
  created_at: string;
}

/**
 * Manga entity (full details)
 */
export interface Manga {
  id: number;
  uuid: string;
  name: string;
  name_alt: string;
  slug: string;
  pilot: string; // Description in HTML
  status: MangaStatus;
  views: number;
  views_week?: number;
  views_day?: number;
  average_rating: number;
  total_ratings: number;
  is_hot: boolean;
  is_reviewed?: number;
  cover_full_url: string;
  created_at: string;
  updated_at: string;
  genres?: Genre[];
  author?: Artist;
  artist?: Artist;
  group?: Group;
  latest_chapter?: ChapterReference;
  first_chapter?: ChapterReference;
}

/**
 * Simplified manga for lists
 */
export interface MangaListItem {
  id: number;
  uuid: string;
  name: string;
  name_alt?: string;
  slug: string;
  status: MangaStatus;
  views: number;
  views_week?: number;
  views_day?: number;
  average_rating: number;
  total_ratings?: number;
  is_hot: boolean;
  caution?: boolean;
  cover_full_url: string;
  updated_at: string;
  latest_chapter?: ChapterReference;
  artist?: Pick<Artist, "id" | "name" | "slug">;
  genres?: Pick<Genre, "id" | "name" | "slug">[];
}

/**
 * Manga list query parameters
 */
export interface MangaListParams extends ListParams {
  sort?: "-updated_at" | "-views" | "-rating" | "name";
  "filter[name]"?: string;
  "filter[status]"?: MangaStatus;
  "filter[accept_genres]"?: number; // genres id
  "filter[author]"?: string; // author/artist slug
  include?: string; // e.g., "genres,artist,latest_chapter,group"
}

/**
 * Search query parameters
 */
export interface MangaSearchParams extends ListParams {
  q: string;
}

/**
 * Genre mangas query parameters
 */
export interface GenreMangasParams extends ListParams {
  sort?: "-updated_at" | "views" | "rating" | "name";
}

/**
 * User's favorite manga (with bookmark metadata)
 */
export interface FavoriteManga extends MangaListItem {
  favorited_at?: string;
}

/**
 * Add to favorites request
 */
export interface AddFavoriteRequest {
  manga_id: number;
}

/**
 * Add to favorites response
 */
export interface AddFavoriteResponse {
  manga: Pick<Manga, "id" | "uuid" | "name" | "slug" | "cover_full_url">;
  favorited: boolean;
}

/**
 * Remove from favorites response
 */
export interface RemoveFavoriteResponse {
  manga_id: number;
  favorited: boolean;
}

/**
 * Check favorite status response
 */
export interface CheckFavoriteStatusResponse {
  manga_id: number;
  is_favorited: boolean;
}
