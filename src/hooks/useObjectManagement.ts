"use client";

import { useCallback } from "react";
import { useCanvasStore } from "@/store";
import { createObject, deleteObjects } from "@/lib/fsClient";
import { generateObjectId } from "@/lib/utils";
import { now } from "@/lib/transformUtils";
import { useToast } from "@/hooks/use-toast";
import { useUndoManager } from "@/hooks/useUndoManager";
import type { CanvasObject } from "@/lib/types";

export function useObjectManagement(canvasId: string, userId: string) {
  const upsertMany = useCanvasStore((s) => s.upsertMany);
  const setTool = useCanvasStore((s) => s.setTool);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const selectedIds = useCanvasStore((s) => s.selectedIds);

  const { toast } = useToast();
  const undoManager = useUndoManager();

  const createAndSelect = useCallback(
    async (object: CanvasObject) => {
      upsertMany([object]);
      await createObject({ canvasId, object });
      setTool("select");
      setSelectedIds([object.id]);
    },
    [canvasId, setSelectedIds, setTool, upsertMany]
  );

  const createRect = useCallback(
    async (x: number, y: number, w = 120, h = 80) => {
      const id = generateObjectId();
      const object: CanvasObject = {
        id,
        type: "rect",
        props: { x, y, w, h },
        v: 0,
        updatedBy: userId,
        updatedAt: now(),
      };
      await createAndSelect(object);
    },
    [createAndSelect, userId]
  );

  const createCircle = useCallback(
    async (x: number, y: number, r = 40) => {
      const id = generateObjectId();
      const object: CanvasObject = {
        id,
        type: "circle",
        props: { x, y, r },
        v: 0,
        updatedBy: userId,
        updatedAt: now(),
      };
      await createAndSelect(object);
    },
    [createAndSelect, userId]
  );

  const onDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    const state = (useCanvasStore as any).getState();
    const objectsToDelete = selectedIds
      .map((id) => state.objects[id])
      .filter((obj): obj is CanvasObject => Boolean(obj));
    if (!objectsToDelete.length) return;

    if (objectsToDelete.length > 25) {
      toast({
        title: "Delete many objects",
        description: `Deleting ${objectsToDelete.length} objects — confirm in toolbar.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteObjects({ canvasId, objectIds: selectedIds });
      undoManager.pushDelete(objectsToDelete);
    } catch (err) {
      console.error("deleteObjects failed", err);
      toast({
        title: "Delete failed",
        description: "We couldn't delete the selected objects. Try again.",
        variant: "destructive",
      });
    }
  }, [canvasId, selectedIds, toast, undoManager]);

  const duplicateSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    const state = (useCanvasStore as any).getState();
    const objectsToDuplicate = selectedIds
      .map((id) => state.objects[id])
      .filter((obj): obj is CanvasObject => Boolean(obj));

    if (!objectsToDuplicate.length) return;

    const clones = objectsToDuplicate.map((object) => ({
      ...object,
      id: generateObjectId(),
      props: {
        ...object.props,
        x: (object.props.x ?? 0) + 24,
        y: (object.props.y ?? 0) + 24,
      },
      v: 0,
      updatedBy: userId,
      updatedAt: now(),
    }));

    try {
      await Promise.all(clones.map((object) => createObject({ canvasId, object })));
      upsertMany(clones);
      setSelectedIds(clones.map((object) => object.id));
      undoManager.pushCreate(clones);
    } catch (err) {
      console.error("duplicateObjects failed", err);
      toast({
        title: "Duplicate failed",
        description: "We couldn't duplicate the selected objects. Try again.",
        variant: "destructive",
      });
    }
  }, [canvasId, selectedIds, setSelectedIds, upsertMany, toast, undoManager, userId]);

  return {
    createRect,
    createCircle,
    onDeleteSelected,
    duplicateSelected,
  };
}
