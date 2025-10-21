# Interfaces Snapshot - October 21, 2025

## src/lib/fsClient.ts
- **exported types/interfaces**:
  ```typescript
  export class CommitVersionMismatchError extends Error {
    constructor(public readonly currentVersion: number);
  }

  export class CommitValidationError extends Error {
    constructor(message: string);
  }

  export interface CommitObjectOptions {
    canvasId: string;
    objectId: string;
    expectedVersion: number;
    patch: unknown;
    userId: string;
  }

  export interface CreateObjectOptions {
    canvasId: string;
    object: CanvasObject;
  }

  export interface DeleteObjectsOptions {
    canvasId: string;
    objectIds: string[];
  }

  export interface SubscribeObjectsOptions {
    canvasId: string;
    onChange: (objects: CanvasObject[]) => void;
    onError?: (error: FirestoreError) => void;
  }
  ```

- **exported functions**:
  ```typescript
  export async function commitObject({
    canvasId,
    objectId,
    expectedVersion,
    patch,
    userId,
  }: CommitObjectOptions)

  export async function createObject({ canvasId, object }: CreateObjectOptions)

  export async function deleteObjects({ canvasId, objectIds }: DeleteObjectsOptions)

  export function subscribeObjects({
    canvasId,
    onChange,
    onError,
  }: SubscribeObjectsOptions): Unsubscribe
  ```

- **exported constants**: none

## src/lib/rtdbClient.ts
- **exported types/interfaces**:
  ```typescript
  export type Unsubscribe = () => void;
  ```

- **exported functions**:
  ```typescript
  export function subscribeConnectionStatus(
    onChange: (isConnected: boolean) => void
  ): Unsubscribe

  export function publishPresence(
    canvasId: string,
    userId: string,
    payload: PeerPresence
  )

  export function publishCursor(
    canvasId: string,
    userId: string,
    payload: CursorState
  )

  export function publishEditing(
    canvasId: string,
    objectId: string,
    userId: string,
    isEditing: boolean
  )

  export function publishPreview(
    canvasId: string,
    objectId: string,
    payload: PreviewState[string]
  )

  export function subscribePresence(
    canvasId: string,
    onChange: (peers: Record<string, PeerPresence>) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  export function subscribeCursors(
    canvasId: string,
    onChange: (cursors: Record<string, CursorState>) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  export function subscribeEditing(
    canvasId: string,
    onChange: (editing: EditingState) => void,
    onError?: (error: Error) => void
  ): Unsubscribe

  export function subscribePreviews(
    canvasId: string,
    onChange: (previews: PreviewState) => void,
    onError?: (error: Error) => void
  ): Unsubscribe
  ```

- **exported constants**: none

## src/lib/firebase.ts
- **exported types/interfaces**: none

- **exported functions**: none

- **exported constants**:
  ```typescript
  export const auth: Auth
  export const db: Firestore
  export const rtdb: Database
  export { app };
  ```

## src/lib/reconciler.ts
- **exported types/interfaces**:
  ```typescript
  export interface RenderProps {
    object: CanvasObject;
    derivedProps: CanvasObject["props"];
    source: "localIntent" | "preview" | "truth";
  }
  ```

- **exported functions**:
  ```typescript
  export function selectRenderProps(
    object: CanvasObject,
    localIntent: LocalIntentState,
    previews: PreviewState
  ): RenderProps

  export function applyFirestoreSnapshot(
    state: CanvasStoreState,
    objects: CanvasObject[]
  )

  export function transformIntentOnTruth(
    objectId: string,
    latestTruth: CanvasObject,
    localIntent: LocalIntentState
  )

  export function debounceDuration(): number
  ```

- **exported constants**:
  ```typescript
  const DEFAULT_DEBOUNCE_MS = 16;
  ```

