import { type StateCreator } from "zustand";
import type { CanvasStoreState, PatchBundle, UndoSlice } from "@/store/types";

export const MAX_HISTORY = 100;

export const createUndoSlice: StateCreator<
  CanvasStoreState,
  [["zustand/immer", never]],
  [],
  UndoSlice
> = (set) => ({
  history: [],
  pointer: -1,
  push: (bundle: PatchBundle) => {
    set((state) => {
      const nextPointer = state.pointer + 1;
      state.history = state.history.slice(0, nextPointer);
      state.history.push(bundle);
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      }
      state.pointer = state.history.length - 1;
    });
  },
  undo: () => {
    let snapshot: PatchBundle | null = null;
    set((state) => {
      if (state.pointer < 0) return;
      const bundle = state.history[state.pointer];
      snapshot = {
        patches: bundle.patches.slice(),
        inversePatches: bundle.inversePatches.slice(),
      };
      state.pointer -= 1;
    });
    return snapshot;
  },
  redo: () => {
    let snapshot: PatchBundle | null = null;
    set((state) => {
      if (state.pointer >= state.history.length - 1) return;
      state.pointer += 1;
      const bundle = state.history[state.pointer];
      snapshot = {
        patches: bundle.patches.slice(),
        inversePatches: bundle.inversePatches.slice(),
      };
    });
    return snapshot;
  },
  clearHistory: () => set({ history: [], pointer: -1 }),
});

