"use client";

import { useMemo } from "react";
import type { CursorState, PreviewState } from "@/store/types";
import { cn } from "@/lib/utils";

export interface PresenceLayerProps {
  cursors?: Record<string, CursorState>;
  previews?: PreviewState;
}

export function PresenceLayer({ cursors = {}, previews = {} }: PresenceLayerProps) {
  const cursorEntries = useMemo(() => Object.values(cursors), [cursors]);
  const previewEntries = useMemo(() => Object.entries(previews), [previews]);

  if (!cursorEntries.length && !previewEntries.length) {
    return null;
  }

  return (
    <div className="pointer-events-none relative h-full w-full">
      {previewEntries.map(([objectId, preview]) => (
        <div
          key={`preview-${objectId}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-dashed border-slate-400/70 bg-slate-100/40 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-600/70 dark:bg-slate-800/40 dark:text-slate-300"
          style={{
            left: `${preview.props.x ?? 0}px`,
            top: `${preview.props.y ?? 0}px`,
          }}
        >
          Preview
        </div>
      ))}

      {cursorEntries.map((cursor) => (
        <div
          key={cursor.userId}
          className={cn(
            "absolute top-0 left-0 flex translate-x-[var(--x)] translate-y-[var(--y)] items-center gap-2",
            "transition-transform duration-75"
          )}
          style={{
            // Using CSS custom properties to avoid re-rendering transforms
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore custom vars
            "--x": `${cursor.x}px`,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore custom vars
            "--y": `${cursor.y}px`,
          }}
        >
          <div className="h-3 w-3 rounded-full border border-white bg-slate-700 shadow-sm dark:border-slate-900" />
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
            {cursor.userId}
          </span>
        </div>
      ))}
    </div>
  );
}

