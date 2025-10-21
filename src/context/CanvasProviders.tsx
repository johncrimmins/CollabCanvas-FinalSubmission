"use client";

import { CanvasStoreProvider } from "@/store";
import { CanvasIdProvider } from "@/context/CanvasContext";

export function CanvasProviders({
  canvasId,
  children,
}: {
  canvasId: string;
  children: React.ReactNode;
}) {
  return (
    <CanvasIdProvider canvasId={canvasId}>
      <CanvasStoreProvider>{children}</CanvasStoreProvider>
    </CanvasIdProvider>
  );
}