## src/lib/utils.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export function cn(...inputs: ClassValue[])

  export function generateCanvasId(length: number = 12): string

  export function generateObjectId(): string
  ```

- **exported constants**:
  ```typescript
  export const logger = {
    debug: (message: string, data?: any) => void,
    info: (message: string, data?: any) => void,
    warn: (message: string, data?: any) => void,
    error: (message: string, error?: any) => void
  };

  export const trace = {
    state: (operation: string, state: any, context?: string) => void,
    firebase: (operation: string, data: any, context?: string) => void,
    transform: (operation: string, data: any, context?: string) => void,
    undo: (operation: string, data: any, context?: string) => void
  };
  ```

## src/lib/validators.ts
- **exported types/interfaces**:
  ```typescript
  export const canvasObjectTypeSchema = z.enum(["rect", "circle", "text"]);
  export type CanvasObjectType = z.infer<typeof canvasObjectTypeSchema>;

  export const canvasObjectPropsSchema = z.object({
    x: z.number(),
    y: z.number(),
    w: z.number().optional(),
    h: z.number().optional(),
    r: z.number().optional(),
    rotation: z.number().optional(),
    text: z.string().optional(),
    fill: z.string().optional(),
  });
  export type CanvasObjectProps = z.infer<typeof canvasObjectPropsSchema>;

  export const canvasObjectSchema = z.object({
    id: z.string(),
    type: canvasObjectTypeSchema,
    props: canvasObjectPropsSchema,
    v: z.number().int().nonnegative(),
    updatedBy: z.string(),
    updatedAt: z.number().int().nonnegative(),
  });
  export type CanvasObject = z.infer<typeof canvasObjectSchema>;

  export const canvasObjectPatchSchema = canvasObjectPropsSchema.partial();
  export type CanvasObjectPatch = z.infer<typeof canvasObjectPatchSchema>;

  export class CanvasObjectValidationError extends Error {
    constructor(message: string);
  }
  ```

- **exported functions**:
  ```typescript
  export function parseCanvasObjectDoc(id: string, data: unknown): CanvasObject
  ```

- **exported constants**: none

## src/hooks/useCanvasInteractions.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export function useCanvasInteractions(canvasId: string, userId: string)
  ```

- **exported constants**: none

## src/hooks/useShapeTransformations.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export function useShapeTransformations(canvasId: string, userId: string)
  ```

- **exported constants**: none

## src/hooks/useCanvasSubscriptions.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export function useCanvasSubscriptions(canvasId: string)
  ```

- **exported constants**:
  ```typescript
  const SNAPSHOT_DEBOUNCE_MS = 16;
  ```

## src/hooks/useKeyboardShortcuts.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export function useKeyboardShortcuts(
    onDuplicate: () => Promise<void>,
    onDelete: () => Promise<void>
  )
  ```

- **exported constants**: none

## src/hooks/useUndoManager.ts
- **exported types/interfaces**:
  ```typescript
  interface UndoManagerApi {
    pushCreate: (objects: CanvasObject[]) => void;
    pushDelete: (objects: CanvasObject[]) => void;
    pushUpdate: (entries: UpdateOperationEntry[]) => void;
    undo: () => Promise<boolean>;
    redo: () => Promise<boolean>;
    canUndo: boolean;
    canRedo: boolean;
  }
  ```

- **exported functions**:
  ```typescript
  export function useUndoManager(): UndoManagerApi
  ```

- **exported constants**: none

## src/components/CanvasStage.tsx
- **exported types/interfaces**:
  ```typescript
  export interface CanvasStageProps {
    children?: React.ReactNode;
    width?: number;
    height?: number;
    onStageRef?: (stage: KonvaStageType | null) => void;
  }
  ```

- **exported functions**:
  ```typescript
  export function CanvasStage({
    children,
    width,
    height,
    onStageRef,
  }: CanvasStageProps)
  ```

- **exported constants**: none

## src/components/PresenceLayer.tsx
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export function PresenceLayer()
  ```

- **exported constants**: none

## src/components/TextEditor.tsx
**Note**: This file was not found in the project structure.

## src/components/Toolbar.tsx
- **exported types/interfaces**:
  ```typescript
  export interface ToolbarProps {
    activeTool?: string;
    onToolSelect?: (tool: string) => void;
  }
  ```

- **exported functions**:
  ```typescript
  export function Toolbar({ activeTool = "select", onToolSelect }: ToolbarProps)
  ```

- **exported constants**:
  ```typescript
  const tools: { id: string; label: string }[] = [
    { id: "select", label: "Select" },
    { id: "rectangle", label: "Rectangle" },
    { id: "circle", label: "Circle" },
    { id: "text", label: "Text" },
  ];
  ```

## src/store/index.ts
- **exported types/interfaces**:
  ```typescript
  export type CanvasStoreInitializer = () => CanvasStore;
  ```

