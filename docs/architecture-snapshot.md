# CollabCanvas Architecture Snapshot

## Zustand Store

### objects.ts
<details>
<summary>Summary</summary>
<code>
```typescript
// src/store/objects.ts - Zustand slice for managing canvas objects (CRUD operations and state).

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
```

**State Shape:**
- `objects: Record<string, CanvasObject>` - Maps object IDs to canvas objects
- Default value: `{}` (empty object)

**Actions:**
- `upsertMany(objects: CanvasObject[])` - Updates multiple objects, overwriting existing ones
- `setAll(objects: CanvasObject[])` - Replaces all objects with new collection
- `removeMany(ids: string[])` - Removes multiple objects by ID
- `resetObjects()` - Clears all objects

**Middleware:**
- `zustand/immer` - Uses Immer for immutable state updates

**Dependencies:**
- No dependencies on other slices

**Notes:**
- No computed or derived state
- Simple CRUD operations without complex business logic
</code>
</details>

### ui.ts
<details>
<summary>Summary</summary>
<code>
```typescript
// src/store/ui.ts - Zustand slice for UI state (tools, selections, local intent, and drafts).

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
  stagePos: { x: 0, y: 0 },
  stageScale: 1,
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
  setStageTransform: (pos, scale) =>
    set({
      stagePos: pos,
      stageScale: scale,
    }),
});
```

**State Shape:**
- `tool: CanvasTool` - Current selected tool ("select", "rectangle", "circle", "text")
- `selectedIds: string[]` - Array of selected object IDs
- `draftTextById: Record<string, string>` - Maps object IDs to draft text content
- `localIntent: Record<string, LocalIntentEntry>` - Maps object IDs to local intent entries
- `stagePos: { x: number; y: number }` - Canvas stage position
- `stageScale: number` - Canvas stage scale factor
- Default values: tool="select", selectedIds=[], draftTextById={}, localIntent={}, stagePos={x:0,y:0}, stageScale=1

**Actions:**
- `setTool(tool: CanvasTool)` - Sets the current tool
- `setSelectedIds(ids: string[])` - Sets selected object IDs
- `clearSelection()` - Clears all selections
- `beginLocalIntent(objectId: string, entry: LocalIntentEntry)` - Begins local intent for an object
- `updateLocalIntent(objectId: string, entry: Partial<LocalIntentEntry>)` - Updates local intent for an object
- `endLocalIntent(objectId: string)` - Ends local intent for an object
- `clearLocalIntent()` - Clears all local intent
- `setDraftText(objectId: string, text: string)` - Sets draft text for an object
- `clearDraftText(objectId: string)` - Clears draft text for an object
- `resetUI()` - Resets all UI state to defaults
- `setStageTransform(pos, scale)` - Sets stage position and scale

**Middleware:**
- `zustand/immer` - Uses Immer for immutable state updates

**Dependencies:**
- No dependencies on other slices

**Notes:**
- No computed or derived state
- LocalIntentEntry structure: { kind: "move" | "resize", props: Partial<CanvasObject["props"]>, seq: number }
- DraftTextState structure: Record<string, string> mapping objectId to text content
</code>
</details>

### presence.ts
<details>
<summary>Summary</summary>
<code>
```typescript
// src/store/presence.ts - Zustand slice for real-time presence, cursors, editing, and previews.

import { type StateCreator } from "zustand";
import type {
  CanvasStoreState,
  PresenceSlice,
  PeerPresence,
  CursorState,
  EditingState,
  PreviewState,
} from "@/store/types";

const TTL_DEFAULT_MS = 800;

function prunePresenceEntries<T extends { at: number }>(
  map: Record<string, T>,
  cutoff: number
) {
  for (const [key, value] of Object.entries(map)) {
    if (value.at < cutoff) {
      delete map[key];
    }
  }
}

export const createPresenceSlice: StateCreator<
  CanvasStoreState,
  [["zustand/immer", never]],
  [],
  PresenceSlice
> = (set) => ({
  peers: {},
  cursors: {},
  editing: {},
  previews: {},
  hydratePeers: (peers: Record<string, PeerPresence>) => {
    set((state) => {
      state.peers = peers;
    });
  },
  hydrateCursors: (cursors: Record<string, CursorState>) => {
    set((state) => {
      state.cursors = cursors;
    });
  },
  hydrateEditing: (editing: EditingState) => {
    set((state) => {
      state.editing = editing;
    });
  },
  hydratePreviews: (previews: PreviewState) => {
    set((state) => {
      state.previews = previews;
    });
  },
  pruneByTTL: (ttlMs: number = TTL_DEFAULT_MS, now = Date.now()) => {
    const cutoff = now - ttlMs;
    set((state) => {
      prunePresenceEntries(state.peers, cutoff);
      prunePresenceEntries(state.cursors, cutoff);
      for (const [objectId, editors] of Object.entries(state.editing)) {
        prunePresenceEntries(editors, cutoff);
        if (!Object.keys(editors).length) {
          delete state.editing[objectId];
        }
      }
      prunePresenceEntries(state.previews, cutoff);
    });
  },
  resetPresence: () =>
    set({
      peers: {},
      cursors: {},
      editing: {},
      previews: {},
    }),
});
```

**State Shape:**
- `peers: Record<string, PeerPresence>` - Maps user IDs to peer presence data
- `cursors: Record<string, CursorState>` - Maps user IDs to cursor positions and tools
- `editing: Record<string, Record<string, EditingStateEntry>>` - Maps object IDs to editing state by user
- `previews: Record<string, PreviewStateEntry>` - Maps object IDs to preview state
- Default values: peers={}, cursors={}, editing={}, previews={}

**Actions:**
- `hydratePeers(peers: Record<string, PeerPresence>)` - Sets all peer presence data
- `hydrateCursors(cursors: Record<string, CursorState>)` - Sets all cursor data
- `hydrateEditing(editing: EditingState)` - Sets all editing state
- `hydratePreviews(previews: PreviewState)` - Sets all preview data
- `pruneByTTL(ttlMs: number = 800, now?: number)` - Removes stale entries older than TTL
- `resetPresence()` - Clears all presence state

**Middleware:**
- `zustand/immer` - Uses Immer for immutable state updates

**Dependencies:**
- No dependencies on other slices

**Notes:**
- TTL-based cleanup removes entries older than 800ms by default
- EditingState structure: Record<string, Record<string, EditingStateEntry>> where outer key is objectId, inner key is userId
- PreviewStateEntry structure: { by: string, seq: number, at: number, props: Partial<CanvasObject["props"]> }
- PeerPresence structure: { userId: string, name: string, color: string, at: number }
- CursorState structure: { userId: string, x: number, y: number, tool: CanvasTool, at: number }
</code>
</details>

### undo.ts
<details>
<summary>Summary</summary>
<code>
```typescript
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
```

**State Shape:**
- `history: CanvasOperation[]` - Array of operations for undo/redo
- `pointer: number` - Current position in history array
- Default values: history=[], pointer=-1

**Actions:**
- `push(operation: CanvasOperation)` - Adds operation to history and truncates future operations
- `undo()` - Returns previous operation and moves pointer back, returns null if no more operations
- `redo()` - Returns next operation and moves pointer forward, returns null if at end
- `clearHistory()` - Clears history and resets pointer

**Computed/Derived State:**
- `canUndo()` - Returns true if pointer >= 0
- `canRedo()` - Returns true if pointer < history.length - 1

**Middleware:**
- `zustand/immer` - Uses Immer for immutable state updates

**Dependencies:**
- No dependencies on other slices

**Notes:**
- Maximum history size is 100 operations
- Uses immer middleware for state updates
- CanvasOperation types: { type: "create"; objects: CanvasObject[] }, { type: "delete"; objects: CanvasObject[] }, { type: "update"; entries: UpdateOperationEntry[] }
</code>
</details>

### index.ts
<details>
<summary>Summary</summary>
<code>
```typescript
// src/store/index.ts - Main Zustand store setup, provider, and hook for canvas state management.

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
  return useStore(store, selector);
}

export { createCanvasStore };
```

**Store Composition:**
- Combines all slices (objects, ui, presence, undo) using Zustand's immer middleware
- Uses React Context for store provider pattern
- Singleton store instance per provider using useRef

**Middleware:**
- `zustand/immer` - Applied to entire store for immutable updates across all slices

**Dependencies:**
- All slices are combined into single store, no cross-slice dependencies in slice definitions
- Slices are independent and can be used in isolation

**Notes:**
- Store is created once per provider instance
- useCanvasStore hook provides typed selector-based access to store
- Supports optional equality function for performance optimization
</code>
</details>

## Hooks

