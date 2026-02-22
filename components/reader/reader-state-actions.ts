/**
 * Reader State Actions
 * Helper functions for common reader state operations
 */

import type { ReaderAction, ReadingMode } from "./reader-state-reducer";

export const readerActions = {
  // Zoom actions
  setZoom: (zoom: number): ReaderAction => ({
    type: "SET_ZOOM",
    payload: zoom,
  }),

  zoomIn: (currentZoom: number): ReaderAction => ({
    type: "SET_ZOOM",
    payload: Math.min(currentZoom + 25, 200),
  }),

  zoomOut: (currentZoom: number): ReaderAction => ({
    type: "SET_ZOOM",
    payload: Math.max(currentZoom - 25, 50),
  }),

  resetZoom: (): ReaderAction => ({
    type: "SET_ZOOM",
    payload: 100,
  }),

  // Controls actions
  toggleControls: (): ReaderAction => ({
    type: "TOGGLE_CONTROLS",
  }),

  showControls: (): ReaderAction => ({
    type: "SET_CONTROLS",
    payload: true,
  }),

  hideControls: (): ReaderAction => ({
    type: "SET_CONTROLS",
    payload: false,
  }),

  nextPage: (totalPages: number): ReaderAction => ({
    type: "NEXT_PAGE",
    totalPages,
  }),

  previousPage: (): ReaderAction => ({
    type: "PREVIOUS_PAGE",
  }),

  // Settings actions
  setBackgroundColor: (color: string): ReaderAction => ({
    type: "SET_BACKGROUND_COLOR",
    payload: color,
  }),

  setImageSpacing: (spacing: number): ReaderAction => ({
    type: "SET_IMAGE_SPACING",
    payload: spacing,
  }),

  // Preset backgrounds
  setBlackBackground: (): ReaderAction => ({
    type: "SET_BACKGROUND_COLOR",
    payload: "#000000",
  }),

  setWhiteBackground: (): ReaderAction => ({
    type: "SET_BACKGROUND_COLOR",
    payload: "#FFFFFF",
  }),

  setSepiaBackground: (): ReaderAction => ({
    type: "SET_BACKGROUND_COLOR",
    payload: "#F4EACD",
  }),

  // Reset action
  resetToDefaults: (): ReaderAction => ({
    type: "RESET_TO_DEFAULTS",
  }),
};
