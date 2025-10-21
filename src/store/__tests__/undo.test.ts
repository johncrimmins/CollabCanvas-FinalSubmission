import { describe, it, expect, beforeEach } from "vitest";
import { createCanvasStore } from "@/store";
import type { CanvasOperation } from "@/store/types";

describe("undo slice", () => {
  let store = createCanvasStore();

  beforeEach(() => {
    store = createCanvasStore();
  });

  const createOperation = (label: string): CanvasOperation => ({
    type: "create",
    objects: [{ id: label, type: "rect", props: { x: 0, y: 0 }, v: 0, updatedBy: "test", updatedAt: 0 } as any],
  });

  it("pushes and undoes history", () => {
    const opA = createOperation("a");
    const opB = createOperation("b");
    store.getState().push(opA);
    store.getState().push(opB);

    const undoResult = store.getState().undo();
    expect(undoResult).not.toBeNull();

    const redoResult = store.getState().redo();
    expect(redoResult).not.toBeNull();
  });

  it("clears history", () => {
    store.getState().push(createOperation("a"));
    store.getState().clearHistory();
    expect(store.getState().history.length).toBe(0);
    expect(store.getState().pointer).toBe(-1);
  });
});