### useCanvasInteractions.ts
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useMemo } from "react";
import { useCanvasStore } from "@/store";
import { useShapeTransformations } from "@/hooks/useShapeTransformations";
import { useObjectManagement } from "@/hooks/useObjectManagement";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function useCanvasInteractions(canvasId: string, userId: string) {
  const tool = useCanvasStore((s) => s.tool);
  const selectedIds = useCanvasStore((s) => s.selectedIds);

  // Compose sub-hooks
  const shapeTransforms = useShapeTransformations(canvasId, userId);
  const objectManagement = useObjectManagement(canvasId, userId);

  // Wrap handlers to include tool and selection logic
  const getObjectHandlers = useMemo(
    () => (object: any) => {
      const baseHandlers = shapeTransforms.getObjectHandlers(object);
      return {
        ...baseHandlers,
        onMouseDown: (e: any) => {
          if (tool !== "select") return;
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          if (!selectedIds.includes(object.id)) {
            (useCanvasStore as any).getState().setSelectedIds([object.id]);
          }
          shapeTransforms.beginTransform(object, pointer, "move");
        },
      };
    },
    [tool, selectedIds, shapeTransforms]
  );

  const keyboardShortcuts = useKeyboardShortcuts(
    objectManagement.duplicateSelected,
    objectManagement.onDeleteSelected
  );

  return useMemo(
    () => ({
      createRect: objectManagement.createRect,
      createCircle: objectManagement.createCircle,
      getObjectHandlers,
      onDeleteSelected: objectManagement.onDeleteSelected,
      duplicateSelected: objectManagement.duplicateSelected,
      handleKeyDown: keyboardShortcuts.handleKeyDown,
      beginTransform: shapeTransforms.beginTransform,
      updateTransform: shapeTransforms.updateTransform,
      endTransform: shapeTransforms.endTransform,
    }),
    [
      objectManagement.createRect,
      objectManagement.createCircle,
      getObjectHandlers,
      objectManagement.onDeleteSelected,
      objectManagement.duplicateSelected,
      keyboardShortcuts.handleKeyDown,
      shapeTransforms.beginTransform,
      shapeTransforms.updateTransform,
      shapeTransforms.endTransform,
    ]
  );
}
```

**Imports:**
- Zustand store slices: tool, selectedIds
- Sub-hooks: useShapeTransformations, useObjectManagement, useKeyboardShortcuts

**Core Logic Structure:**
- Composes multiple sub-hooks for different interaction types
- Wraps shape transformation handlers with tool and selection logic
- Provides memoized handlers and functions for canvas interactions

**State Reading:**
- `tool` - Current selected tool from UI slice
- `selectedIds` - Currently selected object IDs from UI slice

**State Updates:**
- `setSelectedIds([object.id])` - Updates selected IDs when clicking objects in select mode

**Dependencies:**
- Depends on useShapeTransformations, useObjectManagement, and useKeyboardShortcuts hooks
- Uses Zustand store for tool and selection state

**Notes:**
- Composes complex interactions from simpler sub-hooks
- Tool-specific logic (only handles object selection when tool is "select")
- Memoized return object for performance optimization
</code>
</details>

### useCanvasSubscriptions.ts
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/store";
import { subscribeObjects } from "@/lib/fsClient";
import {
  subscribePresence,
  subscribeCursors,
  subscribeEditing,
  subscribePreviews,
  publishPresence,
} from "@/lib/rtdbClient";
import { auth } from "@/lib/firebase";
import type { CanvasObject } from "@/lib/types";

const SNAPSHOT_DEBOUNCE_MS = 16; // per architecture (16–33ms)

export function useCanvasSubscriptions(canvasId: string) {
  const upsertMany = useCanvasStore((s) => s.upsertMany);
  const resetObjects = useCanvasStore((s) => s.resetObjects);
  const hydratePeers = useCanvasStore((s) => s.hydratePeers);
  const hydrateCursors = useCanvasStore((s) => s.hydrateCursors);
  const hydrateEditing = useCanvasStore((s) => s.hydrateEditing);
  const hydratePreviews = useCanvasStore((s) => s.hydratePreviews);
  const pruneByTTL = useCanvasStore((s) => s.pruneByTTL);

  const bufferRef = useRef<CanvasObject[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function flush() {
      if (bufferRef.current && bufferRef.current.length) {
        upsertMany(bufferRef.current);
        bufferRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    const unsubscribe = subscribeObjects({
      canvasId,
      onChange(objects) {
        bufferRef.current = objects;
        if (timerRef.current) return;
        timerRef.current = setTimeout(flush, SNAPSHOT_DEBOUNCE_MS);
      },
    });

    return () => {
      unsubscribe?.();
      if (timerRef.current) clearTimeout(timerRef.current);
      bufferRef.current = null;
      timerRef.current = null;
      resetObjects();
    };
  }, [canvasId, upsertMany, resetObjects]);

  // Presence, cursors, editing, previews
  useEffect(() => {
    const u1 = subscribePresence(canvasId, hydratePeers);
    const u2 = subscribeCursors(canvasId, hydrateCursors);
    const u3 = subscribeEditing(canvasId, hydrateEditing);
    const u4 = subscribePreviews(canvasId, hydratePreviews);

    const ttl = setInterval(() => pruneByTTL(600), 600);

    // publish my presence
    const u = auth.currentUser;
    if (u) {
      // assign stable color from uid hash
      const colors = ["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899"]; // red, amber, green, blue, violet, pink
      let hash = 0; for (let i=0;i<u.uid.length;i++){ hash = ((hash<<5)-hash) + u.uid.charCodeAt(i); hash |= 0; }
      const color = colors[Math.abs(hash) % colors.length];
      publishPresence(canvasId, u.uid, {
        userId: u.uid,
        name: u.displayName || u.email || "User",
        color,
        at: Date.now(),
      });
    }

    return () => {
      u1?.(); u2?.(); u3?.(); u4?.();
      clearInterval(ttl);
    };
  }, [canvasId, hydrateCursors, hydrateEditing, hydratePeers, hydratePreviews, pruneByTTL]);
}
```

**Imports:**
- Zustand store slices: upsertMany, resetObjects, hydratePeers, hydrateCursors, hydrateEditing, hydratePreviews, pruneByTTL
- Firebase clients: subscribeObjects, subscribePresence, subscribeCursors, subscribeEditing, subscribePreviews, publishPresence
- Firebase auth: auth
- Types: CanvasObject

**Core Logic Structure:**
- Subscribes to Firestore objects collection with debounced updates (16ms)
- Subscribes to RTDB presence, cursors, editing, and preview streams
- Publishes user presence with stable color assignment
- Sets up TTL-based cleanup for stale presence data

**Firestore Involvement:**
- `subscribeObjects` - Subscribes to objects collection, receives full snapshots
- Debounced updates with 16ms delay to prevent flicker during rapid changes

**RTDB Involvement:**
- `subscribePresence` - Real-time peer presence updates
- `subscribeCursors` - Real-time cursor position updates
- `subscribeEditing` - Real-time editing state updates
- `subscribePreviews` - Real-time preview updates
- `publishPresence` - Publishes current user presence

**Local State Interaction:**
- `upsertMany` - Updates objects in Zustand store
- `resetObjects` - Clears all objects on unmount
- `hydratePeers` - Updates peer presence state
- `hydrateCursors` - Updates cursor positions
- `hydrateEditing` - Updates editing state
- `hydratePreviews` - Updates preview state
- `pruneByTTL` - Removes stale presence data every 600ms

**Throttling/Debouncing:**
- Firestore snapshot updates debounced to 16ms
- Presence TTL cleanup runs every 600ms

**Cleanup Logic:**
- Unsubscribes from all Firebase listeners on unmount
- Clears timeout timers
- Resets objects state
- Automatic onDisconnect cleanup via RTDB

**Notes:**
- Presence color assignment uses deterministic hash of user ID
- Cleanup interval (600ms) vs default TTL (800ms) provides buffer time
- Buffer-based object updates prevent excessive re-renders
</code>
</details>

### useKeyboardShortcuts.ts
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useCallback } from "react";
import { useUndoManager } from "@/hooks/useUndoManager";

