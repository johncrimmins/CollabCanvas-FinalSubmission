"use client";

import { useCallback, useRef } from "react";
import { useCanvasStore } from "@/store";
import { commitObject } from "@/lib/fsClient";
import { publishEditing, publishPreview } from "@/lib/rtdbClient";
import { calculateTransformProps, now, PreviewThrottler } from "@/lib/transformUtils";
import { useUndoManager } from "@/hooks/useUndoManager";
import type { CanvasObject } from "@/lib/types";
import type { UpdateOperationEntry } from "@/store/types";

export function useShapeTransformations(canvasId: string, userId: string) {
  const beginLocalIntent = useCanvasStore((s) => s.beginLocalIntent);
  const updateLocalIntent = useCanvasStore((s) => s.updateLocalIntent);
  const endLocalIntent = useCanvasStore((s) => s.endLocalIntent);
  const selectedIds = useCanvasStore((s) => s.selectedIds);

  const transformStateRef = useRef<{
    activeId: string | null;
    mode: "move" | "resize";
    initialVersion: number;
    dragOffset: { dx: number; dy: number };
    baseProps: CanvasObject["props"];
  }>({
    activeId: null,
    mode: "move",
    initialVersion: 0,
    dragOffset: { dx: 0, dy: 0 },
    baseProps: { x: 0, y: 0 },
  });

  const throttlerRef = useRef(new PreviewThrottler());
  const undoManager = useUndoManager();

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
      };
      throttlerRef.current.resetSeq();
      beginLocalIntent(object.id, { kind: mode, props: {}, seq: 0 });
      publishEditing(canvasId, object.id, userId, true);
    },
    [beginLocalIntent, canvasId, userId]
  );

  const updateTransform = useCallback(
    (objectId: string, props: Partial<CanvasObject["props"]>) => {
      const state = transformStateRef.current;
      if (!state.activeId || state.activeId !== objectId) return;

      if (throttlerRef.current.shouldThrottle()) return;

      const selectedObjects = selectedIds
        .map((id) => (useCanvasStore as any).getState().objects[id])
        .filter(Boolean) as CanvasObject[];

      const nextPropsById: Record<string, Partial<CanvasObject["props"]>> = {};
      selectedObjects.forEach((current) => {
        const base = current.id === objectId ? state.baseProps : current.props;
        nextPropsById[current.id] = { ...base, ...props };
        updateLocalIntent(current.id, { props: nextPropsById[current.id] });
      });

      publishPreview(canvasId, objectId, {
        by: userId,
        seq: throttlerRef.current.getSeq(),
        at: now(),
        props: nextPropsById[objectId] || {},
      });
    },
    [canvasId, selectedIds, updateLocalIntent, userId]
  );

  const endTransform = useCallback(
    async (objectId: string, objectsSnapshot: CanvasObject[]) => {
      const state = transformStateRef.current;
      if (!state.activeId) return;

      transformStateRef.current = { ...state, activeId: null };
      endLocalIntent(objectId);
      publishEditing(canvasId, objectId, userId, false);

      publishPreview(canvasId, objectId, {
        by: userId,
        seq: throttlerRef.current.getSeq(),
        at: now(),
        props: {},
      });

      const nextPropsById: Record<string, Partial<CanvasObject["props"]>> = {};
      objectsSnapshot.forEach((current) => {
        if (current.id === objectId) {
          nextPropsById[current.id] = calculateTransformProps(current, { x: 0, y: 0 }, state.dragOffset, state.baseProps); // Simplified for end
        }
      });

      const entries = objectsSnapshot
        .map((object) => {
          const deltas = nextPropsById[object.id];
          if (!deltas || !Object.keys(deltas).length) return null;
          return { object, nextProps: deltas };
        })
        .filter(Boolean) as { object: CanvasObject; nextProps: Partial<CanvasObject["props"]> }[];

      const undoEntries: UpdateOperationEntry[] = entries.map(({ object, nextProps }) => ({
        id: object.id,
        before: state.baseProps,
        after: nextProps,
      }));

      try {
        await Promise.all(
          entries.map(async ({ object, nextProps }) => {
            await commitObject({
              canvasId,
              objectId: object.id,
              expectedVersion: object.v,
              patch: nextProps,
              userId,
            });
          })
        );
        if (undoEntries.length > 0) {
          undoManager.pushUpdate(undoEntries);
        }
      } catch (error) {
        console.error("Transform commit failed:", error);
      }
    },
    [canvasId, endLocalIntent, userId, undoManager]
  );

  const getObjectHandlers = useCallback(
    (object: CanvasObject) => {
      return {
        listening: true,
        onMouseDown: (e: any) => {
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          beginTransform(object, pointer, "move");
        },
        onMouseMove: (e: any) => {
          const stage = e?.target?.getStage();
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          updateTransform(object.id, pointer);
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
          const objectsSnapshot = [object]; // Simplified; in full impl, get from store
          await endTransform(object.id, objectsSnapshot);
        },
      } as const;
    },
    [beginTransform, updateTransform, endTransform]
  );

  return {
    beginTransform,
    updateTransform,
    endTransform,
    getObjectHandlers,
  };
}
