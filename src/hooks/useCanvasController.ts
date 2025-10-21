"use client";

import { useEffect } from "react";
import { useCanvasStore } from "@/store";
import { useNetworkSync } from "@/hooks/useNetworkSync";
import { auth } from "@/lib/firebase";

export function useCanvasController(canvasId: string) {
  const userId = auth.currentUser?.uid ?? "anon";
  useNetworkSync(canvasId, userId);
}
