import type { Patch } from "immer";
import type { CanvasObject } from "@/lib/types";

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

export interface PatchBundle {
  patches: Patch[];
  inversePatches: Patch[];
}

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

export interface UndoSlice {
  history: PatchBundle[];
  pointer: number;
  push: (bundle: PatchBundle) => void;
  undo: () => PatchBundle | null;
  redo: () => PatchBundle | null;
  clearHistory: () => void;
}

export type CanvasStoreState = ObjectsSlice & UISlice & PresenceSlice & UndoSlice;