export function useKeyboardShortcuts(
  onDuplicate: () => Promise<void>,
  onDelete: () => Promise<void>
) {
  const undoManager = useUndoManager();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        void onDuplicate();
        return;
      }
      if (isMeta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          undoManager.redo();
        } else {
          undoManager.undo();
        }
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        void onDelete();
      }
    },
    [onDuplicate, onDelete, undoManager]
  );

  return {
    handleKeyDown,
  };
}
```

**Imports:**
- Sub-hooks: useUndoManager
- No direct store imports

**Core Logic Structure:**
- Handles keyboard shortcuts for common canvas operations
- Supports platform-specific modifier keys (Cmd/Ctrl)

**State Reading:**
- No direct state reading, uses passed callback functions

**State Updates:**
- No direct state updates, calls provided callback functions

**Dependencies:**
- Depends on useUndoManager hook for undo/redo operations
- Depends on provided callback functions for duplicate/delete operations

**Notes:**
- Handles Cmd+D (duplicate), Cmd+Z/Cmd+Shift+Z (undo/redo), Delete/Backspace (delete)
- Uses void operator for fire-and-forget async operations
- Supports both Cmd and Ctrl modifiers for cross-platform compatibility
</code>
</details>

### useShapeTransformations.ts
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useCallback, useRef } from "react";
import { useCanvasStore } from "@/store";
import { commitObject } from "@/lib/fsClient";
import { publishEditing, publishPreview } from "@/lib/rtdbClient";
import { calculateTransformProps, now, PreviewThrottler } from "@/lib/transformUtils";
import { useUndoManager } from "@/hooks/useUndoManager";
import type { CanvasObject } from "@/lib/types";
import type { UpdateOperationEntry } from "@/store/types";

export function useShapeTransformations(canvasId: string, userId: string) {
  const beginLocalIntent = useCanvasStore((s) => s.beginLocalIntent);
  const updateLocalIntent = useCanvasStore((s) => s.updateLocalIntent);
  const endLocalIntent = useCanvasStore((s) => s.endLocalIntent);
  const selectedIds = useCanvasStore((s) => s.selectedIds);

  const transformStateRef = useRef<{
    activeId: string | null;
    mode: "move" | "resize";
    initialVersion: number;
    dragOffset: { dx: number; dy: number };
    baseProps: CanvasObject["props"];
  }>({
    activeId: null,
    mode: "move",
    initialVersion: 0,
    dragOffset: { dx: 0, dy: 0 },
    baseProps: { x: 0, y: 0 },
  });

  const throttlerRef = useRef(new PreviewThrottler());
  const undoManager = useUndoManager();

  const beginTransform = useCallback(
    (object: CanvasObject, pointer: { x: number; y: number } | null, mode: "move" | "resize") => {
      const baseProps = { ...object.props };
      const dragOffset =
        mode === "move" && pointer
          ? {
              dx: (object.props.x ?? 0) - pointer.x,
              dy: (object.props.y ?? 0) - pointer.y,
            }
          : { dx: 0, dy: 0 };

      transformStateRef.current = {
        activeId: object.id,
        mode,
        initialVersion: object.v,
        dragOffset,
        baseProps,
      };
      throttlerRef.current.resetSeq();
      beginLocalIntent(object.id, { kind: mode, props: {}, seq: 0 });
      publishEditing(canvasId, object.id, userId, true);
    },
    [beginLocalIntent, canvasId, userId]
  );

  const updateTransform = useCallback(
    (objectId: string, props: Partial<CanvasObject["props"]>) => {
      const state = transformStateRef.current;
      if (!state.activeId || state.activeId !== objectId) return;

      if (throttlerRef.current.shouldThrottle()) return;

      const selectedObjects = selectedIds
        .map((id) => (useCanvasStore as any).getState().objects[id])
        .filter(Boolean) as CanvasObject[];

      const nextPropsById: Record<string, Partial<CanvasObject["props"]>> = {};
      selectedObjects.forEach((current) => {
        const base = current.id === objectId ? state.baseProps : current.props;
        nextPropsById[current.id] = { ...base, ...props };
        updateLocalIntent(current.id, { props: nextPropsById[current.id] });
      });

      publishPreview(canvasId, objectId, {
        by: userId,
        seq: throttlerRef.current.getSeq(),
        at: now(),
        props: nextPropsById[objectId] || {},
      });
    },
    [canvasId, selectedIds, updateLocalIntent, userId]
  );

  const endTransform = useCallback(
    async (objectId: string, objectsSnapshot: CanvasObject[]) => {
      const state = transformStateRef.current;
      if (!state.activeId) return;

      transformStateRef.current = { ...state, activeId: null };
      endLocalIntent(objectId);
      publishEditing(canvasId, objectId, userId, false);

      publishPreview(canvasId, objectId, {
        by: userId,
        seq: throttlerRef.current.getSeq(),
        at: now(),
        props: {},
      });

      const nextPropsById: Record<string, Partial<CanvasObject["props"]>> = {};
      objectsSnapshot.forEach((current) => {
        if (current.id === objectId) {
          nextPropsById[current.id] = calculateTransformProps(current, { x: 0, y: 0 }, state.dragOffset, state.baseProps); // Simplified for end
        }
      });

      const entries = objectsSnapshot
        .map((object) => {
          const deltas = nextPropsById[object.id];
          if (!deltas || !Object.keys(deltas).length) return null;
          return { object, nextProps: deltas };
        })
        .filter(Boolean) as { object: CanvasObject; nextProps: Partial<CanvasObject["props"]> }[];

      const undoEntries: UpdateOperationEntry[] = entries.map(({ object, nextProps }) => ({
        id: object.id,
        before: state.baseProps,
        after: nextProps,
      }));

      try {
        await Promise.all(
          entries.map(async ({ object, nextProps }) => {
            await commitObject({
              canvasId,
              objectId: object.id,
              expectedVersion: object.v,
              patch: nextProps,
              userId,
            });
          })
        );
        if (undoEntries.length > 0) {
          undoManager.pushUpdate(undoEntries);
        }
      } catch (error) {
        console.error("Transform commit failed:", error);
      }
    },
    [canvasId, endLocalIntent, userId, undoManager]
  );

  const getObjectHandlers = useCallback(
    (object: CanvasObject) => {
      return {
        listening: true,
        onMouseDown: (e: any) => {
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          beginTransform(object, pointer, "move");
        },
        onMouseMove: (e: any) => {
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          updateTransform(object.id, pointer);
        },
        onMouseUp: async (e: any) => {
          const state = transformStateRef.current;
          if (!state.activeId) return;
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) {
            transformStateRef.current.activeId = null;
            return;
          }
          const objectsSnapshot = [object]; // Simplified; in full impl, get from store
          await endTransform(object.id, objectsSnapshot);
        },
      } as const;
    },
    [beginTransform, updateTransform, endTransform]
  );

  return {
    beginTransform,
    updateTransform,
    endTransform,
    getObjectHandlers,
  };
}
```

**Imports:**
- Zustand store slices: beginLocalIntent, updateLocalIntent, endLocalIntent, selectedIds
- Firebase clients: commitObject, publishEditing, publishPreview
- Utilities: calculateTransformProps, now, PreviewThrottler
- Sub-hooks: useUndoManager
- Types: CanvasObject, UpdateOperationEntry

**Core Logic Structure:**
- Manages object transformation state (move/resize) with optimistic updates
- Handles pointer events for dragging objects
- Publishes preview updates during transformation
- Commits final changes to Firestore with version control
- Maintains transformation state across multiple objects

**Firestore Involvement:**
- `commitObject` - Commits final object changes with version check
- Uses transaction with expectedVersion to prevent conflicts

**RTDB Involvement:**
- `publishEditing` - Publishes editing state (true when starting, false when ending)
- `publishPreview` - Publishes throttled preview updates during transformation

**Local State Interaction:**
- `beginLocalIntent` - Sets local intent for immediate UI feedback
- `updateLocalIntent` - Updates local intent during transformation
- `endLocalIntent` - Clears local intent when transformation ends

**Throttling/Debouncing:**
- `PreviewThrottler` - Throttles preview updates to prevent excessive RTDB writes
- Uses sequence numbers to handle out-of-order updates

**Text Editing/Selection/Undo Interactions:**
- Integrates with undo manager for transformation operations
- Creates undo entries for successful transformations

**State Management:**
- Uses refs for transformation state and throttler to avoid re-renders
- Maintains selected object state for multi-select transformations

**Notes:**
- Supports both move and resize operations
- Handles multi-object transformations when objects are selected
- Uses version-based conflict resolution for Firestore commits
- Preview throttling prevents bandwidth abuse during rapid pointer movements
</code>
</details>

### useObjectManagement.ts
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useCallback } from "react";
import { useCanvasStore } from "@/store";
import { createObject, deleteObjects } from "@/lib/fsClient";
import { generateObjectId } from "@/lib/utils";
import { now } from "@/lib/transformUtils";
import { useToast } from "@/hooks/use-toast";
import { useUndoManager } from "@/hooks/useUndoManager";
import type { CanvasObject } from "@/lib/types";

