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

