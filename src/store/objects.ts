import { type StateCreator } from "zustand";
import type { CanvasStoreState, ObjectsSlice } from "@/store/types";

export const createObjectsSlice: StateCreator<
  CanvasStoreState,
  [["zustand/immer", never]],
  [],
  ObjectsSlice
> = (set) => ({
  objects: {},
  upsertMany: (objects) => {
    if (!objects.length) return;
    set((state) => {
      for (const object of objects) {
        state.objects[object.id] = object;
      }
    });
  },
  setAll: (objects) => {
    set((state) => {
      const next: Record<string, typeof state.objects[string]> = {};
      for (const object of objects) {
        next[object.id] = object;
      }
      state.objects = next;
    });
  },
  removeMany: (ids) => {
    if (!ids.length) return;
    set((state) => {
      for (const id of ids) {
        delete state.objects[id];
      }
    });
  },
  resetObjects: () => {
    set((state) => {
      state.objects = {};
    });
  },
});

