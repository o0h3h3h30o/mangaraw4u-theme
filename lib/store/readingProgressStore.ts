import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Reading progress data for a manga
 */
interface ReadingProgress {
  chapterSlug: string;
  chapterNumber: number;
  timestamp: number;
}

/**
 * Store for tracking reading progress per manga
 * Persists to localStorage with key "reading-progress"
 */
interface ReadingProgressStore {
  progress: Record<string, ReadingProgress>; // key: mangaSlug
  setProgress: (
    mangaSlug: string,
    chapterSlug: string,
    chapterNumber: number
  ) => void;
  getProgress: (mangaSlug: string) => ReadingProgress | null;
  clearProgress: (mangaSlug: string) => void;
}

export const useReadingProgressStore = create<ReadingProgressStore>()(
  persist(
    (set, get) => ({
      progress: {},

      setProgress: (mangaSlug, chapterSlug, chapterNumber) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [mangaSlug]: {
              chapterSlug,
              chapterNumber,
              timestamp: Date.now(),
            },
          },
        })),

      getProgress: (mangaSlug) => get().progress[mangaSlug] || null,

      clearProgress: (mangaSlug) =>
        set((state) => {
          const { [mangaSlug]: _removed, ...rest } = state.progress;
          void _removed; // Suppress unused variable warning
          return { progress: rest };
        }),
    }),
    { name: "reading-progress" }
  )
);
