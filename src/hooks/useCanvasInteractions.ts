"use client";

import { useCallback, useRef } from "react";
import { useCanvasStore } from "@/store";
import { createObject, commitObject, deleteObjects } from "@/lib/fsClient";
import { publishEditing, publishPreview } from "@/lib/rtdbClient";
import { generateObjectId } from "@/lib/utils";
import type { CanvasObject } from "@/lib/types";

function now() { return Date.now(); }

export function useCanvasInteractions(canvasId: string, userId: string) {
  const upsertMany = useCanvasStore((s) => s.upsertMany);
  const setTool = useCanvasStore((s) => s.setTool);
  const tool = useCanvasStore((s) => s.tool);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const beginLocalIntent = useCanvasStore((s) => s.beginLocalIntent);
  const updateLocalIntent = useCanvasStore((s) => s.updateLocalIntent);
  const endLocalIntent = useCanvasStore((s) => s.endLocalIntent);

  // Drag state
  const activeIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const seqRef = useRef<number>(0);

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
      upsertMany([object]);
      await createObject({ canvasId, object });
      setTool("select");
      setSelectedIds([id]);
    },
    [canvasId, setSelectedIds, setTool, upsertMany, userId]
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
      upsertMany([object]);
      await createObject({ canvasId, object });
      setTool("select");
      setSelectedIds([id]);
    },
    [canvasId, setSelectedIds, setTool, upsertMany, userId]
  );

  const getObjectHandlers = useCallback((object: CanvasObject) => {
    return {
      listening: true,
      onMouseDown: (e: any) => {
        if (tool !== "select") return;
        setSelectedIds([object.id]);
        const p = e?.target?.getStage()?.getPointerPosition();
        if (!p) return;
        dragOffsetRef.current = { dx: (object.props.x ?? 0) - p.x, dy: (object.props.y ?? 0) - p.y };
        seqRef.current = 0;
        activeIdRef.current = object.id;
        beginLocalIntent(object.id, { kind: "move", props: {}, seq: 0 });
        publishEditing(canvasId, object.id, userId, true);
      },
      onMouseMove: (e: any) => {
        const id = activeIdRef.current;
        if (!id) return;
        const p = e?.target?.getStage()?.getPointerPosition();
        if (!p) return;
        const x = p.x + dragOffsetRef.current.dx;
        const y = p.y + dragOffsetRef.current.dy;
        updateLocalIntent(id, { props: { x, y }, seq: ++seqRef.current });
        publishPreview(canvasId, id, { by: userId, seq: seqRef.current, at: now(), props: { x, y } });
      },
      onMouseUp: async (e: any) => {
        const id = activeIdRef.current;
        if (!id) return;
        const p = e?.target?.getStage()?.getPointerPosition();
        if (!p) return;
        const x = p.x + dragOffsetRef.current.dx;
        const y = p.y + dragOffsetRef.current.dy;
        activeIdRef.current = null;
        endLocalIntent(id);
        publishEditing(canvasId, id, userId, false);
        publishPreview(canvasId, id, { by: userId, seq: seqRef.current, at: now(), props: {} });
        try {
          await commitObject({
            canvasId,
            objectId: id,
            expectedVersion: object.v,
            patch: { x, y },
            userId,
          });
        } catch (err) {
          // Let reconciler adopt truth on mismatch elsewhere
          // eslint-disable-next-line no-console
          console.error("commitObject failed", err);
        }
      },
    } as const;
  }, [beginLocalIntent, canvasId, endLocalIntent, tool, updateLocalIntent, userId]);

  const onDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) return;
    try {
      await deleteObjects({ canvasId, objectIds: selectedIds });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("deleteObjects failed", err);
    }
  }, [canvasId, selectedIds]);

  // Keyboard delete helper: caller should wire this to keydown
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      void onDeleteSelected();
    }
  }, [onDeleteSelected]);

  return { createRect, createCircle, getObjectHandlers, onDeleteSelected, handleKeyDown } as const;
}


