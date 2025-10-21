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
  onChange: (isConnected: boolean) => void
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

export function subscribePresence(
  canvasId: string,
  onChange: (peers: Record<string, PeerPresence>) => void
): Unsubscribe {
  const presenceRef = scopedRef(`canvases/${canvasId}/presence`);
  return onValue(presenceRef, (snapshot) => {
    onChange((snapshot.val() ?? {}) as Record<string, PeerPresence>);
  });
}

export function subscribeCursors(
  canvasId: string,
  onChange: (cursors: Record<string, CursorState>) => void
): Unsubscribe {
  const cursorRef = scopedRef(`canvases/${canvasId}/cursors`);
  return onValue(cursorRef, (snapshot) => {
    onChange((snapshot.val() ?? {}) as Record<string, CursorState>);
  });
}

export function subscribeEditing(
  canvasId: string,
  onChange: (editing: EditingState) => void
): Unsubscribe {
  const editingRef = scopedRef(`canvases/${canvasId}/editing`);
  return onValue(editingRef, (snapshot) => {
    onChange((snapshot.val() ?? {}) as EditingState);
  });
}

export function subscribePreviews(
  canvasId: string,
  onChange: (previews: PreviewState) => void
): Unsubscribe {
  const previewRef = scopedRef(`canvases/${canvasId}/previews`);
  return onValue(previewRef, (snapshot) => {
    onChange((snapshot.val() ?? {}) as PreviewState);
  });
}

