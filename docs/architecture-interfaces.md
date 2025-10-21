# Zustand Store Architecture & Interface Documentation

## Core Store Architecture

### `src/store/index.ts` - Main Store Exports

**Primary Exports:**
```typescript
// Store factory function
createCanvasStore(): StoreApi<CanvasStoreState>

// React hook for consuming store
useCanvasStore<T>(
  selector: (state: CanvasStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean
): T

// React provider component
CanvasStoreProvider({
  children: React.ReactNode,
  storeFactory?: CanvasStoreInitializer
})
```

**Dependencies:**
- `createObjectsSlice` - Object CRUD operations
- `createUISlice` - UI state (tools, selections, local intent)
- `createPresenceSlice` - Real-time presence, cursors, editing state
- `createUndoSlice` - Local undo/redo functionality

**Store Composition:**
```typescript
const createCanvasStore = () =>
  createStore<CanvasStoreState>()(
    immer((...args) => ({
      ...createObjectsSlice(...args),
      ...createUISlice(...args),
      ...createPresenceSlice(...args),
      ...createUndoSlice(...args),
    }))
  );
```

## Store State Interface

### `CanvasStoreState` Composition

```typescript
export type CanvasStoreState = ObjectsSlice & UISlice & PresenceSlice & UndoSlice;
```

**ObjectsSlice:**
```typescript
interface ObjectsSlice {
  objects: Record<string, CanvasObject>;
  upsertMany: (objects: CanvasObject[]) => void;
  setAll: (objects: CanvasObject[]) => void;
  removeMany: (ids: string[]) => void;
  resetObjects: () => void;
}
```

**UISlice:**
```typescript
interface UISlice {
  tool: CanvasTool; // "select" | "rectangle" | "circle" | "text"
  selectedIds: string[];
  draftTextById: Record<string, string>;
  localIntent: LocalIntentState;
  stagePos: { x: number; y: number };
  stageScale: number;

  // Actions
  setTool: (tool: CanvasTool) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  beginLocalIntent: (objectId: string, entry: LocalIntentEntry) => void;
  updateLocalIntent: (objectId: string, entry: Partial<LocalIntentEntry>) => void;
  endLocalIntent: (objectId: string) => void;
  clearLocalIntent: () => void;
  setDraftText: (objectId: string, text: string) => void;
  clearDraftText: (objectId: string) => void;
  resetUI: () => void;
  setStageTransform: (pos: { x: number; y: number }, scale: number) => void;
}
```

**PresenceSlice:**
```typescript
interface PresenceSlice {
  peers: Record<string, PeerPresence>;
  cursors: Record<string, CursorState>;
  editing: EditingState;
  previews: PreviewState;

  // Actions
  hydratePeers: (peers: Record<string, PeerPresence>) => void;
  hydrateCursors: (cursors: Record<string, CursorState>) => void;
  hydrateEditing: (editing: EditingState) => void;
  hydratePreviews: (previews: PreviewState) => void;
  pruneByTTL: (ttlMs: number, now?: number) => void;
  resetPresence: () => void;
}
```

**UndoSlice:**
```typescript
interface UndoSlice {
  history: CanvasOperation[];
  pointer: number;

  // Actions
  push: (operation: CanvasOperation) => void;
  undo: () => CanvasOperation | null;
  redo: () => CanvasOperation | null;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
```

## Hook Dependencies & Integration

### `src/hooks/useCanvasInteractions.ts` - Composition Hook

**Current Signature:**
```typescript
function useCanvasInteractions(canvasId: string, userId: string)
```

**Store Dependencies:**
```typescript
const tool = useCanvasStore((s) => s.tool);
const selectedIds = useCanvasStore((s) => s.selectedIds);
```

**Sub-hook Dependencies:**
- `useShapeTransformations(canvasId, userId)` - Shape transformation with Firebase integration
- `useObjectManagement(canvasId, userId)` - Object CRUD operations
- `useKeyboardShortcuts()` - Keyboard event handling

