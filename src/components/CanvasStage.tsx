"use client";

import { useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Stage as KonvaStageType } from "konva";
import { cn } from "@/lib/utils";

const KonvaStage = dynamic(() => import("react-konva").then((mod) => mod.Stage), {
  ssr: false,
});
const KonvaLayer = dynamic(() => import("react-konva").then((mod) => mod.Layer), {
  ssr: false,
});

export interface CanvasStageProps {
  children?: React.ReactNode;
  emptyMessage?: string;
  width?: number;
  height?: number;
  onStageRef?: (stage: KonvaStageType | null) => void;
}

export function CanvasStage({
  children,
  emptyMessage,
  width,
  height,
  onStageRef,
}: CanvasStageProps) {
  const message = useMemo(
    () => emptyMessage ?? "Canvas rendering infrastructure coming soon",
    [emptyMessage]
  );

  const handleStageRef = useCallback(
    (node: KonvaStageType | null) => {
      onStageRef?.(node);
    },
    [onStageRef]
  );

  return (
    <div
      className={cn(
        "relative flex flex-1 items-center justify-center",
        "bg-white/80 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%)]",
        "dark:bg-slate-950"
      )}
    >
      <KonvaStage
        width={width}
        height={height}
        ref={handleStageRef}
        listening={false}
      >
        <KonvaLayer>{children}</KonvaLayer>
      </KonvaStage>

      {!children && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/70 px-6 py-4 text-center shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70">
            <p className="font-medium text-slate-600 dark:text-slate-300">{message}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Tooling, Konva stage, and interactions will be wired in upcoming tasks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

