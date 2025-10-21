"use client";

import { useMemo, useRef, useEffect } from "react";
import { Layer, Group, Transformer } from "react-konva";
import { useCanvasStore } from "@/store";
import { selectRenderProps } from "@/lib/reconciler";
import { RectObject } from "@/components/RectObject";
import { CircleObject } from "@/components/CircleObject";
import { useCanvasId } from "@/context/CanvasContext";
import { useCanvasInteractionsContext } from "@/context/CanvasInteractionsContext";
import { Rect } from "react-konva";

function ObjectRenderer({ id, registerRef }: { id: string; registerRef: (id: string, node: any | null) => void }) {
  const object = useCanvasStore((s) => s.objects[id]);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const localIntent = useCanvasStore((s) => s.localIntent);
  const previews = useCanvasStore((s) => s.previews);
  const { getObjectHandlers } = useCanvasInteractionsContext();
  const nodeRef = useRef<any>(null);
  useEffect(() => {
    registerRef(id, nodeRef.current);
    return () => registerRef(id, null);
  }, [id, registerRef]);

  if (!object) return null;
  const { derivedProps } = selectRenderProps(object, localIntent, previews);
  const handlers = getObjectHandlers(object);

  if (object.type === "rect") return <RectObject ref={nodeRef} props={derivedProps} {...handlers} />;
  if (object.type === "circle") return <CircleObject ref={nodeRef} props={derivedProps} {...handlers} />;

  return null;
}

export function ObjectsLayer() {
  const objects = useCanvasStore((s) => s.objects);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const localIntent = useCanvasStore((s) => s.localIntent);
  const previews = useCanvasStore((s) => s.previews);
  const { beginTransform, updateTransform, endTransform } = useCanvasInteractionsContext();
  const transformerRef = useRef<any>(null);
  const nodeRefsByIdRef = useRef<Record<string, any>>({});
  const ids = useMemo(() => Object.keys(objects), [objects]);
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    if (selectedIds.length !== 1) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }
    const node = nodeRefsByIdRef.current[selectedIds[0]];
    if (node) {
      transformer.nodes([node]);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  const registerRef = (id: string, node: any | null) => {
    if (!node) {
      delete nodeRefsByIdRef.current[id];
    } else {
      nodeRefsByIdRef.current[id] = node;
    }
  };

  const handleTransformStart = () => {
    if (selectedIds.length !== 1) return;
    const id = selectedIds[0];
    const obj = (useCanvasStore as any).getState().objects[id];
    if (!obj) return;
    beginTransform(obj, null, "resize");
  };

  const handleTransform = () => {
    if (selectedIds.length !== 1) return;
    const id = selectedIds[0];
    const node = nodeRefsByIdRef.current[id];
    if (!node) return;
    if (node.className === "Rect") {
      const minW = 12;
      const minH = 12;
      const width = Math.max(minW, Math.round(node.width() * node.scaleX()));
      const height = Math.max(minH, Math.round(node.height() * node.scaleY()));
      const x = Math.round(node.x());
      const y = Math.round(node.y());
      node.scaleX(1);
      node.scaleY(1);
      updateTransform(id, { x, y, w: width, h: height });
    } else if (node.className === "Circle") {
      const minR = 8;
      const scaled = node.radius() * Math.max(node.scaleX(), node.scaleY());
      const r = Math.max(minR, Math.round(scaled));
      const x = Math.round(node.x());
      const y = Math.round(node.y());
      node.scaleX(1);
      node.scaleY(1);
      updateTransform(id, { x, y, r });
    }
  };

  const handleTransformEnd = async () => {
    if (selectedIds.length !== 1) return;
    const id = selectedIds[0];
    const state = (useCanvasStore as any).getState();
    const obj = state.objects[id];
    if (!obj) return;
    const latest = state.localIntent[id]?.props || {};
    await endTransform(id, [obj], { [id]: latest });
  };
  return (
    <Layer>
      <Group listening={true}>
        {ids.map((id) => (
          <ObjectRenderer key={id} id={id} registerRef={registerRef} />
        ))}
        {selectedIds.length === 1 ? (
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            keepRatio={false}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "top-center",
              "bottom-center",
              "middle-left",
              "middle-right",
            ]}
            onTransformStart={handleTransformStart}
            onTransform={handleTransform}
            onTransformEnd={handleTransformEnd}
          />
        ) : null}
        {/* selection overlay rectangles */}
        {ids.map((id) => {
          const obj = objects[id];
          const isSelected = selectedIds.includes(id);
          if (!isSelected || !obj) return null;

          // Use reconciled props for consistent positioning
          const { derivedProps } = selectRenderProps(obj, localIntent, previews);
          const w = obj.type === "circle" ? (derivedProps.r ?? 40) * 2 : (derivedProps.w ?? 100);
          const h = obj.type === "circle" ? (derivedProps.r ?? 40) * 2 : (derivedProps.h ?? 80);

          return (
            <Rect
              key={`sel-${id}`}
              x={derivedProps.x - 4}
              y={derivedProps.y - 4}
              width={w + 8}
              height={h + 8}
              strokeDash={[6, 4]}
              stroke={"#0ea5e9"}
              strokeWidth={1.5}
              listening={false}
            />
          );
        })}
      </Group>
    </Layer>
  );
}


