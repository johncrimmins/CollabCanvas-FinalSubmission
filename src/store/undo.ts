// src/store/undo.ts - Zustand slice for local undo/redo functionality and history management.
import { type StateCreator } from "zustand";
import type { CanvasOperation, CanvasStoreState, UndoSlice } from "@/store/types";

export const MAX_HISTORY = 100;

export const createUndoSlice: StateCreator<
  CanvasStoreState,
  [["zustand/immer", never]],
  [],
  UndoSlice
> = (set, get) => ({
  history: [],
  pointer: -1,
  push: (operation: CanvasOperation) => {
    set((state) => {
      const nextPointer = state.pointer + 1;
      state.history = state.history.slice(0, nextPointer);
      state.history.push(operation);
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      }
      state.pointer = state.history.length - 1;
    });
  },
  undo: () => {
    let operation: CanvasOperation | null = null;
    set((state) => {
      if (state.pointer < 0) return;
      operation = state.history[state.pointer];
      state.pointer -= 1;
    });
    return operation;
  },
  redo: () => {
    let operation: CanvasOperation | null = null;
    set((state) => {
      if (state.pointer >= state.history.length - 1) return;
      state.pointer += 1;
      operation = state.history[state.pointer];
    });
    return operation;
  },
  canUndo: () => get().pointer >= 0,
  canRedo: () => get().pointer < get().history.length - 1,
  clearHistory: () => set({ history: [], pointer: -1 }),
});

