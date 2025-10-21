import type { CanvasObject } from "./types";

export function calculateTransformProps(
  object: CanvasObject,
  pointer: { x: number; y: number },
  dragOffset: { dx: number; dy: number },
  baseProps: CanvasObject["props"]
): Partial<CanvasObject["props"]> {
  const dx = pointer.x + dragOffset.dx - (baseProps.x ?? 0);
  const dy = pointer.y + dragOffset.dy - (baseProps.y ?? 0);
  return {
    x: (baseProps.x ?? 0) + dx,
    y: (baseProps.y ?? 0) + dy,
  };
}

export function now(): number {
  return Date.now();
}

const PREVIEW_THROTTLE_MS = 80;

export class PreviewThrottler {
  private lastPreview = 0;
  private seq = 0;

  shouldThrottle(): boolean {
    const nowTs = now();
    if (nowTs - this.lastPreview < PREVIEW_THROTTLE_MS) {
      return true;
    }
    this.lastPreview = nowTs;
    this.seq += 1;
    return false;
  }

  getSeq(): number {
    return this.seq;
  }

  resetSeq(): void {
    this.seq = 0;
  }
}
