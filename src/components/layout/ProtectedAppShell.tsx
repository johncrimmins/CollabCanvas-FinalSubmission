"use client";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { ProfileMenu } from "@/components/layout/ProfileMenu";

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
      <div className="relative">
        {/* Top-right profile/menu slot across app */}
        <div className="pointer-events-none absolute right-4 top-4 z-50">
          <div className="pointer-events-auto">
            <ProfileMenu />
          </div>
        </div>
        {children}
      </div>
      <Toaster />
    </div>
  );
}

