"use client";

import { cn } from "@/lib/utils";
import { CanvasDiagnosticsPanel } from "@/components/layout/CanvasDiagnosticsPanel";

export function CanvasLayout({
  toolbar,
  stage,
  presence,
  status,
  diagnostics,
}: {
  toolbar: React.ReactNode;
  stage: React.ReactNode;
  presence: React.ReactNode;
  status: React.ReactNode;
  diagnostics?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-gradient-to-br",
        "from-slate-50 via-white to-slate-100",
        "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      )}
    >
      <header className="border-b border-slate-200/60 bg-white/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex-1">{toolbar}</div>
          <div>{status}</div>
        </div>
      </header>
      <main className="relative flex flex-1 overflow-hidden">
        <div className="relative flex w-full flex-1 items-stretch justify-stretch overflow-hidden">
          {stage}
          <div className="pointer-events-none absolute inset-0">{presence}</div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          {diagnostics ?? <CanvasDiagnosticsPanel />}
        </div>
      </main>
    </div>
  );
}