export function useObjectManagement(canvasId: string, userId: string) {
  const upsertMany = useCanvasStore((s) => s.upsertMany);
  const setTool = useCanvasStore((s) => s.setTool);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const selectedIds = useCanvasStore((s) => s.selectedIds);

  const { toast } = useToast();
  const undoManager = useUndoManager();

  const createAndSelect = useCallback(
    async (object: CanvasObject) => {
      upsertMany([object]);
      await createObject({ canvasId, object });
      setTool("select");
      setSelectedIds([object.id]);
    },
    [canvasId, setSelectedIds, setTool, upsertMany]
  );

  const createRect = useCallback(
    async (x: number, y: number, w = 120, h = 80) => {
      const id = generateObjectId();
      const object: CanvasObject = {
        id,
        type: "rect",
        props: { x, y, w, h },
        v: 0,
        updatedBy: userId,
        updatedAt: now(),
      };
      await createAndSelect(object);
    },
    [createAndSelect, userId]
  );

  const createCircle = useCallback(
    async (x: number, y: number, r = 40) => {
      const id = generateObjectId();
      const object: CanvasObject = {
        id,
        type: "circle",
        props: { x, y, r },
        v: 0,
        updatedBy: userId,
        updatedAt: now(),
      };
      await createAndSelect(object);
    },
    [createAndSelect, userId]
  );

  const onDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    const state = (useCanvasStore as any).getState();
    const objectsToDelete = selectedIds
      .map((id) => state.objects[id])
      .filter((obj): obj is CanvasObject => Boolean(obj));
    if (!objectsToDelete.length) return;

    if (objectsToDelete.length > 25) {
      toast({
        title: "Delete many objects",
        description: `Deleting ${objectsToDelete.length} objects — confirm in toolbar.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteObjects({ canvasId, objectIds: selectedIds });
      undoManager.pushDelete(objectsToDelete);
    } catch (err) {
      console.error("deleteObjects failed", err);
      toast({
        title: "Delete failed",
        description: "We couldn't delete the selected objects. Try again.",
        variant: "destructive",
      });
    }
  }, [canvasId, selectedIds, toast, undoManager]);

  const duplicateSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    const state = (useCanvasStore as any).getState();
    const objectsToDuplicate = selectedIds
      .map((id) => state.objects[id])
      .filter((obj): obj is CanvasObject => Boolean(obj));

    if (!objectsToDuplicate.length) return;

    const clones = objectsToDuplicate.map((object) => ({
      ...object,
      id: generateObjectId(),
      props: {
        ...object.props,
        x: (object.props.x ?? 0) + 24,
        y: (object.props.y ?? 0) + 24,
      },
      v: 0,
      updatedBy: userId,
      updatedAt: now(),
    }));

    try {
      await Promise.all(clones.map((object) => createObject({ canvasId, object })));
      upsertMany(clones);
      setSelectedIds(clones.map((object) => object.id));
      undoManager.pushCreate(clones);
    } catch (err) {
      console.error("duplicateObjects failed", err);
      toast({
        title: "Duplicate failed",
        description: "We couldn't duplicate the selected objects. Try again.",
        variant: "destructive",
      });
    }
  }, [canvasId, selectedIds, setSelectedIds, upsertMany, toast, undoManager, userId]);

  return {
    createRect,
    createCircle,
    onDeleteSelected,
    duplicateSelected,
  };
}
```

**Imports:**
- Zustand store slices: upsertMany, setTool, setSelectedIds, selectedIds
- Firebase clients: createObject, deleteObjects
- Utilities: generateObjectId, now
- UI hooks: useToast
- Sub-hooks: useUndoManager
- Types: CanvasObject

**Core Logic Structure:**
- Manages object creation, deletion, and duplication operations
- Handles optimistic updates and server persistence
- Integrates with undo system for all operations

**Firestore Involvement:**
- `createObject` - Creates new objects in Firestore
- `deleteObjects` - Deletes objects from Firestore

**RTDB Involvement:**
- No direct RTDB interaction

**Local State Interaction:**
- `upsertMany` - Updates local object state
- `setTool` - Switches to select tool after creation
- `setSelectedIds` - Selects newly created objects

**Undo/Redo Interactions:**
- `undoManager.pushDelete` - Records delete operations for undo
- `undoManager.pushCreate` - Records create operations for undo

**Error Handling:**
- Toast notifications for user feedback on operation failures
- Batch size limit (25 objects) for delete operations

**Notes:**
- Creates objects with version 0 for new objects
- Duplicates objects with 24px offset for visual distinction
- Validates object existence before operations
- Supports both rectangle and circle creation
</code>
</details>

### useUndoManager.ts
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useCallback, useMemo } from "react";
import { useCanvasStore } from "@/store";
import type { CanvasObject } from "@/lib/types";
import { createObject, deleteObjects, commitObject } from "@/lib/fsClient";
import { useToast } from "@/hooks/use-toast";
import type { CanvasOperation, UpdateOperationEntry } from "@/store/types";
import { useCanvasId } from "@/context/CanvasContext";
import { auth } from "@/lib/firebase";

interface UndoManagerApi {
  pushCreate: (objects: CanvasObject[]) => void;
  pushDelete: (objects: CanvasObject[]) => void;
  pushUpdate: (entries: UpdateOperationEntry[]) => void;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  canUndo: boolean;
  canRedo: boolean;
}

function cloneObject(object: CanvasObject): CanvasObject {
  return {
    ...object,
    props: { ...object.props },
  };
}

function cloneEntries(entries: UpdateOperationEntry[]): UpdateOperationEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    before: { ...entry.before },
    after: { ...entry.after },
  }));
}

