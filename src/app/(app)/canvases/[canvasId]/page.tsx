"use client";

import { useParams } from "next/navigation";
import { CanvasLayout } from "@/components/CanvasLayout";
import { CanvasProviders } from "@/context/CanvasProviders";
import { Toolbar } from "@/components/Toolbar";
import { CanvasStage } from "@/components/CanvasStage";
import { PresenceLayer } from "@/components/PresenceLayer";
import { ConnectionIndicator } from "@/components/ConnectionIndicator";
import { useCanvasConnectionStatus } from "@/hooks/useCanvasConnectionStatus";
import { CanvasDiagnosticsRunner } from "@/components/layout/CanvasDiagnosticsRunner";

export default function CanvasPage() {
  const params = useParams();
  const canvasId = params.canvasId as string;
  const { isConnected } = useCanvasConnectionStatus();

  return (
    <CanvasProviders canvasId={canvasId}>
      <CanvasLayout
        toolbar={<Toolbar activeTool="select" />}
        stage={<CanvasStage emptyMessage={`Canvas ${canvasId} is ready for infrastructure wiring`} />}
        presence={<PresenceLayer />}
        status={<ConnectionIndicator isConnected={isConnected} />}
        diagnostics={<CanvasDiagnosticsRunner canvasId={canvasId} />}
      />
    </CanvasProviders>
  );
}

