import { describe, it, expect, beforeEach } from "vitest";
import { createCanvasStore } from "@/store";
import type { Patch, PatchBundle } from "@/store/types";

describe("undo slice", () => {
  let store = createCanvasStore();

  beforeEach(() => {
    store = createCanvasStore();
  });

  const createBundle = (label: string): PatchBundle => ({
    patches: [{ op: "replace", path: [label], value: label } as Patch],
    inversePatches: [{ op: "replace", path: [label], value: label } as Patch],
  });

  it("pushes and undoes history", () => {
    const bundleA = createBundle("a");
    const bundleB = createBundle("b");
    store.getState().push(bundleA);
    store.getState().push(bundleB);

    const undoResult = store.getState().undo();
    expect(undoResult).not.toBeNull();

    const redoResult = store.getState().redo();
    expect(redoResult).not.toBeNull();
  });

  it("clears history", () => {
    store.getState().push(createBundle("a"));
    store.getState().clearHistory();
    expect(store.getState().history.length).toBe(0);
    expect(store.getState().pointer).toBe(-1);
  });
});

