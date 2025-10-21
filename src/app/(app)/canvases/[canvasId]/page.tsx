"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { CanvasLayout } from "@/components/CanvasLayout";
import { CanvasProviders } from "@/context/CanvasProviders";
import { Toolbar } from "@/components/Toolbar";
import { PresenceLayer } from "@/components/PresenceLayer";
import { ConnectionIndicator } from "@/components/ConnectionIndicator";
import { useCanvasConnectionStatus } from "@/hooks/useCanvasConnectionStatus";
import { CanvasSubscriptions } from "@/components/layout/CanvasSubscriptions";

// Dynamically import CanvasStage to avoid SSR issues with Konva
const CanvasStage = dynamic(() => import("@/components/CanvasStage").then(mod => ({ default: mod.CanvasStage })), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-white/80 dark:bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading canvas...</p>
      </div>
    </div>
  ),
});

export default function CanvasPage() {
  const params = useParams();
  const canvasId = params.canvasId as string;
  const { isConnected } = useCanvasConnectionStatus();

  return (
    <CanvasProviders canvasId={canvasId}>
      <CanvasSubscriptions canvasId={canvasId} />
      <CanvasLayout
        toolbar={<Toolbar activeTool="select" />}
        stage={<CanvasStage />}
        presence={<PresenceLayer />}
        status={<ConnectionIndicator isConnected={isConnected} />}
        diagnostics={null}
      />
    </CanvasProviders>
  );
}

