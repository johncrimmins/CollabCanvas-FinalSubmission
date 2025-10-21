"use client";

import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConnectionIndicatorProps {
  isConnected?: boolean;
}

export function ConnectionIndicator({ isConnected = false }: ConnectionIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
        "border-slate-200/70 bg-white/80 text-slate-600 dark:border-slate-800/70",
        "dark:bg-slate-900/80 dark:text-slate-300"
      )}
    >
      {isConnected ? (
        <Wifi className="h-4 w-4 text-emerald-500" aria-hidden />
      ) : (
        <WifiOff className="h-4 w-4 text-amber-500" aria-hidden />
      )}
      <span className="font-medium">
        {isConnected ? "Live" : "Connecting"}
      </span>
    </div>
  );
}

