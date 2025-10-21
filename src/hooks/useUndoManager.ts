"use client";

import { useCallback, useMemo } from "react";
import { useCanvasStore } from "@/store";
import type { CanvasObject } from "@/lib/types";
import { createObject, deleteObjects, commitObject } from "@/lib/fsClient";
import { useToast } from "@/hooks/use-toast";
import type { CanvasOperation, UpdateOperationEntry } from "@/store/types";
import { useCanvasId } from "@/context/CanvasContext";
import { auth } from "@/lib/firebase";

interface UndoManagerApi {
  pushCreate: (objects: CanvasObject[]) => void;
  pushDelete: (objects: CanvasObject[]) => void;
  pushUpdate: (entries: UpdateOperationEntry[]) => void;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  canUndo: boolean;
  canRedo: boolean;
}

function cloneObject(object: CanvasObject): CanvasObject {
  return {
    ...object,
    props: { ...object.props },
  };
}

function cloneEntries(entries: UpdateOperationEntry[]): UpdateOperationEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    before: { ...entry.before },
    after: { ...entry.after },
  }));
}

export function useUndoManager(): UndoManagerApi {
  const canvasId = useCanvasId();
  const userId = auth.currentUser?.uid || "anon";
  const { toast } = useToast();

  const push = useCanvasStore((s) => s.push);
  const storeUndo = useCanvasStore((s) => s.undo);
  const storeRedo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.canUndo());
  const canRedo = useCanvasStore((s) => s.canRedo());
  const upsertMany = useCanvasStore((s) => s.upsertMany);
  const removeMany = useCanvasStore((s) => s.removeMany);

  const applyDelete = useCallback(async (objects: CanvasObject[]) => {
    if (!objects.length) return;
    const ids = objects.map((obj) => obj.id);
    removeMany(ids);
    try {
      await deleteObjects({ canvasId, objectIds: ids });
    } catch (error) {
      console.error("Failed to delete objects during undo/redo", error);
      toast({
        title: "Delete failed",
        description: "We couldn't delete objects. Please try again.",
        variant: "destructive",
      });
    }
  }, [canvasId, removeMany, toast]);

  const applyCreate = useCallback(async (objects: CanvasObject[]) => {
    if (!objects.length) return;
    upsertMany(objects);
    await Promise.all(objects.map(async (object) => {
      try {
        await createObject({ canvasId, object });
      } catch (error) {
        console.error("Failed to create object during undo/redo", error);
        toast({
          title: "Create failed",
          description: "We couldn't restore objects. Please try again.",
          variant: "destructive",
        });
      }
    }));
  }, [canvasId, upsertMany, toast]);

  const applyUpdate = useCallback(async (entries: UpdateOperationEntry[], useAfter: boolean) => {
    if (!entries.length) return;
    const state = (useCanvasStore as any).getState();
    const patches = entries.map((entry) => ({
      id: entry.id,
      patch: useAfter ? entry.after : entry.before,
    }));

    const optimisticObjects: CanvasObject[] = [];
    for (const { id, patch } of patches) {
      if (!Object.keys(patch).length) continue;
      const current = state.objects[id];
      if (!current) continue;
      optimisticObjects.push({
        ...current,
        props: {
          ...current.props,
          ...patch,
        },
        updatedBy: userId,
        updatedAt: Date.now(),
      });
    }

    if (optimisticObjects.length) {
      state.upsertMany(optimisticObjects);
    }

    await Promise.all(patches.map(async ({ id, patch }) => {
      if (!Object.keys(patch).length) return;
      const latest = (useCanvasStore as any).getState().objects[id];
      if (!latest) return;
      try {
        await commitObject({
          canvasId,
          objectId: id,
          expectedVersion: latest.v,
          patch,
          userId,
        });
      } catch (error) {
        console.error("Failed to apply update during undo/redo", error);
        toast({
          title: "Update failed",
          description: "We couldn't update object state. Please retry.",
          variant: "destructive",
        });
      }
    }));
  }, [canvasId, toast, userId]);

  const pushCreate = useCallback((objects: CanvasObject[]) => {
    if (!objects.length) return;
    push({ type: "create", objects: objects.map(cloneObject) });
  }, [push]);

  const pushDelete = useCallback((objects: CanvasObject[]) => {
    if (!objects.length) return;
    push({ type: "delete", objects: objects.map(cloneObject) });
  }, [push]);

  const pushUpdate = useCallback((entries: UpdateOperationEntry[]) => {
    if (!entries.length) return;
    push({ type: "update", entries: cloneEntries(entries) });
  }, [push]);

  const undo = useCallback(async () => {
    const operation = storeUndo();
    if (!operation) return false;

    switch (operation.type) {
      case "create":
        await applyDelete(operation.objects);
        break;
      case "delete":
        await applyCreate(operation.objects);
        break;
      case "update":
        await applyUpdate(operation.entries, false);
        break;
      default:
        break;
    }
    return true;
  }, [applyCreate, applyDelete, applyUpdate, storeUndo]);

  const redo = useCallback(async () => {
    const operation = storeRedo();
    if (!operation) return false;

    switch (operation.type) {
      case "create":
        await applyCreate(operation.objects);
        break;
      case "delete":
        await applyDelete(operation.objects);
        break;
      case "update":
        await applyUpdate(operation.entries, true);
        break;
      default:
        break;
    }
    return true;
  }, [applyCreate, applyDelete, applyUpdate, storeRedo]);

  return useMemo(
    () => ({
      pushCreate,
      pushDelete,
      pushUpdate,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [canRedo, canUndo, pushCreate, pushDelete, pushUpdate, redo, undo]
  );
}