**Current Return Interface:**
```typescript
return {
  createRect: objectManagement.createRect,
  createCircle: objectManagement.createCircle,
  getObjectHandlers,
  onDeleteSelected: objectManagement.onDeleteSelected,
  duplicateSelected: objectManagement.duplicateSelected,
  handleKeyDown: keyboardShortcuts.handleKeyDown,
  beginTransform: shapeTransforms.beginTransform,
  updateTransform: shapeTransforms.updateTransform,
  endTransform: shapeTransforms.endTransform,
};
```

**Side Effects:**
- Object creation handlers (`createRect`, `createCircle`)
- Keyboard shortcuts (`handleKeyDown`)
- Shape transformation handlers via `getObjectHandlers()`
- **Firebase operations are handled by `useShapeTransformations`**

### `src/hooks/useShapeTransformations.ts` - Firebase Integration Hook

**Signature:**
```typescript
function useShapeTransformations(canvasId: string, userId: string)
```

**Firebase Operations:**
```typescript
// Real-time editing state
publishEditing(canvasId, objectId, userId, isEditing: boolean)

// Preview state during transformation
publishPreview(canvasId, objectId, payload: PreviewState[string])

// Persistent object updates
commitObject({
  canvasId,
  objectId,
  expectedVersion,
  patch,
  userId
})
```

**Return Interface:**
```typescript
return {
  beginTransform,
  updateTransform,
  endTransform,
  getObjectHandlers,
};
```

**Key Features:**
- **Throttled Previews**: Uses `PreviewThrottler` for efficient real-time updates
- **Optimistic Updates**: Local intent state for immediate UI feedback
- **Version Control**: Proper object versioning for conflict resolution
- **Undo Support**: Integration with undo manager for transformation operations

## Firebase Client Interfaces

### `src/lib/rtdbClient.ts` - Real-time Database Operations

**Real-time Publishing Functions:**
```typescript
publishPresence(canvasId: string, userId: string, payload: PeerPresence)
publishCursor(canvasId: string, userId: string, payload: CursorState)
publishEditing(canvasId: string, objectId: string, userId: string, isEditing: boolean)
publishPreview(canvasId: string, objectId: string, payload: PreviewState[string])
```

**Subscription Functions:**
```typescript
subscribePresence(canvasId: string, onChange: (peers: Record<string, PeerPresence>) => void)
subscribeCursors(canvasId: string, onChange: (cursors: Record<string, CursorState>) => void)
subscribeEditing(canvasId: string, onChange: (editing: EditingState) => void)
subscribePreviews(canvasId: string, onChange: (previews: PreviewState) => void)
```

### `src/lib/fsClient.ts` - Firestore Persistent Storage

**Object Operations:**
```typescript
commitObject({
  canvasId: string,
  objectId: string,
  expectedVersion: number,
  patch: unknown,
  userId: string
}): Promise<void>

createObject({ canvasId: string, object: CanvasObject }): Promise<void>
deleteObjects({ canvasId: string, objectIds: string[] }): Promise<void>
```

**Subscription:**
```typescript
subscribeObjects({
  canvasId: string,
  onChange: (objects: CanvasObject[]) => void,
  onError?: (error: FirestoreError) => void
}): Unsubscribe
```

## Architectural Drift Detection

### Current Implementation vs Expected Interface

**Expected Interface (from prompt):**
```typescript
function useCanvasInteractions(
  stageRef: RefObject<Konva.Stage>,
  canvasId: string
): void
```

**Current Implementation:**
```typescript
function useCanvasInteractions(
  canvasId: string,
  userId: string
): InteractionHandlers
```

**Firebase Integration Location:**
- **Actual**: Firebase operations (`publishEditing`, `publishPreview`, `commitObject`) are called from `useShapeTransformations`
- **Expected**: Direct integration in `useCanvasInteractions` hook
- **Current Architecture**: Properly separated concerns - transformations handle persistence, interactions handle UI

**Konva Integration:**
- **CanvasStage**: Direct Konva stage event handling (pan, zoom, object creation)
- **ObjectsLayer**: Uses interaction handlers for object manipulation
- **Current Architecture**: Well-separated concerns between stage-level and object-level interactions

### Architectural Strengths (Not Drift)

1. **Proper Separation of Concerns**: Canvas interactions vs shape transformations are well-separated
2. **Composition Pattern**: `useCanvasInteractions` composes specialized sub-hooks effectively
3. **Firebase Integration**: Real-time and persistent operations are correctly placed in transformation logic

