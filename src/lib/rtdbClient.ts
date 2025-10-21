import {
  ref,
  onValue,
  onDisconnect,
  set,
  remove,
  type DatabaseReference,
  type DatabaseError,
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

function subscribeScoped<T>(
  path: string,
  onChange: (value: T) => void,
  onError?: (error: DatabaseError) => void
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
  onError?: (error: DatabaseError) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/presence`, onChange, onError);
}

export function subscribeCursors(
  canvasId: string,
  onChange: (cursors: Record<string, CursorState>) => void,
  onError?: (error: DatabaseError) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/cursors`, onChange, onError);
}

export function subscribeEditing(
  canvasId: string,
  onChange: (editing: EditingState) => void,
  onError?: (error: DatabaseError) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/editing`, onChange, onError);
}

export function subscribePreviews(
  canvasId: string,
  onChange: (previews: PreviewState) => void,
  onError?: (error: DatabaseError) => void
): Unsubscribe {
  return subscribeScoped(`canvases/${canvasId}/previews`, onChange, onError);
}

