"use client";

import { useEffect, useMemo } from "react";
import { useCanvasStore } from "@/store";

const isDev = process.env.NODE_ENV !== "production";

export function useCanvasDiagnostics(canvasId: string) {
  const objectCount = useCanvasStore(
    (store) => Object.keys(store.objects).length,
    (a, b) => a === b
  );
  const peerCount = useCanvasStore(
    (store) => Object.keys(store.peers).length,
    (a, b) => a === b
  );

  useEffect(() => {
    if (!isDev) return;
    console.groupCollapsed(`[CanvasDiagnostics] ${canvasId}`);
    console.log("objects", objectCount);
    console.log("peers", peerCount);
    console.groupEnd();
  }, [canvasId, objectCount, peerCount]);
}

