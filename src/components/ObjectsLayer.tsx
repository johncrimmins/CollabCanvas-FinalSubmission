"use client";

import { useMemo } from "react";
import { Layer, Group } from "react-konva";
import { useCanvasStore } from "@/store";
import { selectRenderProps } from "@/lib/reconciler";
import { RectObject } from "@/components/RectObject";
import { CircleObject } from "@/components/CircleObject";
import { useCanvasInteractions } from "@/hooks/useCanvasInteractions";
import { useCanvasId } from "@/context/CanvasContext";
import { auth } from "@/lib/firebase";
import { Rect } from "react-konva";

function ObjectRenderer({ id }: { id: string }) {
  const object = useCanvasStore((s) => s.objects[id]);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const localIntent = useCanvasStore((s) => s.localIntent);
  const previews = useCanvasStore((s) => s.previews);
  const canvasId = useCanvasId();
  const userId = auth.currentUser?.uid || "anon";
  const { getObjectHandlers } = useCanvasInteractions(canvasId, userId);

  if (!object) return null;
  const { derivedProps } = selectRenderProps(object, localIntent, previews);
  const handlers = getObjectHandlers(object);

  if (object.type === "rect") return <RectObject props={derivedProps} {...handlers} />;
  if (object.type === "circle") return <CircleObject props={derivedProps} {...handlers} />;

  return null;
}

export function ObjectsLayer() {
  const objects = useCanvasStore((s) => s.objects);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const ids = useMemo(() => Object.keys(objects), [objects]);
  return (
    <Layer>
      <Group listening={true}>
        {ids.map((id) => (
          <ObjectRenderer key={id} id={id} />
        ))}
        {/* selection overlay rectangles */}
        {ids.map((id) => {
          const obj = objects[id];
          const isSelected = selectedIds.includes(id);
          if (!isSelected || !obj) return null;
          const props = obj.props;
          const w = obj.type === "circle" ? (props.r ?? 40) * 2 : (props.w ?? 100);
          const h = obj.type === "circle" ? (props.r ?? 40) * 2 : (props.h ?? 80);
          return (
            <Rect
              key={`sel-${id}`}
              x={props.x - 4}
              y={props.y - 4}
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


