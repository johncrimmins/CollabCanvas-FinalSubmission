"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/useSignOut";
import { useCanvasConnectionStatus } from "@/hooks/useCanvasConnectionStatus";
import { LogOut, Loader2 } from "lucide-react";

interface DashboardHeaderProps {
  greeting: string;
}

export function DashboardHeader({ greeting }: DashboardHeaderProps) {
  const { isConnected } = useCanvasConnectionStatus();
  const { signOutUser, signingOut } = useSignOut();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              CollabCanvas
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Welcome, {greeting}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isConnected
                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                }`}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {/* Sign Out Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOutUser({ redirectTo: "/auth" })}
              disabled={signingOut}
              className="gap-2"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}


