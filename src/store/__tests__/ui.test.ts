import { describe, it, expect, beforeEach } from "vitest";
import { createCanvasStore } from "@/store";

describe("ui slice", () => {
  let store = createCanvasStore();

  beforeEach(() => {
    store = createCanvasStore();
  });

  it("updates selected ids", () => {
    store.getState().setSelectedIds(["a", "b"]);
    expect(store.getState().selectedIds).toEqual(["a", "b"]);

    store.getState().clearSelection();
    expect(store.getState().selectedIds).toEqual([]);
  });

  it("manages local intent entries", () => {
    store
      .getState()
      .beginLocalIntent("obj-1", { kind: "move", props: { x: 10 }, seq: 1 });

    expect(store.getState().localIntent["obj-1"]).toEqual({
      kind: "move",
      props: { x: 10 },
      seq: 1,
    });

    store
      .getState()
      .updateLocalIntent("obj-1", { props: { x: 20 }, seq: 2 });

    expect(store.getState().localIntent["obj-1"]).toEqual({
      kind: "move",
      props: { x: 20 },
      seq: 2,
    });

    store.getState().endLocalIntent("obj-1");
    expect(store.getState().localIntent["obj-1"]).toBeUndefined();
  });
});

