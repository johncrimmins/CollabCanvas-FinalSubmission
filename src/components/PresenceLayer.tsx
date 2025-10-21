"use client";

import { useMemo } from "react";
import { useCanvasStore } from "@/store";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

export function PresenceLayer() {
  const cursors = useCanvasStore((s) => s.cursors);
  const previews = useCanvasStore((s) => s.previews);
  const peers = useCanvasStore((s) => s.peers);
  const stagePos = useCanvasStore((s) => s.stagePos);
  const stageScale = useCanvasStore((s) => s.stageScale);
  const myUserId = auth.currentUser?.uid || null;

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
            left: `${preview.props?.x ?? 0}px`,
            top: `${preview.props?.y ?? 0}px`,
          }}
        >
          Preview
        </div>
      ))}

      {cursorEntries.map((cursor) => {
        if (myUserId && cursor.userId === myUserId) return null; // hide my own cursor overlay
        const peer = peers[cursor.userId];
        const label = peer?.name || cursor.userId;
        // Convert stage coordinates to screen space (account for stage transform)
        const screenX = stagePos.x + cursor.x * stageScale;
        const screenY = stagePos.y + cursor.y * stageScale;
        return (
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
              "--x": `${screenX}px`,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore custom vars
              "--y": `${screenY}px`,
            }}
          >
            {/* Cursor icon with peer color */}
            <svg width="14" height="14" viewBox="0 0 24 24" className="drop-shadow-sm">
              <path d="M3 2l7 18 2-7 7-2z" fill={peer?.color || "#64748b"} stroke="white" strokeWidth="1" />
            </svg>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur"
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                color: "#111827",
                borderRadius: 9999,
                border: "1px solid rgba(203,213,225,0.8)",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

