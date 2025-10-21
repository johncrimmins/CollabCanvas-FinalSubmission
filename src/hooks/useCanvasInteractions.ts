"use client";

import { useMemo } from "react";
import { useCanvasStore } from "@/store";
import { useShapeTransformations } from "@/hooks/useShapeTransformations";
import { useObjectManagement } from "@/hooks/useObjectManagement";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function useCanvasInteractions(canvasId: string, userId: string) {
  const tool = useCanvasStore((s) => s.tool);
  const selectedIds = useCanvasStore((s) => s.selectedIds);

  // Compose sub-hooks
  const shapeTransforms = useShapeTransformations(canvasId, userId);
  const objectManagement = useObjectManagement(canvasId, userId);

  // Wrap handlers to include tool and selection logic
  const getObjectHandlers = useMemo(
    () => (object: any) => {
      const baseHandlers = shapeTransforms.getObjectHandlers(object);
      return {
        ...baseHandlers,
        onMouseDown: (e: any) => {
          if (tool !== "select") return;
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          if (!selectedIds.includes(object.id)) {
            (useCanvasStore as any).getState().setSelectedIds([object.id]);
          }
          shapeTransforms.beginTransform(object, pointer, "move");
        },
      };
    },
    [tool, selectedIds, shapeTransforms]
  );

  const keyboardShortcuts = useKeyboardShortcuts(
    objectManagement.duplicateSelected,
    objectManagement.onDeleteSelected
  );

  return useMemo(
    () => ({
      createRect: objectManagement.createRect,
      createCircle: objectManagement.createCircle,
      getObjectHandlers,
      onDeleteSelected: objectManagement.onDeleteSelected,
      duplicateSelected: objectManagement.duplicateSelected,
      handleKeyDown: keyboardShortcuts.handleKeyDown,
      beginTransform: shapeTransforms.beginTransform,
      updateTransform: shapeTransforms.updateTransform,
      endTransform: shapeTransforms.endTransform,
    }),
    [
      objectManagement.createRect,
      objectManagement.createCircle,
      getObjectHandlers,
      objectManagement.onDeleteSelected,
      objectManagement.duplicateSelected,
      keyboardShortcuts.handleKeyDown,
      shapeTransforms.beginTransform,
      shapeTransforms.updateTransform,
      shapeTransforms.endTransform,
    ]
  );
}


