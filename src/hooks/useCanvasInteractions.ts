"use client";

import { useCallback, useMemo, useRef } from "react";
import { useCanvasStore } from "@/store";
import { createObject, commitObject, deleteObjects } from "@/lib/fsClient";
import { publishEditing, publishPreview } from "@/lib/rtdbClient";
import { generateObjectId, logger, trace } from "@/lib/utils";
import type { CanvasObject } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUndoManager } from "@/hooks/useUndoManager";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Rect as KonvaRect } from "konva/lib/shapes/Rect";
import type { Circle as KonvaCircle } from "konva/lib/shapes/Circle";
import type { UpdateOperationEntry } from "@/store/types";

function now() {
  return Date.now();
}

interface TransformState {
  activeId: string | null;
  mode: "move" | "resize";
  initialVersion: number;
  dragOffset: { dx: number; dy: number };
  baseProps: CanvasObject["props"]; // snapshot of props at gesture start
  seq: number;
}

const PREVIEW_THROTTLE_MS = 80;

export function useCanvasInteractions(canvasId: string, userId: string) {
  const upsertMany = useCanvasStore((s) => s.upsertMany);
  const setTool = useCanvasStore((s) => s.setTool);
  const tool = useCanvasStore((s) => s.tool);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const beginLocalIntent = useCanvasStore((s) => s.beginLocalIntent);
  const updateLocalIntent = useCanvasStore((s) => s.updateLocalIntent);
  const endLocalIntent = useCanvasStore((s) => s.endLocalIntent);

  const transformStateRef = useRef<TransformState>({
    activeId: null,
    mode: "move",
    initialVersion: 0,
    dragOffset: { dx: 0, dy: 0 },
    baseProps: { x: 0, y: 0 },
    seq: 0,
  });
  const lastPreviewRef = useRef<number>(0);

  // Get stable store reference (this selector is stable and won't cause re-renders)
  const store = useCanvasStore((s) => s);

  // Compute selectedObjects using useMemo with stable dependencies
  const selectedObjects = useMemo(() => {
    return selectedIds.map((id) => store.objects[id]).filter(Boolean) as CanvasObject[];
  }, [selectedIds, store.objects]);

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

  const publishPreviewThrottled = useCallback(
    (objectId: string, props: Partial<CanvasObject["props"]>) => {
      const nowTs = now();
      if (nowTs - lastPreviewRef.current < PREVIEW_THROTTLE_MS) {
        return;
      }
      lastPreviewRef.current = nowTs;
      transformStateRef.current.seq += 1;
      publishPreview(canvasId, objectId, {
        by: userId,
        seq: transformStateRef.current.seq,
        at: nowTs,
        props,
      });
    },
    [canvasId, userId]
  );

  const commitTransforms = useCallback(
    async (entries: { object: CanvasObject; nextProps: Partial<CanvasObject["props"]> }[]) => {
      await Promise.all(
        entries.map(async ({ object, nextProps }) => {
          if (!Object.keys(nextProps).length) return;
          try {
            await commitObject({
              canvasId,
              objectId: object.id,
              expectedVersion: object.v,
              patch: nextProps,
              userId,
            });
          } catch (err) {
            console.error("commitObject failed", err);
          }
        })
      );
    },
    [canvasId, userId]
  );

  const beginTransform = useCallback(
    (object: CanvasObject, pointer: { x: number; y: number } | null, mode: "move" | "resize") => {
      const baseProps = { ...object.props };
      const dragOffset =
        mode === "move" && pointer
          ? {
              dx: (object.props.x ?? 0) - pointer.x,
              dy: (object.props.y ?? 0) - pointer.y,
            }
          : { dx: 0, dy: 0 };

      transformStateRef.current = {
        activeId: object.id,
        mode,
        initialVersion: object.v,
        dragOffset,
        baseProps,
        seq: 0,
      };
      beginLocalIntent(object.id, { kind: mode, props: {}, seq: 0 });
      publishEditing(canvasId, object.id, userId, true);
    },
    [beginLocalIntent, canvasId, userId]
  );

  const updateTransform = useCallback(
    (objectId: string, props: Partial<CanvasObject["props"]>) => {
      updateLocalIntent(objectId, { props });
      publishPreviewThrottled(objectId, props);
    },
    [publishPreviewThrottled, updateLocalIntent]
  );

  const endTransform = useCallback(
    async (objectId: string, objectsSnapshot: CanvasObject[], nextPropsById: Record<string, Partial<CanvasObject["props"]>>) => {
      const state = transformStateRef.current;
      if (!state.activeId) return;
      transformStateRef.current = { ...state, activeId: null };

      endLocalIntent(objectId);
      publishEditing(canvasId, objectId, userId, false);
      publishPreview(canvasId, objectId, {
        by: userId,
        seq: state.seq,
        at: now(),
        props: {},
      });
      const entries = objectsSnapshot
        .map((object) => {
          const deltas = nextPropsById[object.id];
          if (!deltas) return null;
          return { object, nextProps: deltas };
        })
        .filter(Boolean) as { object: CanvasObject; nextProps: Partial<CanvasObject["props"]> }[];

      // Build undo entries from baseProps vs final patch
      const undoEntries: UpdateOperationEntry[] = entries.map(({ object, nextProps }) => ({
        id: object.id,
        before: state.baseProps,
        after: nextProps,
      }));

      try {
        await commitTransforms(entries);
      } finally {
        // Push undo after attempting commits (record intended change)
        try {
          const manager = useUndoManager();
          manager.pushUpdate(undoEntries);
        } catch {}
      }
    },
    [canvasId, commitTransforms, endLocalIntent, userId]
  );

  const getObjectHandlers = useCallback(
    (object: CanvasObject) => {
      return {
        listening: true,
        onMouseDown: (e: any) => {
          if (tool !== "select") return;
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          if (!selectedIds.includes(object.id)) {
            setSelectedIds([object.id]);
          }
          beginTransform(object, pointer, "move");
        },
        onMouseMove: (e: any) => {
          const state = transformStateRef.current;
          if (!state.activeId) return;
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;

          const selected = selectedObjects.length ? selectedObjects : [object];
          const nextPropsById: Record<string, Partial<CanvasObject["props"]>> = {};
          selected.forEach((current) => {
            const base = current.id === object.id ? state.baseProps : current.props;
            const dx = pointer.x + state.dragOffset.dx - (base.x ?? 0);
            const dy = pointer.y + state.dragOffset.dy - (base.y ?? 0);
            nextPropsById[current.id] = {
              x: (base.x ?? 0) + dx,
              y: (base.y ?? 0) + dy,
            };
            updateTransform(current.id, nextPropsById[current.id]);
          });
        },
        onMouseUp: async (e: any) => {
          const state = transformStateRef.current;
          if (!state.activeId) return;
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) {
            transformStateRef.current.activeId = null;
            return;
          }

          const selected = selectedObjects.length ? selectedObjects : [object];
          const nextPropsById: Record<string, Partial<CanvasObject["props"]>> = {};
          selected.forEach((current) => {
            const base = current.id === object.id ? state.baseProps : current.props;
            nextPropsById[current.id] = {
              x: pointer.x + state.dragOffset.dx,
              y: pointer.y + state.dragOffset.dy,
            };
          });

          await endTransform(object.id, selected, nextPropsById);
        },
      } as const;
    },
    [beginTransform, endTransform, selectedIds, selectedObjects, setSelectedIds, tool, updateTransform]
  );

  const { toast } = useToast();
  const undoManager = useUndoManager();

  const onDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    // Access current state via selector call
    const state = (useCanvasStore as any).getState?.() || { objects: {} };
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
    const state = (useCanvasStore as any).getState?.() || { objects: {} };
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        void duplicateSelected();
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
        void onDeleteSelected();
      }
    },
    [duplicateSelected, onDeleteSelected, undoManager]
  );

  return useMemo(
    () => ({
      createRect,
      createCircle,
      getObjectHandlers,
      onDeleteSelected,
      duplicateSelected,
      handleKeyDown,
      beginTransform,
      updateTransform,
      endTransform,
    }),
    [createCircle, createRect, getObjectHandlers, handleKeyDown, onDeleteSelected, duplicateSelected, beginTransform, updateTransform, endTransform]
  );
}


