"use client";

import { createContext, useContext, useRef, createElement } from "react";
import { createStore, StoreApi } from "zustand";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CanvasStoreState } from "@/store/types";
import { createObjectsSlice } from "@/store/objects";
import { createUISlice } from "@/store/ui";
import { createPresenceSlice } from "@/store/presence";
import { createUndoSlice } from "@/store/undo";

type CanvasStore = StoreApi<CanvasStoreState>;

export type CanvasStoreInitializer = () => CanvasStore;

const StoreContext = createContext<CanvasStore | null>(null);

const createCanvasStore: CanvasStoreInitializer = () =>
  createStore<CanvasStoreState>()(
    immer((...args) => ({
      ...createObjectsSlice(...args),
      ...createUISlice(...args),
      ...createPresenceSlice(...args),
      ...createUndoSlice(...args),
    }))
  );

export function CanvasStoreProvider({
  children,
  storeFactory = createCanvasStore,
}: {
  children: React.ReactNode;
  storeFactory?: CanvasStoreInitializer;
}) {
  const storeRef = useRef<CanvasStore>();

  if (!storeRef.current) {
    storeRef.current = storeFactory();
  }

  return createElement(
    StoreContext.Provider,
    { value: storeRef.current },
    children
  );
}

export function useCanvasStore<T>(
  selector: (state: CanvasStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useCanvasStore must be used within a CanvasStoreProvider");
  }
  return useStore(store, selector, equalityFn);
}

export { createCanvasStore };

