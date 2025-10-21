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

function ObjectRenderer({ id }: { id: string }) {
  const object = useCanvasStore((s) => s.objects[id]);
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
  const ids = useMemo(() => Object.keys(objects), [objects]);
  return (
    <Layer>
      <Group listening={false}>
        {ids.map((id) => (
          <ObjectRenderer key={id} id={id} />
        ))}
      </Group>
    </Layer>
  );
}


