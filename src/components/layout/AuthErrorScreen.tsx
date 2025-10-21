"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorNotice } from "@/components/layout/ErrorNotice";

export interface AuthErrorScreenProps {
  onRetry?: () => void;
}

export function AuthErrorScreen({ onRetry }: AuthErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-slate-100 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <ErrorNotice
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40">
            <AlertCircle className="h-6 w-6" />
          </div>
        }
        title="Firebase configuration missing"
        description="We can’t connect to Firebase. Confirm your environment variables are set correctly."
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Follow these steps to resolve the issue:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Review <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">FIREBASE-SETUP.md</code>.
            </li>
            <li>
              Create <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">.env.local</code> in the project root.
            </li>
            <li>
              Populate the Firebase keys listed in <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">ENV.md</code>.
            </li>
            <li>
              Restart the dev server: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">npm run dev</code>.
            </li>
          </ol>
          <p className="text-xs text-slate-500 dark:text-slate-400">Check the browser console for additional details.</p>
        </div>
        <div className="flex justify-center pt-2">
          <Button variant="outline" className="gap-2" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </ErrorNotice>
    </div>
  );
}

