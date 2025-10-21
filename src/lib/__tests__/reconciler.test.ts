import { describe, it, expect } from "vitest";
import { selectRenderProps } from "@/lib/reconciler";
import type { CanvasObject } from "@/lib/types";

const baseObject: CanvasObject = {
  id: "obj-1",
  type: "rect",
  props: { x: 10, y: 20, w: 100, h: 80 },
  v: 1,
  updatedBy: "user-1",
  updatedAt: Date.now(),
};

describe("reconciler", () => {
  it("prefers local intent", () => {
    const result = selectRenderProps(baseObject, {
      "obj-1": { kind: "move", props: { x: 50 }, seq: 1 },
    }, {});

    expect(result.source).toBe("localIntent");
    expect(result.derivedProps.x).toBe(50);
  });

  it("falls back to previews", () => {
    const result = selectRenderProps(baseObject, {}, {
      "obj-1": { by: "user-2", seq: 1, at: Date.now(), props: { x: 60 } },
    });

    expect(result.source).toBe("preview");
    expect(result.derivedProps.x).toBe(60);
  });

  it("uses truth when no overrides", () => {
    const result = selectRenderProps(baseObject, {}, {});
    expect(result.source).toBe("truth");
    expect(result.derivedProps.x).toBe(baseObject.props.x);
  });
});