export function useUndoManager(): UndoManagerApi {
  const canvasId = useCanvasId();
  const userId = auth.currentUser?.uid || "anon";
  const { toast } = useToast();

  const push = useCanvasStore((s) => s.push);
  const storeUndo = useCanvasStore((s) => s.undo);
  const storeRedo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.canUndo());
  const canRedo = useCanvasStore((s) => s.canRedo());
  const upsertMany = useCanvasStore((s) => s.upsertMany);
  const removeMany = useCanvasStore((s) => s.removeMany);

  const applyDelete = useCallback(async (objects: CanvasObject[]) => {
    if (!objects.length) return;
    const ids = objects.map((obj) => obj.id);
    removeMany(ids);
    try {
      await deleteObjects({ canvasId, objectIds: ids });
    } catch (error) {
      console.error("Failed to delete objects during undo/redo", error);
      toast({
        title: "Delete failed",
        description: "We couldn't delete objects. Please try again.",
        variant: "destructive",
      });
    }
  }, [canvasId, removeMany, toast]);

  const applyCreate = useCallback(async (objects: CanvasObject[]) => {
    if (!objects.length) return;
    upsertMany(objects);
    await Promise.all(objects.map(async (object) => {
      try {
        await createObject({ canvasId, object });
      } catch (error) {
        console.error("Failed to create object during undo/redo", error);
        toast({
          title: "Create failed",
          description: "We couldn't restore objects. Please try again.",
          variant: "destructive",
        });
      }
    }));
  }, [canvasId, upsertMany, toast]);

  const applyUpdate = useCallback(async (entries: UpdateOperationEntry[], useAfter: boolean) => {
    if (!entries.length) return;
    const state = (useCanvasStore as any).getState();
    const patches = entries.map((entry) => ({
      id: entry.id,
      patch: useAfter ? entry.after : entry.before,
    }));

    const optimisticObjects: CanvasObject[] = [];
    for (const { id, patch } of patches) {
      if (!Object.keys(patch).length) continue;
      const current = state.objects[id];
      if (!current) continue;
      optimisticObjects.push({
        ...current,
        props: {
          ...current.props,
          ...patch,
        },
        updatedBy: userId,
        updatedAt: Date.now(),
      });
    }

    if (optimisticObjects.length) {
      state.upsertMany(optimisticObjects);
    }

    await Promise.all(patches.map(async ({ id, patch }) => {
      if (!Object.keys(patch).length) return;
      const latest = (useCanvasStore as any).getState().objects[id];
      if (!latest) return;
      try {
        await commitObject({
          canvasId,
          objectId: id,
          expectedVersion: latest.v,
          patch,
          userId,
        });
      } catch (error) {
        console.error("Failed to apply update during undo/redo", error);
        toast({
          title: "Update failed",
          description: "We couldn't update object state. Please retry.",
          variant: "destructive",
        });
      }
    }));
  }, [canvasId, toast, userId]);

  const pushCreate = useCallback((objects: CanvasObject[]) => {
    if (!objects.length) return;
    push({ type: "create", objects: objects.map(cloneObject) });
  }, [push]);

  const pushDelete = useCallback((objects: CanvasObject[]) => {
    if (!objects.length) return;
    push({ type: "delete", objects: objects.map(cloneObject) });
  }, [push]);

  const pushUpdate = useCallback((entries: UpdateOperationEntry[]) => {
    if (!entries.length) return;
    push({ type: "update", entries: cloneEntries(entries) });
  }, [push]);

  const undo = useCallback(async () => {
    const operation = storeUndo();
    if (!operation) return false;

    switch (operation.type) {
      case "create":
        await applyDelete(operation.objects);
        break;
      case "delete":
        await applyCreate(operation.objects);
        break;
      case "update":
        await applyUpdate(operation.entries, false);
        break;
      default:
        break;
    }
    return true;
  }, [applyCreate, applyDelete, applyUpdate, storeUndo]);

  const redo = useCallback(async () => {
    const operation = storeRedo();
    if (!operation) return false;

    switch (operation.type) {
      case "create":
        await applyCreate(operation.objects);
        break;
      case "delete":
        await applyDelete(operation.objects);
        break;
      case "update":
        await applyUpdate(operation.entries, true);
        break;
      default:
        break;
    }
    return true;
  }, [applyCreate, applyDelete, applyUpdate, storeRedo]);

  return useMemo(
    () => ({
      pushCreate,
      pushDelete,
      pushUpdate,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [canRedo, canUndo, pushCreate, pushDelete, pushUpdate, redo, undo]
  );
}
```

**Imports:**
- Zustand store slices: push, storeUndo, storeRedo, canUndo, canRedo, upsertMany, removeMany
- Firebase clients: createObject, deleteObjects, commitObject
- UI hooks: useToast
- Context: useCanvasId
- Firebase: auth
- Types: CanvasObject, CanvasOperation, UpdateOperationEntry

**Core Logic Structure:**
- Provides undo/redo functionality for canvas operations
- Handles create, delete, and update operations
- Applies operations both locally and to Firestore

**Firestore Involvement:**
- `createObject` - Creates objects during redo operations
- `deleteObjects` - Deletes objects during undo/redo operations
- `commitObject` - Updates object properties during undo/redo operations

**RTDB Involvement:**
- No direct RTDB interaction

**Local State Interaction:**
- `upsertMany` - Updates local object state during operations
- `removeMany` - Removes objects from local state
- `push` - Records operations in undo history

**Undo/Redo Interactions:**
- `storeUndo` - Gets next undo operation from store
- `storeRedo` - Gets next redo operation from store
- `canUndo` - Computed state for whether undo is available
- `canRedo` - Computed state for whether redo is available

**Error Handling:**
- Toast notifications for operation failures
- Continues operation even if individual Firestore writes fail

**Notes:**
- Supports create, delete, and update operation types
- Deep clones objects and entries for history storage
- Applies optimistic updates before Firestore persistence
- Handles version conflicts during undo/redo operations
</code>
</details>

## Firebase Integration

### fsClient.ts
<details>
<summary>Summary</summary>
<code>
```typescript
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  writeBatch,
  serverTimestamp,
  setDoc,
  type SnapshotOptions,
  type FirestoreError,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  canvasObjectPatchSchema,
  canvasObjectSchema,
  parseCanvasObjectDoc,
  type CanvasObject,
} from "@/lib/validators";

type Unsubscribe = () => void;

export class CommitVersionMismatchError extends Error {
  constructor(public readonly currentVersion: number) {
    super("Canvas object version mismatch");
    this.name = "CommitVersionMismatchError";
  }
}

export class CommitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommitValidationError";
  }
}

export interface CommitObjectOptions {
  canvasId: string;
  objectId: string;
  expectedVersion: number;
  patch: unknown;
  userId: string;
}

export async function commitObject({
  canvasId,
  objectId,
  expectedVersion,
  patch,
  userId,
}: CommitObjectOptions) {
  const parsedPatch = canvasObjectPatchSchema.safeParse(patch);
  if (!parsedPatch.success) {
    throw new CommitValidationError(parsedPatch.error.message);
  }

  const objectRef = doc(db, "canvases", canvasId, "objects", objectId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(objectRef);
    if (!snapshot.exists()) {
      throw new CommitValidationError("Object does not exist");
    }
    const data = parseCanvasObjectDoc(snapshot.id, snapshot.data());
    if (data.v !== expectedVersion) {
      throw new CommitVersionMismatchError(data.v);
    }

    transaction.update(objectRef, {
      props: { ...data.props, ...parsedPatch.data },
      v: data.v + 1,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    });
  });
}

export interface CreateObjectOptions {
  canvasId: string;
  object: CanvasObject;
}

export async function createObject({ canvasId, object }: CreateObjectOptions) {
  // Validate before write
  const parsed = canvasObjectSchema.safeParse(object);
  if (!parsed.success) {
    throw new CommitValidationError(parsed.error.message);
  }
  const objectRef = doc(db, "canvases", canvasId, "objects", object.id);
  await setDoc(objectRef, { ...parsed.data, updatedAt: serverTimestamp() });
}

export interface DeleteObjectsOptions {
  canvasId: string;
  objectIds: string[];
}

export async function deleteObjects({ canvasId, objectIds }: DeleteObjectsOptions) {
  if (!objectIds.length) return;
  const batch = writeBatch(db);
  for (const id of objectIds) {
    const ref = doc(db, "canvases", canvasId, "objects", id);
    batch.delete(ref);
  }
  await batch.commit();
}

export interface SubscribeObjectsOptions {
  canvasId: string;
  onChange: (objects: CanvasObject[]) => void;
  onError?: (error: FirestoreError) => void;
}

export function subscribeObjects({
  canvasId,
  onChange,
  onError,
}: SubscribeObjectsOptions): Unsubscribe {
  const collectionRef = collection(db, "canvases", canvasId, "objects");
  return onSnapshot(
    collectionRef,
    (snapshot: QuerySnapshot) => {
      try {
        const objects = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data({ serverTimestamps: "estimate" } as SnapshotOptions);
          // Use Timestamp-aware parser to normalize updatedAt → number (ms)
          return parseCanvasObjectDoc(docSnapshot.id, data);
        });
        onChange(objects);
      } catch (error) {
        console.error("Failed to parse canvas objects snapshot", error);
      }
    },
    onError
  );
}
```

**Function Names and Parameters:**
- `commitObject({ canvasId, objectId, expectedVersion, patch, userId })` - Commits object changes with version control
- `createObject({ canvasId, object })` - Creates new object in Firestore
- `deleteObjects({ canvasId, objectIds })` - Deletes multiple objects in batch
- `subscribeObjects({ canvasId, onChange, onError? })` - Subscribes to objects collection changes

**Firestore Paths:**
- Read/Write: `canvases/{canvasId}/objects/{objectId}`
- Subscription: `canvases/{canvasId}/objects` (collection)

**Version Control Logic:**
- Uses `expectedVersion` parameter to check against current `data.v`
- Increments version on successful commit: `v: data.v + 1`
- Throws `CommitVersionMismatchError` if versions don't match

**Data Shapes:**
- Object structure: `{ id, type, props, v, updatedBy, updatedAt }`
- Patch validation using Zod schema `canvasObjectPatchSchema`
- Timestamp handling with `serverTimestamp()` and `parseCanvasObjectDoc`

**Transaction Usage:**
- `runTransaction` for version-controlled updates
- `writeBatch` for bulk delete operations
- Collection subscription with `onSnapshot`

**Error Handling:**
- `CommitVersionMismatchError` - Version conflicts during updates
- `CommitValidationError` - Schema validation failures
- Snapshot parsing errors logged to console

**Notes:**
- All operations are synchronous except subscriptions
- Uses Zod schemas for client and server-side validation
- Timestamp estimation for snapshot queries
- No debouncing or throttling in client functions
</code>
</details>

### rtdbClient.ts
<details>
<summary>Summary</summary>
<code>
```typescript
import {
  ref,
  onValue,
  onDisconnect,
  set,
  remove,
  type DatabaseReference,
} from "firebase/database";
import { rtdb } from "@/lib/firebase";
import type {
  CursorState,
  PeerPresence,
  EditingState,
  PreviewState,
} from "@/store/types";

export type Unsubscribe = () => void;

function scopedRef(path: string): DatabaseReference {
  return ref(rtdb, path);
}

export function subscribeConnectionStatus(
  onChange: (isConnected: boolean) => void,
): Unsubscribe {
  const connectedRef = scopedRef(".info/connected");
  return onValue(connectedRef, (snapshot) => {
    onChange(snapshot.val() === true);
  });
}

