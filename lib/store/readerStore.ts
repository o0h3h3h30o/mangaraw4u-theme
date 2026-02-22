import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReaderPreferences {
  disableSpacebarNav: boolean;

  backgroundColor: string;
  imageSpacing: number;
  zoom: number;
}

interface ReaderStore {
  preferences: ReaderPreferences;
  updatePreference: <K extends keyof ReaderPreferences>(
    key: K,
    value: ReaderPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

const defaultPreferences: ReaderPreferences = {
  disableSpacebarNav: true, // Default to disabled

  backgroundColor: "#000000",
  imageSpacing: 0,
  zoom: 100,
};

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      updatePreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: "reader-preferences",
      partialize: (state) => state.preferences,
    }
  )
);
