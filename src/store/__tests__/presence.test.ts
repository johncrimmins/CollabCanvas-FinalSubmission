import { describe, it, expect, beforeEach } from "vitest";
import { createCanvasStore } from "@/store";

describe("presence slice", () => {
  let store = createCanvasStore();

  beforeEach(() => {
    store = createCanvasStore();
  });

  it("hydrates presence state", () => {
    store.getState().hydratePeers({
      "user-1": { userId: "user-1", name: "User 1", color: "#f00", at: Date.now() },
    });
    expect(Object.keys(store.getState().peers)).toEqual(["user-1"]);

    store.getState().hydrateCursors({
      "user-1": { userId: "user-1", x: 20, y: 30, tool: "select", at: Date.now() },
    });
    expect(store.getState().cursors["user-1"].x).toBe(20);

    store.getState().hydrateEditing({
      obj1: { "user-1": { userId: "user-1", at: Date.now() } },
    });
    expect(store.getState().editing.obj1["user-1"]).toBeDefined();

    store.getState().hydratePreviews({
      obj1: { by: "user-1", seq: 1, at: Date.now(), props: { x: 12 } },
    });
    expect(store.getState().previews.obj1.props.x).toBe(12);
  });

  it("prunes entries by TTL", () => {
    const now = Date.now();
    store.getState().hydratePeers({
      stale: { userId: "stale", name: "Stale", color: "#000", at: now - 5000 },
      fresh: { userId: "fresh", name: "Fresh", color: "#fff", at: now },
    });
    store.getState().pruneByTTL(1000, now);
    expect(store.getState().peers.stale).toBeUndefined();
    expect(store.getState().peers.fresh).toBeDefined();
  });
});

