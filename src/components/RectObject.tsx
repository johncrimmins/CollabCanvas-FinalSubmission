"use client";

import { Rect } from "react-konva";
import type { CanvasObject } from "@/lib/types";

export function RectObject(
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
    <Rect
      x={props.x}
      y={props.y}
      width={props.w ?? 100}
      height={props.h ?? 80}
      fill={props.fill ?? "#94a3b8"}
      cornerRadius={6}
      listening={listening}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}


