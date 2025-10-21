"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-sm border-slate-200/70 shadow-lg dark:border-slate-800/70">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Checking your session
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 dark:text-slate-300" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please hold on while we verify your authentication status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

