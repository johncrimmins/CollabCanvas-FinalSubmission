"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthGuard();
  const router = useRouter();
  const [timeout, setTimeout] = useState(false);

  useEffect(() => {
    // Redirect to auth page if not authenticated
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Set timeout to show error if loading takes too long (Firebase not configured)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (loading) {
        setTimeout(true);
      }
    }, 3000); // 3 seconds timeout

    return () => window.clearTimeout(timer);
  }, [loading]);

  // Show loading state during initial auth check
  if (loading && !timeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-600 dark:text-slate-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show error if loading is stuck (Firebase not configured)
  if (loading && timeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Firebase Not Configured</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <p>
              Firebase environment variables are missing or incorrect.
            </p>
            <p className="font-semibold">Steps to fix:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Follow the guide in <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">FIREBASE-SETUP.md</code></li>
              <li>Create <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env.local</code> in the project root</li>
              <li>Add your Firebase configuration (see <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ENV.md</code>)</li>
              <li>Restart the dev server: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">npm run dev</code></li>
            </ol>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Check the browser console for more details.
            </p>
          </div>
          <Button
            onClick={() => window.location.href = "/auth"}
            className="w-full"
            variant="outline"
          >
            Go to Auth Page
          </Button>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  // Render children when authenticated
  return <>{children}</>;
}

