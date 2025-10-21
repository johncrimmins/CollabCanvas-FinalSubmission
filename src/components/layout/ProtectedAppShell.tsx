"use client";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

export interface ProtectedAppShellProps {
  children: React.ReactNode;
}

export function ProtectedAppShell({ children }: ProtectedAppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-slate-50 text-slate-900 transition-colors",
        "dark:bg-slate-950 dark:text-slate-50"
      )}
    >
      {children}
      <Toaster />
    </div>
  );
}

