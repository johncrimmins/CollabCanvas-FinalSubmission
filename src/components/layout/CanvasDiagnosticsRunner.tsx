"use client";

import { useCanvasDiagnostics } from "@/hooks/useCanvasDiagnostics";

export function CanvasDiagnosticsRunner({ canvasId }: { canvasId: string }) {
  useCanvasDiagnostics(canvasId);
  return null;
}


