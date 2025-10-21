"use client";

import { forwardRef } from "react";
import { Circle } from "react-konva";
import type { CanvasObject } from "@/lib/types";

export const CircleObject = forwardRef<any, { props: CanvasObject["props"]; onMouseDown?: (e:any)=>void; onMouseMove?: (e:any)=>void; onMouseUp?: (e:any)=>void; listening?: boolean }>(
  ({ props, onMouseDown, onMouseMove, onMouseUp, listening = true }, ref) => {
    return (
      <Circle
        ref={ref}
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
);


