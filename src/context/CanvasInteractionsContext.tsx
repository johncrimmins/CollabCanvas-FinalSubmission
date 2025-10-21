"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCanvasInteractions } from "@/hooks/useCanvasInteractions";

interface CanvasInteractionsProviderProps {
  canvasId: string;
  userId: string;
  children: ReactNode;
}

const CanvasInteractionsContext = createContext<ReturnType<typeof useCanvasInteractions> | null>(null);

export function CanvasInteractionsProvider({ canvasId, userId, children }: CanvasInteractionsProviderProps) {
  const value = useCanvasInteractions(canvasId, userId);
  return <CanvasInteractionsContext.Provider value={value}>{children}</CanvasInteractionsContext.Provider>;
}

export function useCanvasInteractionsContext() {
  const context = useContext(CanvasInteractionsContext);
  if (!context) {
    throw new Error("useCanvasInteractionsContext must be used within a CanvasInteractionsProvider");
  }
  return context;
}


