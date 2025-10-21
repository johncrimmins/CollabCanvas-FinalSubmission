"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { JoinCanvasCard } from "@/components/JoinCanvasCard";
import { StartCreatingCard } from "@/components/StartCreatingCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardPage() {
  const { user } = useAuthGuard();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardHeader greeting={user.displayName || user.email || ""} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <StartCreatingCard />
          <JoinCanvasCard />
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>Share your canvas ID with team members to collaborate in real-time</p>
            <p className="text-xs">Canvas sessions are automatically saved and can be accessed anytime</p>
          </div>
        </div>
      </main>
    </div>
  );
}