export function publishPresence(
  canvasId: string,
  userId: string,
  payload: PeerPresence
) {
  const presenceRef = scopedRef(`canvases/${canvasId}/presence/${userId}`);
  void set(presenceRef, payload);
  onDisconnect(presenceRef).remove();
}

export function publishCursor(
  canvasId: string,
  userId: string,
  payload: CursorState
) {
  const cursorRef = scopedRef(`canvases/${canvasId}/cursors/${userId}`);
  void set(cursorRef, payload);
  onDisconnect(cursorRef).remove();
}

export function publishEditing(
  canvasId: string,
  objectId: string,
  userId: string,
  isEditing: boolean
) {
  const editingRef = scopedRef(
    `canvases/${canvasId}/editing/${objectId}/${userId}`
  );
  if (isEditing) {
    void set(editingRef, { userId, at: Date.now() });
    onDisconnect(editingRef).remove();
  } else {
    void remove(editingRef);
  }
}

export function publishPreview(
  canvasId: string,
  objectId: string,
  payload: PreviewState[string]
) {
  const previewRef = scopedRef(`canvases/${canvasId}/previews/${objectId}`);
  void set(previewRef, payload);
  onDisconnect(previewRef).remove();
}

function subscribeScoped<T>(
  path: string,
  onChange: (value: T) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const target = scopedRef(path);
  return onValue(
    target,
    (snapshot) => {
      onChange((snapshot.val() ?? {}) as T);
    },
    onError
  );
}

export function subscribePresence(
  canvasId: string,
  onChange: (peers: Record<string, PeerPresence>) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/presence`, onChange, onError);
}

export function subscribeCursors(
  canvasId: string,
  onChange: (cursors: Record<string, CursorState>) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/cursors`, onChange, onError);
}

export function subscribeEditing(
  canvasId: string,
  onChange: (editing: EditingState) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/editing`, onChange, onError);
}

export function subscribePreviews(
  canvasId: string,
  onChange: (previews: PreviewState) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/previews`, onChange, onError);
}
```

**Function Names and Parameters:**
- `publishPresence(canvasId, userId, payload)` - Publishes user presence
- `publishCursor(canvasId, userId, payload)` - Publishes cursor position
- `publishEditing(canvasId, objectId, userId, isEditing)` - Publishes editing state
- `publishPreview(canvasId, objectId, payload)` - Publishes object preview
- `subscribePresence(canvasId, onChange, onError?)` - Subscribes to presence updates
- `subscribeCursors(canvasId, onChange, onError?)` - Subscribes to cursor updates
- `subscribeEditing(canvasId, onChange, onError?)` - Subscribes to editing updates
- `subscribePreviews(canvasId, onChange, onError?)` - Subscribes to preview updates
- `subscribeConnectionStatus(onChange)` - Subscribes to connection status

**RTDB Paths:**
- Presence: `canvases/{canvasId}/presence/{userId}`
- Cursors: `canvases/{canvasId}/cursors/{userId}`
- Editing: `canvases/{canvasId}/editing/{objectId}/{userId}`
- Previews: `canvases/{canvasId}/previews/{objectId}`
- Connection: `.info/connected`

**Data Shapes:**
- PeerPresence: `{ userId, name, color, at }`
- CursorState: `{ userId, x, y, tool, at }`
- Editing entry: `{ userId, at }`
- Preview entry: `{ by, seq, at, props }`

**Cleanup Logic:**
- All publish functions use `onDisconnect().remove()` for automatic cleanup
- Editing state explicitly removes when `isEditing` is false

**Subscription Pattern:**
- `subscribeScoped` helper provides generic subscription functionality
- All subscriptions return unsubscribe functions
- Default values handled with `?? {}` for empty snapshots

**Error Handling:**
- Optional error callbacks for subscription functions
- Connection status subscription for network awareness

**Notes:**
- All operations use `void` for fire-and-forget behavior
- No explicit debouncing or throttling in client functions
- Uses Firebase's built-in `onValue` for real-time subscriptions
- Helper function `scopedRef` prefixes paths with RTDB instance
</code>
</details>

### reconciler.ts
<details>
<summary>Summary</summary>
<code>
```typescript
import type { CanvasObject } from "@/lib/types";
import type {
  CanvasStoreState,
  LocalIntentState,
  PreviewState,
} from "@/store/types";

export interface RenderProps {
  object: CanvasObject;
  derivedProps: CanvasObject["props"];
  source: "localIntent" | "preview" | "truth";
}

const DEFAULT_DEBOUNCE_MS = 16;

export function selectRenderProps(
  object: CanvasObject,
  localIntent: LocalIntentState,
  previews: PreviewState
): RenderProps {
  const localEntry = localIntent[object.id];
  if (localEntry) {
    return {
      object,
      derivedProps: {
        ...object.props,
        ...localEntry.props,
      },
      source: "localIntent",
    };
  }

  const preview = previews[object.id];
  if (preview) {
    return {
      object,
      derivedProps: {
        ...object.props,
        ...preview.props,
      },
      source: "preview",
    };
  }

  return {
    object,
    derivedProps: object.props,
    source: "truth",
  };
}

export function applyFirestoreSnapshot(
  state: CanvasStoreState,
  objects: CanvasObject[]
) {
  // Replace objects map to reflect deletions
  state.setAll(objects);
}

export function transformIntentOnTruth(
  objectId: string,
  latestTruth: CanvasObject,
  localIntent: LocalIntentState
) {
  const entry = localIntent[objectId];
  if (!entry) return;
  localIntent[objectId] = {
    ...entry,
    props: {
      ...entry.props,
      // Additional reconciliation can be added here in later tasks
    },
  };
}

export function debounceDuration(): number {
  return DEFAULT_DEBOUNCE_MS;
}
```

**Function Names and Parameters:**
- `selectRenderProps(object, localIntent, previews)` - Determines render properties with priority order
- `applyFirestoreSnapshot(state, objects)` - Applies Firestore snapshot to store state
- `transformIntentOnTruth(objectId, latestTruth, localIntent)` - Reconciles local intent with server truth
- `debounceDuration()` - Returns default debounce duration

**Render Priority Logic:**
- **localIntent** (highest priority) - User's current in-flight changes
- **preview** (medium priority) - Other users' in-flight changes from RTDB
- **truth** (lowest priority) - Firestore snapshot data

**State Management:**
- No direct state updates, provides utility functions for store operations
- `applyFirestoreSnapshot` calls `state.setAll()` to replace all objects

**Data Flow:**
- Render props selection follows priority cascade: localIntent → preview → truth
- Reconciliation function for handling truth updates during local intent

**Debouncing:**
- Exports `DEFAULT_DEBOUNCE_MS = 16` constant for external use

**Notes:**
- Pure utility functions with no side effects
- Render props include source attribution for debugging
- Reconciliation function has placeholder for future implementation
- Designed for integration with Zustand store operations
</code>
</details>

## Canvas Rendering Layer

### CanvasStage.tsx
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Stage as KonvaStageType } from "konva/lib/Stage";
import { ObjectsLayer } from "@/components/ObjectsLayer";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store";
import { useCanvasId } from "@/context/CanvasContext";
import { auth } from "@/lib/firebase";
import { publishCursor } from "@/lib/rtdbClient";
import { useCanvasInteractionsContext } from "@/context/CanvasInteractionsContext";

// Dynamic imports for Konva components to avoid SSR issues
const KonvaLayer = dynamic(() => import("react-konva").then(mod => ({ default: mod.Layer })), { ssr: false });
const KonvaStage = dynamic(() => import("react-konva").then(mod => ({ default: mod.Stage })), { ssr: false });

export interface CanvasStageProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  onStageRef?: (stage: KonvaStageType | null) => void;
}

export function CanvasStage({
  children,
  width,
  height,
  onStageRef,
}: CanvasStageProps) {

  // Container sizing
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<KonvaStageType | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: width ?? 0,
    h: height ?? 0,
  });

  useEffect(() => {
    if (width && height) {
      setSize({ w: width, h: height });
      return;
    }
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [width, height]);

  const handleStageRef = useCallback(
    (node: KonvaStageType | null) => {
      stageRef.current = node;
      onStageRef?.(node);
    },
    [onStageRef]
  );

  // Canvas identity and user context
  const canvasId = useCanvasId();
  const userId = auth.currentUser?.uid || "anon";
  const tool = useCanvasStore((s) => s.tool);
  const { createRect, createCircle, handleKeyDown } = useCanvasInteractionsContext();

  // Pan & Zoom state
  const stagePos = useCanvasStore((s) => s.stagePos);
  const stageScale = useCanvasStore((s) => s.stageScale);
  const setStageTransform = useCanvasStore((s) => s.setStageTransform);
  const isSpaceDownRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") isSpaceDownRef.current = true;
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") isSpaceDownRef.current = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const oldScale = stageScale;
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const newScale = clamp(oldScale * (direction > 0 ? 1 / scaleBy : scaleBy), 0.1, 8);
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStageTransform(newPos, newScale);
  }, [setStageTransform, stagePos.x, stagePos.y, stageScale]);

  const handleMouseDown = useCallback((e: any) => {
    const isMiddle = e.evt?.button === 1;
    if (isMiddle || isSpaceDownRef.current) {
      isPanningRef.current = true;
      const stage = stageRef.current;
      const p = stage?.getPointerPosition();
      lastPointerRef.current = p ? { x: p.x, y: p.y } : null;
    }
  }, []);

  // Throttled cursor publisher
  const lastCursorTsRef = useRef<number>(0);
  const handleMouseMove = useCallback(() => {
    const stage = stageRef.current;
    const p = stage?.getPointerPosition();
    const now = Date.now();
    if (p && canvasId && userId) {
      // publish at ~50ms under motion
      if (now - lastCursorTsRef.current > 50) {
        lastCursorTsRef.current = now;
        publishCursor(canvasId, userId, { userId, x: p.x, y: p.y, tool, at: now });
      }
    }
    if (!isPanningRef.current) return;
    if (!p || !lastPointerRef.current) return;
    const dx = p.x - lastPointerRef.current.x;
    const dy = p.y - lastPointerRef.current.y;
    lastPointerRef.current = { x: p.x, y: p.y };
    setStageTransform({ x: stagePos.x + dx, y: stagePos.y + dy }, stageScale);
  }, [canvasId, setStageTransform, stagePos.x, stagePos.y, stageScale, tool, userId]);

  const endPan = useCallback(() => {
    isPanningRef.current = false;
    lastPointerRef.current = null;
  }, []);

  const cursorClass = isPanningRef.current || isSpaceDownRef.current ? "cursor-grabbing" : "cursor-default";

  const handleStageClick = useCallback(() => {
    if (tool === "rectangle" || tool === "circle") {
      const stage = stageRef.current;
      const p = stage?.getPointerPosition();
      if (!p) return;
      if (tool === "rectangle") void createRect(p.x, p.y);
      if (tool === "circle") void createCircle(p.x, p.y);
    }
  }, [createCircle, createRect, tool]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-1 items-center justify-center",
        "bg-white/80 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%)]",
        "dark:bg-slate-950",
        cursorClass
      )}
    >
      <KonvaStage
        width={size.w}
        height={size.h}
        ref={handleStageRef}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onClick={handleStageClick}
        listening={true}
      >
        <KonvaLayer>{children}</KonvaLayer>
        <ObjectsLayer />
      </KonvaStage>

      {null}
    </div>
  );
}
```

