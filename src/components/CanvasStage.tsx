"use client";

import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import type { Stage as KonvaStageType } from "konva/lib/Stage";
import { Layer as KonvaLayer, Stage as KonvaStage } from "react-konva";
import { ObjectsLayer } from "@/components/ObjectsLayer";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/store";
import { useCanvasId } from "@/context/CanvasContext";
import { auth } from "@/lib/firebase";
import { publishCursor } from "@/lib/rtdbClient";
import { useCanvasInteractionsContext } from "@/context/CanvasInteractionsContext";

export interface CanvasStageProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  onStageRef?: (stage: KonvaStageType | null) => void;
}

export function CanvasStage({
  children,
  width,
  height,
  onStageRef,
}: CanvasStageProps) {

  // Container sizing
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<KonvaStageType | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: width ?? 0,
    h: height ?? 0,
  });

  useEffect(() => {
    if (width && height) {
      setSize({ w: width, h: height });
      return;
    }
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [width, height]);

  const handleStageRef = useCallback(
    (node: KonvaStageType | null) => {
      stageRef.current = node;
      onStageRef?.(node);
    },
    [onStageRef]
  );

  // Canvas identity and user context
  const canvasId = useCanvasId();
  const userId = auth.currentUser?.uid || "anon";
  const tool = useCanvasStore((s) => s.tool);
  const { createRect, createCircle, handleKeyDown } = useCanvasInteractionsContext();

  // Pan & Zoom state
  const stagePos = useCanvasStore((s) => s.stagePos);
  const stageScale = useCanvasStore((s) => s.stageScale);
  const setStageTransform = useCanvasStore((s) => s.setStageTransform);
  const isSpaceDownRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") isSpaceDownRef.current = true;
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") isSpaceDownRef.current = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const oldScale = stageScale;
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const newScale = clamp(oldScale * (direction > 0 ? 1 / scaleBy : scaleBy), 0.1, 8);
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStageTransform(newPos, newScale);
  }, [setStageTransform, stagePos.x, stagePos.y, stageScale]);

  const handleMouseDown = useCallback((e: any) => {
    const isMiddle = e.evt?.button === 1;
    if (isMiddle || isSpaceDownRef.current) {
      isPanningRef.current = true;
      const stage = stageRef.current;
      const p = stage?.getPointerPosition();
      lastPointerRef.current = p ? { x: p.x, y: p.y } : null;
    }
  }, []);

  // Throttled cursor publisher
  const lastCursorTsRef = useRef<number>(0);
  const handleMouseMove = useCallback(() => {
    const stage = stageRef.current;
    const p = stage?.getPointerPosition();
    const now = Date.now();
    if (p && canvasId && userId) {
      // publish at ~50ms under motion
      if (now - lastCursorTsRef.current > 50) {
        lastCursorTsRef.current = now;
        publishCursor(canvasId, userId, { userId, x: p.x, y: p.y, tool, at: now });
      }
    }
    if (!isPanningRef.current) return;
    if (!p || !lastPointerRef.current) return;
    const dx = p.x - lastPointerRef.current.x;
    const dy = p.y - lastPointerRef.current.y;
    lastPointerRef.current = { x: p.x, y: p.y };
    setStageTransform({ x: stagePos.x + dx, y: stagePos.y + dy }, stageScale);
  }, [canvasId, setStageTransform, stagePos.x, stagePos.y, stageScale, tool, userId]);

  const endPan = useCallback(() => {
    isPanningRef.current = false;
    lastPointerRef.current = null;
  }, []);

  const cursorClass = isPanningRef.current || isSpaceDownRef.current ? "cursor-grabbing" : "cursor-default";

  const handleStageClick = useCallback(() => {
    if (tool === "rectangle" || tool === "circle") {
      const stage = stageRef.current;
      const p = stage?.getPointerPosition();
      if (!p) return;
      if (tool === "rectangle") void createRect(p.x, p.y);
      if (tool === "circle") void createCircle(p.x, p.y);
    }
  }, [createCircle, createRect, tool]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-1 items-center justify-center",
        "bg-white/80 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%)]",
        "dark:bg-slate-950",
        cursorClass
      )}
    >
      <KonvaStage
        width={size.w}
        height={size.h}
        ref={handleStageRef}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onClick={handleStageClick}
        listening={true}
      >
        <KonvaLayer>{children}</KonvaLayer>
        <ObjectsLayer />
      </KonvaStage>

      {null}
    </div>
  );
}