- **exported functions**:
  ```typescript
  export function CanvasStoreProvider({
    children,
    storeFactory = createCanvasStore,
  }: {
    children: React.ReactNode;
    storeFactory?: CanvasStoreInitializer;
  })

  export function useCanvasStore<T>(
    selector: (state: CanvasStoreState) => T,
    equalityFn?: (a: T, b: T) => boolean
  ): T

  export { createCanvasStore };
  ```

- **exported constants**: none

## src/store/objects.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export const createObjectsSlice: StateCreator<
    CanvasStoreState,
    [["zustand/immer", never]],
    [],
    ObjectsSlice
  >
  ```

- **exported constants**: none

## src/store/ui.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export const createUISlice: StateCreator<
    CanvasStoreState,
    [["zustand/immer", never]],
    [],
    UISlice
  >
  ```

- **exported constants**:
  ```typescript
  const defaultLocalIntent: LocalIntentState = {};
  ```

## src/store/presence.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export const createPresenceSlice: StateCreator<
    CanvasStoreState,
    [["zustand/immer", never]],
    [],
    PresenceSlice
  >
  ```

- **exported constants**:
  ```typescript
  const TTL_DEFAULT_MS = 800;
  ```

## src/store/undo.ts
- **exported types/interfaces**: none

- **exported functions**:
  ```typescript
  export const createUndoSlice: StateCreator<
    CanvasStoreState,
    [["zustand/immer", never]],
    [],
    UndoSlice
  >
  ```

- **exported constants**:
  ```typescript
  export const MAX_HISTORY = 100;
  ```

## src/store/types.ts
- **exported types/interfaces**:
  ```typescript
  export type CanvasTool = "select" | "rectangle" | "circle" | "text";

  export interface LocalIntentEntry {
    kind: "move" | "resize";
    props: Partial<CanvasObject["props"]>;
    seq: number;
  }

  export type LocalIntentState = Record<string, LocalIntentEntry>;

  export interface DraftTextState {
    [objectId: string]: string;
  }

  export interface PeerPresence {
    userId: string;
    name: string;
    color: string;
    at: number;
  }

  export interface CursorState {
    userId: string;
    x: number;
    y: number;
    tool: CanvasTool;
    at: number;
  }

  export interface EditingStateEntry {
    userId: string;
    at: number;
  }

  export type EditingState = Record<string, Record<string, EditingStateEntry>>;

  export interface PreviewStateEntry {
    by: string;
    seq: number;
    at: number;
    props: Partial<CanvasObject["props"]>;
  }

  export type PreviewState = Record<string, PreviewStateEntry>;

  export interface ObjectsSlice {
    objects: Record<string, CanvasObject>;
    upsertMany: (objects: CanvasObject[]) => void;
    setAll: (objects: CanvasObject[]) => void;
    removeMany: (ids: string[]) => void;
    resetObjects: () => void;
  }

  export interface UISlice {
    tool: CanvasTool;
    selectedIds: string[];
    draftTextById: DraftTextState;
    localIntent: LocalIntentState;
    stagePos: { x: number; y: number };
    stageScale: number;
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

  export interface PresenceSlice {
    peers: Record<string, PeerPresence>;
    cursors: Record<string, CursorState>;
    editing: EditingState;
    previews: PreviewState;
    hydratePeers: (peers: Record<string, PeerPresence>) => void;
    hydrateCursors: (cursors: Record<string, CursorState>) => void;
    hydrateEditing: (editing: EditingState) => void;
    hydratePreviews: (previews: PreviewState) => void;
    pruneByTTL: (ttlMs: number, now?: number) => void;
    resetPresence: () => void;
  }

  export interface UpdateOperationEntry {
    id: string;
    before: Partial<CanvasObject["props"]>;
    after: Partial<CanvasObject["props"]>;
  }

  export type CanvasOperation =
    | { type: "create"; objects: CanvasObject[] }
    | { type: "delete"; objects: CanvasObject[] }
    | { type: "update"; entries: UpdateOperationEntry[] };

  export interface UndoSlice {
    history: CanvasOperation[];
    pointer: number;
    push: (operation: CanvasOperation) => void;
    undo: () => CanvasOperation | null;
    redo: () => CanvasOperation | null;
    clearHistory: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
  }

  export interface Patch {
    op: "replace" | "remove" | "add";
    path: string[];
    value?: any;
  }

  export interface PatchBundle {
    patches: Patch[];
    inversePatches: Patch[];
  }

  export type CanvasStoreState = ObjectsSlice & UISlice & PresenceSlice & UndoSlice;
  ```

- **exported functions**: none

- **exported constants**: none
