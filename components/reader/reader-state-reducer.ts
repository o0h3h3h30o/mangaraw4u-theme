/**
 * Reader State Reducer
 * Consolidates all reader UI state into a single reducer for better performance
 */

export type ReadingMode = "single" | "long-strip";

export interface ReaderState {
  readingMode: ReadingMode;
  zoom: number;
  showControls: boolean;
  currentPage: number;
  backgroundColor: string;
  imageSpacing: number;
}

export type ReaderAction =
  | { type: "SET_READING_MODE"; payload: ReadingMode }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "TOGGLE_CONTROLS" }
  | { type: "SET_CONTROLS"; payload: boolean }
  | { type: "SET_PAGE"; payload: number }
  | { type: "NEXT_PAGE"; totalPages: number }
  | { type: "PREVIOUS_PAGE" }
  | { type: "SET_BACKGROUND_COLOR"; payload: string }
  | { type: "SET_IMAGE_SPACING"; payload: number }
  | { type: "RESET_TO_DEFAULTS" };

const initialState: ReaderState = {
  readingMode: "long-strip",
  zoom: 100,
  showControls: true,
  currentPage: 0,
  backgroundColor: "#000000",
  imageSpacing: 0,
};

export function readerReducer(state: ReaderState, action: ReaderAction): ReaderState {
  switch (action.type) {
    case "SET_READING_MODE":
      return {
        ...state,
        readingMode: action.payload,
        // Reset to page 0 when changing modes
        currentPage: 0,
      };

    case "SET_ZOOM":
      return {
        ...state,
        zoom: Math.max(50, Math.min(200, action.payload)), // Clamp between 50-200%
      };

    case "TOGGLE_CONTROLS":
      return {
        ...state,
        showControls: !state.showControls,
      };

    case "SET_CONTROLS":
      return {
        ...state,
        showControls: action.payload,
      };

    case "SET_PAGE":
      return {
        ...state,
        currentPage: Math.max(0, action.payload),
      };

    case "NEXT_PAGE":
      return {
        ...state,
        currentPage: Math.min(state.currentPage + 1, action.totalPages - 1),
      };

    case "PREVIOUS_PAGE":
      return {
        ...state,
        currentPage: Math.max(0, state.currentPage - 1),
      };

    case "SET_BACKGROUND_COLOR":
      return {
        ...state,
        backgroundColor: action.payload,
      };

    case "SET_IMAGE_SPACING":
      return {
        ...state,
        imageSpacing: Math.max(0, Math.min(100, action.payload)), // Clamp between 0-100px
      };

    case "RESET_TO_DEFAULTS":
      return {
        ...initialState,
        // Preserve current page when resetting
        currentPage: state.currentPage,
      };

    default:
      return state;
  }
}

export { initialState };