### Hook Composition Architecture

```
CanvasInteractionsContext Provider Pattern:
CanvasInteractionsProvider → useCanvasInteractions → useCanvasInteractionsContext

Hook Composition Chain:
useCanvasInteractions (composition hook)
├── useShapeTransformations (Firebase integration + object manipulation)
│   ├── beginTransform → publishEditing(true)
│   ├── updateTransform → publishPreview (throttled)
│   └── endTransform → commitObject + publishEditing(false)
├── useObjectManagement (object CRUD operations)
│   ├── createRect/createCircle → createObject (Firestore)
│   ├── onDeleteSelected → deleteObjects (Firestore)
│   └── duplicateSelected → createObject (Firestore)
└── useKeyboardShortcuts (keyboard event handling)

Component-Level Integration:
CanvasStage → useCanvasInteractionsContext (object creation + keyboard)
ObjectsLayer → useCanvasInteractionsContext (getObjectHandlers for manipulation)
```

## Store Integration Patterns

### Selector Usage Patterns

**Common Store Selectors:**
```typescript
// Tool and selection state
const tool = useCanvasStore((s) => s.tool);
const selectedIds = useCanvasStore((s) => s.selectedIds);

// Object state
const objects = useCanvasStore((s) => s.objects);
const upsertMany = useCanvasStore((s) => s.upsertMany);

// UI state
const stagePos = useCanvasStore((s) => s.stagePos);
const stageScale = useCanvasStore((s) => s.stageScale);

// Presence state
const peers = useCanvasStore((s) => s.peers);
const cursors = useCanvasStore((s) => s.cursors);
```

### State Update Patterns

**Immer-based Updates:**
```typescript
// Object operations
set((state) => {
  for (const object of objects) {
    state.objects[object.id] = object;
  }
});

// UI state updates
set({ tool, selectedIds: [], localIntent: {} });

// Presence hydration
set((state) => {
  state.peers = peers;
  state.cursors = cursors;
});
```

## Performance Considerations

### Store Subscription Patterns

**Debounced Object Updates:**
```typescript
// useCanvasSubscriptions uses 16ms debounce for object updates
const SNAPSHOT_DEBOUNCE_MS = 16;
```

**Presence TTL Management:**
```typescript
// Presence entries pruned every 600ms
const ttl = setInterval(() => pruneByTTL(600), 600);
```

### Hook Composition Benefits

1. **Separation of Concerns**: Each sub-hook handles specific functionality
2. **Reusability**: Sub-hooks can be used independently
3. **Testability**: Smaller, focused hooks are easier to test
4. **Performance**: Memoized return values prevent unnecessary re-renders

## Architecture Assessment & Recommendations

### Current Architecture Strengths

1. **Proper Separation of Concerns**:
   - `useCanvasInteractions`: UI composition and event handling
   - `useShapeTransformations`: Firebase integration and object persistence
   - `useObjectManagement`: CRUD operations for object lifecycle

2. **Efficient Firebase Integration**:
   - Real-time operations (`publishEditing`, `publishPreview`) in transformation logic
   - Persistent operations (`commitObject`) properly version-controlled
   - Throttled previews for performance optimization

3. **Component-Level Integration**:
   - `CanvasStage`: Direct Konva stage management (pan, zoom, object creation)
   - `ObjectsLayer`: Object manipulation through interaction handlers
   - Clean separation between stage-level and object-level interactions

### Recommendations

1. **Document Current Architecture**: The existing pattern is well-designed and should be documented as the intended architecture
2. **Clarify Hook Responsibilities**: Update any misleading documentation that suggests `useCanvasInteractions` should handle Firebase operations directly
3. **Maintain Composition Pattern**: The current composition approach provides good separation of concerns and reusability
4. **Consider Interface Standardization**: If consistency is needed across projects, consider whether the current pattern should become the standard

### Architecture Decision Rationale

The current implementation follows sound architectural principles:
- **Single Responsibility**: Each hook has a focused purpose
- **Dependency Direction**: UI hooks depend on data hooks, not vice versa
- **Composability**: Hooks can be used independently or composed together
- **Performance**: Throttling and optimistic updates provide good user experience
