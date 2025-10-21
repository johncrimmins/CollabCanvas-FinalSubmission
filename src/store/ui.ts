import { type StateCreator } from "zustand";
import type {
  CanvasStoreState,
  LocalIntentEntry,
  LocalIntentState,
  UISlice,
  CanvasTool,
} from "@/store/types";

const defaultLocalIntent: LocalIntentState = {};

export const createUISlice: StateCreator<
  CanvasStoreState,
  [["zustand/immer", never]],
  [],
  UISlice
> = (set) => ({
  tool: "select",
  selectedIds: [],
  draftTextById: {},
  localIntent: defaultLocalIntent,
  setTool: (tool: CanvasTool) => set({ tool }),
  setSelectedIds: (selectedIds: string[]) => set({ selectedIds }),
  clearSelection: () => set({ selectedIds: [] }),
  beginLocalIntent: (objectId: string, entry: LocalIntentEntry) => {
    set((state) => {
      state.localIntent[objectId] = entry;
    });
  },
  updateLocalIntent: (objectId: string, entry: Partial<LocalIntentEntry>) => {
    set((state) => {
      if (!state.localIntent[objectId]) return;
      state.localIntent[objectId] = {
        ...state.localIntent[objectId],
        ...entry,
      };
    });
  },
  endLocalIntent: (objectId: string) => {
    set((state) => {
      delete state.localIntent[objectId];
    });
  },
  clearLocalIntent: () => set({ localIntent: {} }),
  setDraftText: (objectId: string, text: string) => {
    set((state) => {
      state.draftTextById[objectId] = text;
    });
  },
  clearDraftText: (objectId: string) => {
    set((state) => {
      delete state.draftTextById[objectId];
    });
  },
  resetUI: () =>
    set({
      tool: "select",
      selectedIds: [],
      draftTextById: {},
      localIntent: {},
    }),
});

