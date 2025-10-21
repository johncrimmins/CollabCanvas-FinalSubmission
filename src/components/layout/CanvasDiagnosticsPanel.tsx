"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCanvasStore } from "@/store";

export function CanvasDiagnosticsPanel() {
  const state = useCanvasStore((store) => ({
    objectCount: Object.keys(store.objects).length,
    peerCount: Object.keys(store.peers).length,
  }));

  return (
    <div className="pointer-events-none">
      <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/80">
        <CardContent className="pointer-events-auto flex gap-6 px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">Objects: {state.objectCount}</span>
          <span className="font-medium">Peers: {state.peerCount}</span>
        </CardContent>
      </Card>
    </div>
  );
}

