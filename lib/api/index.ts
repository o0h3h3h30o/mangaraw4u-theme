/**
 * API Module Barrel Export
 * Central export point for all API functionality
 */

// Export API error class
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// Export configuration
export * from "./config";

// Export all endpoint modules
export { authApi } from "./endpoints/auth";
export {
  mangaApi,
  genreApi,
  artistApi,
  groupApi,
  doujinshiApi,
} from "./endpoints/manga";
export { chapterApi, chapterReportApi } from "./endpoints/chapter";
export {
  userFavoritesApi,
  userHistoryApi,
  userAchievementsApi,
  userPetsApi,
} from "./endpoints/user";
export { commentApi } from "./endpoints/comment";
export { ratingApi } from "./endpoints/rating";

// Export commonly used types
export type {
  ApiResponse,
  ApiError,
  PaginationMeta,
  PaginatedResponse,
  ListParams,
} from "@/types/api";

export type {
  User,
  Pet,
  Achievement,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "@/types/user";

export type {
  Manga,
  MangaListItem,
  Genre,
  Artist,
  Group,
  MangaStatus,
} from "@/types/manga";

export type {
  Chapter,
  ChapterListItem,
  ReadingHistoryItem,
} from "@/types/chapter";

export type { Comment, Rating } from "@/types/comment";
