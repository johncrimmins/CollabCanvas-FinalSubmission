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

// Dynamic import for CanvasStage to avoid SSR issues with Konva
const CanvasStage = dynamic(() => import("@/components/CanvasStage"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-lg text-gray-600">Loading canvas...</div>
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

