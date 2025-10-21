import { describe, it, expect, beforeEach } from "vitest";
import { createCanvasStore } from "@/store";

describe("objects slice", () => {
  let store = createCanvasStore();

  beforeEach(() => {
    store = createCanvasStore();
  });

  it("upserts objects", () => {
    const object = {
      id: "obj-1",
      type: "rect" as const,
      props: { x: 0, y: 0, w: 100, h: 80 },
      v: 1,
      updatedBy: "user-1",
      updatedAt: Date.now(),
    };

    store.getState().upsertMany([object]);
    expect(store.getState().objects[object.id]).toEqual(object);
  });

  it("removes objects", () => {
    const object = {
      id: "obj-1",
      type: "rect" as const,
      props: { x: 0, y: 0, w: 100, h: 80 },
      v: 1,
      updatedBy: "user-1",
      updatedAt: Date.now(),
    };
    store.getState().upsertMany([object]);
    store.getState().removeMany([object.id]);
    expect(store.getState().objects[object.id]).toBeUndefined();
  });
});

