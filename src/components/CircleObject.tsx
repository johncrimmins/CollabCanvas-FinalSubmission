"use client";

import { Circle } from "react-konva";
import type { CanvasObject } from "@/lib/types";

export function CircleObject(
  {
    props,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    listening = true,
  }: {
    props: CanvasObject["props"]; onMouseDown?: (e:any)=>void; onMouseMove?: (e:any)=>void; onMouseUp?: (e:any)=>void; listening?: boolean;
  }
) {
  return (
    <Circle
      x={props.x}
      y={props.y}
      radius={props.r ?? 40}
      fill={props.fill ?? "#94a3b8"}
      listening={listening}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}


