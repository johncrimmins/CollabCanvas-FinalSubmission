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

    const ttl = setInterval(() => pruneByTTL(800), 800);

    // publish my presence
    const u = auth.currentUser;
    if (u) {
      publishPresence(canvasId, u.uid, {
        userId: u.uid,
        name: u.displayName || u.email || "User",
        color: "#3b82f6",
        at: Date.now(),
      });
    }

    return () => {
      u1?.(); u2?.(); u3?.(); u4?.();
      clearInterval(ttl);
    };
  }, [canvasId, hydrateCursors, hydrateEditing, hydratePeers, hydratePreviews, pruneByTTL]);
}


