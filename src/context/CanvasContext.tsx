"use client";

import { createContext, useContext } from "react";

const CanvasIdContext = createContext<string | null>(null);

export function CanvasIdProvider({
  canvasId,
  children,
}: {
  canvasId: string;
  children: React.ReactNode;
}) {
  return (
    <CanvasIdContext.Provider value={canvasId}>
      {children}
    </CanvasIdContext.Provider>
  );
}

export function useCanvasId(): string {
  const canvasId = useContext(CanvasIdContext);
  if (!canvasId) {
    throw new Error("useCanvasId must be used within a CanvasIdProvider");
  }
  return canvasId;
}

