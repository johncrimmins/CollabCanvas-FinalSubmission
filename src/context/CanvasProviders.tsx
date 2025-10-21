"use client";

import { CanvasStoreProvider } from "@/store";
import { CanvasIdProvider } from "@/context/CanvasContext";
import { CanvasInteractionsProvider } from "@/context/CanvasInteractionsContext";
import { auth } from "@/lib/firebase";

export function CanvasProviders({
  canvasId,
  children,
}: {
  canvasId: string;
  children: React.ReactNode;
}) {
  const userId = auth.currentUser?.uid || "anon";
  return (
    <CanvasStoreProvider>
      <CanvasIdProvider canvasId={canvasId}>
        <CanvasInteractionsProvider canvasId={canvasId} userId={userId}>
          {children}
        </CanvasInteractionsProvider>
      </CanvasIdProvider>
    </CanvasStoreProvider>
  );
}