**Zustand Connections:**
- `tool` - Current selected tool from UI slice
- `stagePos` - Canvas position from UI slice
- `stageScale` - Canvas scale from UI slice
- `setStageTransform` - Updates stage position and scale

**Konva Stage Structure:**
- Single `KonvaStage` component with dynamic imports
- Two layers: one for children, one for `ObjectsLayer`
- Stage position and scale applied as props

**Event Handling:**
- `handleWheel` - Zoom with mouse wheel, clamped between 0.1x and 8x
- `handleMouseDown` - Pan initiation with middle mouse or spacebar
- `handleMouseMove` - Panning and throttled cursor publishing
- `handleStageClick` - Object creation when in rectangle/circle tool mode

**Throttling:**
- Cursor publishing throttled to ~50ms intervals during mouse movement

**RTDB Integration:**
- `publishCursor` - Publishes cursor position with user ID and current tool

**Canvas Interactions:**
- Pan with middle mouse button or spacebar + drag
- Zoom with mouse wheel
- Object creation via click when in creation tools

**Notes:**
- Responsive sizing with ResizeObserver for container dimensions
- Keyboard shortcuts for panning (spacebar)
- Visual feedback with cursor classes during panning
- Tool-specific click handling for object creation
</code>
</details>

### PresenceLayer.tsx
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useMemo } from "react";
import { useCanvasStore } from "@/store";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

