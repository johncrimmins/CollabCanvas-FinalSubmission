"use client";

import { useCallback } from "react";
import { useUndoManager } from "@/hooks/useUndoManager";

export function useKeyboardShortcuts(
  onDuplicate: () => Promise<void>,
  onDelete: () => Promise<void>
) {
  const undoManager = useUndoManager();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        void onDuplicate();
        return;
      }
      if (isMeta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          undoManager.redo();
        } else {
          undoManager.undo();
        }
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        void onDelete();
      }
    },
    [onDuplicate, onDelete, undoManager]
  );

  return {
    handleKeyDown,
  };
}
