"use client";

import { useCanvasSubscriptions } from "@/hooks/useCanvasSubscriptions";

export function CanvasSubscriptions({ canvasId }: { canvasId: string }) {
  useCanvasSubscriptions(canvasId);
  return null;
}