export function PresenceLayer() {
  const cursors = useCanvasStore((s) => s.cursors);
  const previews = useCanvasStore((s) => s.previews);
  const peers = useCanvasStore((s) => s.peers);
  const stagePos = useCanvasStore((s) => s.stagePos);
  const stageScale = useCanvasStore((s) => s.stageScale);
  const myUserId = auth.currentUser?.uid || null;

  const cursorEntries = useMemo(() => Object.values(cursors), [cursors]);
  const previewEntries = useMemo(() => Object.entries(previews), [previews]);

  if (!cursorEntries.length && !previewEntries.length) {
    return null;
  }

  return (
    <div className="pointer-events-none relative h-full w-full">
      {previewEntries.map(([objectId, preview]) => (
        <div
          key={`preview-${objectId}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-dashed border-slate-400/70 bg-slate-100/40 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-600/70 dark:bg-slate-800/40 dark:text-slate-300"
          style={{
            left: `${preview.props?.x ?? 0}px`,
            top: `${preview.props?.y ?? 0}px`,
          }}
        >
          Preview
        </div>
      ))}

      {cursorEntries.map((cursor) => {
        if (myUserId && cursor.userId === myUserId) return null; // hide my own cursor overlay
        const peer = peers[cursor.userId];
        const label = peer?.name || cursor.userId;
        // Convert stage coordinates to screen space (account for stage transform)
        const screenX = stagePos.x + cursor.x * stageScale;
        const screenY = stagePos.y + cursor.y * stageScale;
        return (
          <div
            key={cursor.userId}
            className={cn(
              "absolute top-0 left-0 flex translate-x-[var(--x)] translate-y-[var(--y)] items-center gap-2",
              "transition-transform duration-75"
            )}
            style={{
              // Using CSS custom properties to avoid re-rendering transforms
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore custom vars
              "--x": `${screenX}px`,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore custom vars
              "--y": `${screenY}px`,
            }}
          >
            {/* Cursor icon with peer color */}
            <svg width="14" height="14" viewBox="0 0 24 24" className="drop-shadow-sm">
              <path d="M3 2l7 18 2-7 7-2z" fill={peer?.color || "#64748b"} stroke="white" strokeWidth="1" />
            </svg>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur"
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                color: "#111827",
                borderRadius: 9999,
                border: "1px solid rgba(203,213,225,0.8)",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

**Zustand Connections:**
- `cursors` - Cursor positions from presence slice
- `previews` - Preview states from presence slice
- `peers` - Peer presence data from presence slice
- `stagePos` - Canvas position for coordinate transformation
- `stageScale` - Canvas scale for coordinate transformation

**Rendering Structure:**
- DOM-based overlay (not Konva) for performance
- Separate rendering for preview indicators and cursor overlays
- Hides own cursor to avoid duplication

**Coordinate Transformation:**
- Converts stage coordinates to screen space using stage position and scale
- Uses CSS custom properties for smooth transitions

**Data Mapping:**
- Maps cursor entries to visual cursor indicators with peer colors
- Maps preview entries to preview indicator overlays
- Shows peer names from presence data

**Performance Optimizations:**
- Memoized cursor and preview entries to prevent unnecessary re-renders
- Early return when no cursors or previews exist
- CSS-based transitions for smooth movement

**Notes:**
- Pure presentation component with no event handling
- Relies entirely on Zustand state for data
- Uses peer colors for visual distinction between users
- Preview indicators show at object positions during transformations
</code>
</details>

### ObjectsLayer.tsx
<details>
<summary>Summary</summary>
<code>
```typescript
"use client";

import { useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useCanvasStore } from "@/store";
import { selectRenderProps } from "@/lib/reconciler";
import { RectObject } from "@/components/RectObject";
import { CircleObject } from "@/components/CircleObject";
import { useCanvasId } from "@/context/CanvasContext";
import { useCanvasInteractionsContext } from "@/context/CanvasInteractionsContext";
import type { CanvasObject } from "@/lib/types";

// Dynamic imports for Konva components to avoid SSR issues
const KonvaLayer = dynamic(() => import("react-konva").then(mod => ({ default: mod.Layer })), { ssr: false });
const KonvaGroup = dynamic(() => import("react-konva").then(mod => ({ default: mod.Group })), { ssr: false });
const KonvaTransformer = dynamic(() => import("react-konva").then(mod => ({ default: mod.Transformer })), { ssr: false });
const KonvaRect = dynamic(() => import("react-konva").then(mod => ({ default: mod.Rect })), { ssr: false });

function ObjectRenderer({ id, registerRef }: { id: string; registerRef: (id: string, node: any | null) => void }) {
  const object = useCanvasStore((s) => s.objects[id]);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const localIntent = useCanvasStore((s) => s.localIntent);
  const previews = useCanvasStore((s) => s.previews);
  const { getObjectHandlers } = useCanvasInteractionsContext();
  const nodeRef = useRef<any>(null);
  useEffect(() => {
    registerRef(id, nodeRef.current);
    return () => registerRef(id, null);
  }, [id, registerRef]);

  if (!object) return null;
  const { derivedProps } = selectRenderProps(object, localIntent, previews);
  const handlers = getObjectHandlers(object);

  if (object.type === "rect") return <RectObject ref={nodeRef} props={derivedProps} {...handlers} />;
  if (object.type === "circle") return <CircleObject ref={nodeRef} props={derivedProps} {...handlers} />;

  return null;
}

export function ObjectsLayer() {
  const objects = useCanvasStore((s) => s.objects);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const localIntent = useCanvasStore((s) => s.localIntent);
  const previews = useCanvasStore((s) => s.previews);
  const { beginTransform, updateTransform, endTransform } = useCanvasInteractionsContext();
  const transformerRef = useRef<any>(null);
  const nodeRefsByIdRef = useRef<Record<string, any>>({});
  const ids = useMemo(() => Object.keys(objects), [objects]);
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    if (selectedIds.length !== 1) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }
    const node = nodeRefsByIdRef.current[selectedIds[0]];
    if (node) {
      transformer.nodes([node]);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  const registerRef = (id: string, node: any | null) => {
    if (!node) {
      delete nodeRefsByIdRef.current[id];
    } else {
      nodeRefsByIdRef.current[id] = node;
    }
  };

  const handleTransformStart = () => {
    if (selectedIds.length !== 1) return;
    const id = selectedIds[0];
    const obj = (useCanvasStore as any).getState().objects[id];
    if (!obj) return;
    beginTransform(obj, null, "resize");
  };

  const handleTransform = () => {
    if (selectedIds.length !== 1) return;
    const id = selectedIds[0];
    const node = nodeRefsByIdRef.current[id];
    if (!node) return;
    if (node.className === "Rect") {
      const minW = 12;
      const minH = 12;
      const width = Math.max(minW, Math.round(node.width() * node.scaleX()));
      const height = Math.max(minH, Math.round(node.height() * node.scaleY()));
      const x = Math.round(node.x());
      const y = Math.round(node.y());
      node.scaleX(1);
      node.scaleY(1);
      updateTransform(id, { x, y, w: width, h: height });
    } else if (node.className === "Circle") {
      const minR = 8;
      const scaled = node.radius() * Math.max(node.scaleX(), node.scaleY());
      const r = Math.max(minR, Math.round(scaled));
      const x = Math.round(node.x());
      const y = Math.round(node.y());
      node.scaleX(1);
      node.scaleY(1);
      updateTransform(id, { x, y, r });
    }
  };

  const handleTransformEnd = async () => {
    if (selectedIds.length !== 1) return;
    const id = selectedIds[0];
    const state = (useCanvasStore as any).getState();
    const obj = state.objects[id];
    if (!obj) return;
    const latest = state.localIntent[id]?.props || {};
    await endTransform(id, [obj]);
  };
  return (
    <KonvaLayer>
      <KonvaGroup listening={true}>
        {ids.map((id) => (
          <ObjectRenderer key={id} id={id} registerRef={registerRef} />
        ))}
        {selectedIds.length === 1 ? (
          <KonvaTransformer
            ref={transformerRef}
            rotateEnabled={false}
            keepRatio={false}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "top-center",
              "bottom-center",
              "middle-left",
              "middle-right",
            ]}
            onTransformStart={handleTransformStart}
            onTransform={handleTransform}
            onTransformEnd={handleTransformEnd}
          />
        ) : null}
        {/* selection overlay rectangles */}
        {ids.map((id) => {
          const obj = objects[id];
          const isSelected = selectedIds.includes(id);
          if (!isSelected || !obj) return null;

          // Use reconciled props for consistent positioning
          const { derivedProps } = selectRenderProps(obj, localIntent, previews);
          const w = obj.type === "circle" ? (derivedProps.r ?? 40) * 2 : (derivedProps.w ?? 100);
          const h = obj.type === "circle" ? (derivedProps.r ?? 40) * 2 : (derivedProps.h ?? 80);

          return (
            <KonvaRect
              key={`sel-${id}`}
              x={derivedProps.x - 4}
              y={derivedProps.y - 4}
              width={w + 8}
              height={h + 8}
              strokeDash={[6, 4]}
              stroke={"#0ea5e9"}
              strokeWidth={1.5}
              listening={false}
            />
          );
        })}
      </KonvaGroup>
    </KonvaLayer>
  );
}
```

**Zustand Connections:**
- `objects` - All canvas objects from objects slice
- `selectedIds` - Currently selected object IDs from UI slice
- `localIntent` - Local intent state from UI slice
- `previews` - Preview states from presence slice

**Konva Layer Structure:**
- Single `KonvaLayer` containing `KonvaGroup` for all objects
- Individual `ObjectRenderer` components for each object
- Single `KonvaTransformer` for selection handles (when one object selected)
- Selection overlay rectangles for visual feedback

**Rendering Pipeline:**
- `ObjectRenderer` sub-components handle individual object rendering
- Uses `selectRenderProps` from reconciler for priority-based prop resolution
- Applies object handlers from interaction context

**useEffect Patterns:**
- Transformer node management based on selection state
- Node ref registration for transformer targeting
- Batch drawing optimization for transformer updates

**Transform Handling:**
- `handleTransformStart` - Initiates resize operations
- `handleTransform` - Updates object dimensions during resize
- `handleTransformEnd` - Finalizes resize and commits to server

**Selection Management:**
- Visual selection overlays with dashed borders
- Transformer handles for resize operations
- Single-selection only for transformation

**Performance Optimizations:**
- Memoized object IDs array
- Ref-based node management to avoid re-renders
- Batch drawing for transformer updates

**Notes:**
- Handles both rectangle and circle object types
- Minimum size constraints for resize operations
- Uses reconciled props for consistent positioning
- Selection overlays positioned relative to reconciled object props
</code>
</details>

## Summary Table

| Area | Main Files | Key Responsibilities | Firestore Involvement | RTDB Involvement | Local State Interaction | Known Performance Risks |
|------|------------|---------------------|----------------------|------------------|------------------------|------------------------|
| **Zustand Store** | objects.ts, ui.ts, presence.ts, undo.ts, index.ts | State management for objects, UI state, presence data, and undo history | No direct involvement | No direct involvement | Store provides single source of truth for all state slices | Large object counts may cause memory issues with frequent updates |
| **Hooks** | useCanvasInteractions.ts, useCanvasSubscriptions.ts, useKeyboardShortcuts.ts, useShapeTransformations.ts, useObjectManagement.ts, useUndoManager.ts | Event handling, Firebase subscriptions, keyboard shortcuts, shape transformations, object management, undo/redo | commitObject, createObject, deleteObjects for persistence | subscribePresence, subscribeCursors, subscribeEditing, subscribePreviews for real-time data; publishPresence, publishCursor, publishEditing, publishPreview for publishing | Read from all Zustand slices, update UI and objects slices | Throttling in transformations may cause UI lag; complex hook composition may be hard to debug |
| **Firebase Integration** | fsClient.ts, rtdbClient.ts, reconciler.ts | Firestore operations, RTDB operations, render prop reconciliation | commitObject (version-controlled updates), createObject, deleteObjects, subscribeObjects (debounced snapshots) | subscribePresence, subscribeCursors, subscribeEditing, subscribePreviews, publishPresence, publishCursor, publishEditing, publishPreview | No direct state interaction | Version conflicts in commitObject may cause operation failures; RTDB subscription overhead |
| **Canvas Rendering** | CanvasStage.tsx, PresenceLayer.tsx, ObjectsLayer.tsx | Konva stage management, presence indicators, object rendering | No direct involvement | publishCursor for cursor positions | Read from UI slice for stage transforms, presence slice for cursors/previews | Coordinate transformations in PresenceLayer may be expensive; ObjectsLayer re-renders on any state change |
| **Overall Architecture** | All files | Hybrid real-time collaborative canvas | Truth storage with version control | Ephemeral signals and presence | Optimistic updates with server reconciliation | Complex state flow may cause inconsistencies; multiple update sources may lead to race conditions |
